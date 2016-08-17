const google = require('googleapis')
const calendar = google.calendar('v3')
const moment = require('moment')
const storage = require('node-persist')
const path = require('path')
storage.initSync({dir: path.join(__dirname, '/../store')})

const auth = require('./auth.js')

const EVENT_NAME_PREFIX = 'SPC'
const CALENDAR_SUMMARY = 'spaced repetition reminders'

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
    } else {
      const eventList = []
      response.items.map((event) => {
        if (event.description !== undefined && event.description.indexOf(EVENT_NAME_PREFIX) >= 0) {
          eventList.push({
            id: event.id,
            spacedId: event.description.match(/^[\w]*_[0-9]*/)[0],
            summary: event.summary,
            description: event.description,
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date
          })
        }
      })
      callback(eventList)
    }
  })
}

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

const removeBySpacedId = function (spacedId) {
  list((eventsList) => {
    eventsList.map((event) => {
      if (event.spacedId === spacedId) {
        remove(event.id)
      }
    })
  })
}

const createEvent = (summary, description, startDate, id) => {
  return {
    summary,
    description: `${EVENT_NAME_PREFIX}_${id} ${description}`,
    'start': {'dateTime': startDate.format()},
    'end': {'dateTime': moment(startDate).add(1, 'hours').format()},
    'colorId': '10',
    'reminders': {
      'useDefault': false,
      'overrides': [
        {'method': 'popup', 'minutes': 0}
      ]
    }
  }
}

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

const getDates = function (intervals, timeFrame) {
  intervals.map((date) => {
    intervals[intervals.indexOf(date)] = moment().add(date, timeFrame).startOf('day').hours(17)
  })
  return intervals
}

// get the calendar and set ID; if none found, create new calendar
const getTheCalendar = (callback) => {
  calendar.calendarList.list({
    auth: auth.oauth2Client
  }, function (err, calendars) {
    if (err) {
      console.log('Calendar service err (listing calendars): ' + err)
      return
    }
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

const addMany = function (summary, description, options) {
  const intervals = [1, 10, 30, 60]
  getDates(intervals, 'days').map((date, i) => {
    add(createEvent(summary, `(${i + 1}/${intervals.length}) / ${description}`, date, options.id))
  })
}

module.exports = {
  list,
  addMany,
  removeBySpacedId,
  getTheCalendar
}
