'use strict'

const google = require('googleapis')
const calendar = google.calendar('v3')
const moment = require('moment')
const storage = require('node-persist')
const path = require('path')
storage.initSync({dir: path.join(__dirname, '/../store')})

const auth = require('./auth.js')

const EVENT_NAME_PREFIX = 'SPC'
const CALENDAR_SUMMARY = 'spaced repetition reminders'

// get the calendar by ID from storage; if none found, create new calendar
const getTheCalendar = (callback) => {
  calendar.calendarList.list({
    auth: auth.oauth2Client
  }, function (err, calendars) {
    if (err) {
      console.log('Calendar service err (getting calendars): ' + err)
      return
    }
    // go through user's calendars to find the rem calendar
    calendars.items.map((calendar) => {
      if (calendar.summary === CALENDAR_SUMMARY) {
        storage.setItem('CALENDAR_ID', calendar.id)
      }
    })
    if (storage.getItem('CALENDAR_ID') !== undefined) {
      console.log('found cal, it\'s id is', storage.getItem('CALENDAR_ID'))
      if (callback !== null) { callback() }
    } else {
      console.log('did not find cal, creating one')

      calendar.calendars.insert({
        auth: auth.oauth2Client,
        resource: {
          summary: CALENDAR_SUMMARY
        }
      }, function (err, calendars) {
        if (err) {
          console.log('Calendar service err (adding calendar): ' + err)
          return
        }
        if (callback !== null) { callback() }
        console.log('created a calendar', calendars)
      })
    }
  })
}

// list events from the calendar
const list = function (callback) {
  calendar.events.list({
    auth: auth.oauth2Client,
    calendarId: storage.getItem('CALENDAR_ID'),
    timeMin: (new Date()).toISOString(),
    // maxResults: 20,
    singleEvents: true,
    orderBy: 'startTime'
  }, function (err, response) {
    if (err) {
      console.log('The API returned an error:', err)
      return
    }
    if (response.items.length === 0) {
      console.log('No upcoming events found.')
      callback([])
    } else {
      const eventList = []
      response.items.map((event) => {
        if (event.description !== undefined && event.description.indexOf(EVENT_NAME_PREFIX) === 0) {
          eventList.push({
            id: event.id,
            spacedId: event.description.match(/^[\w]*_[0-9]*/)[0],
            summary: event.summary,
            description: event.description,
            start: event.start.dateTime || event.start.date
          })
        }
      })
      callback(eventList)
    }
  })
}

// helper function for removeEvents
const remove = (eventId) => {
  calendar.events.delete({
    auth: auth.oauth2Client,
    calendarId: storage.getItem('CALENDAR_ID'),
    eventId
  }, (err) => {
    if (err) {
      console.log('Calendar service err (removing event): ' + err)
      return
    }
    console.log('removed event', eventId)
  })
}

// remove events - all or by ID
const removeEvents = function (spacedId) {
  list((eventsList) => {
    eventsList.map((event) => {
      if (spacedId !== undefined) {
        if (event.spacedId === spacedId) { remove(event.id) }
      } else {
        remove(event.id)
      }
    })
  })
}

// helper function for add
const createEvent = (summary, description, startDate, id) => {
  return {
    summary,
    description: `${EVENT_NAME_PREFIX}_${id} ${description}`,
    'start': {'dateTime': startDate.format()},
    'end': {'dateTime': moment(startDate).add(20, 'minutes').format()},
    'colorId': '10',
    'reminders': {
      'useDefault': false,
      'overrides': [
        {'method': 'popup', 'minutes': 0}
      ]
    }
  }
}

// add an event to calendar
const add = function (event) {
  calendar.events.insert({
    auth: auth.oauth2Client,
    calendarId: storage.getItem('CALENDAR_ID'),
    resource: event
  }, function (err, event) {
    if (err) {
      console.log('Calendar service err (adding event): ' + err)
      return
    }
    console.log('Event created:', event.start.dateTime)
  })
}

// get dates for spaced repetition reminders
const getDates = function (intervals, timeFrame, options) {
  intervals.map((date) => {
    if (options.allEventsAt5pm) {
      intervals[intervals.indexOf(date)] = moment().add(date, timeFrame).startOf('day').hours(17)
    } else {
      intervals[intervals.indexOf(date)] = moment().add(date, timeFrame)
    }
  })
  return intervals
}

// add multiple events to calendar
const addMany = function (summary, options) {
  let id = storage.getItem('CURRENT_ID') || 0
  const intervals = options.shortIntervals ? [1, 3, 24, 48] : [1, 10, 30, 60]
  getDates(intervals, (options.shortIntervals ? 'hours' : 'days'), {allEventsAt5pm: !options.shortIntervals}).map((date, i) => {
    add(createEvent(summary, `(${i + 1}/${intervals.length})${(options.description === undefined ? '' : ' / ' + options.description)}`, date, id))
  })
  storage.setItem('CURRENT_ID', id + 1)
}

module.exports = {
  list,
  addMany,
  removeEvents,
  getTheCalendar
}
