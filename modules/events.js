const google = require('googleapis')
const calendar = google.calendar('v3')
const moment = require('moment')

const auth = require('./auth.js')

const EVENT_NAME_PREFIX = 'SPC'
const CALENDAR_ID = 'primary'

const list = function (callback) {
  calendar.events.list({
    auth: auth.oauth2Client,
    calendarId: CALENDAR_ID,
    timeMin: (new Date()).toISOString(),
    maxResults: 5,
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
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date
          })
        }
      })
      callback(eventList)
    }
  })
}

// TODO: function returning spaced repetition dates (using moment)
// console.log(moment().format())

const createEvent = (summary, description, startDate, id) => {
  return {
    summary,
    description: `${EVENT_NAME_PREFIX}_${id} ${description}`,
    'start': {'dateTime': startDate.format()},
    'end': {'dateTime': moment(startDate).add(1, 'hours').format()},
    'reminders': {
      'useDefault': false,
      'overrides': [
        {'method': 'popup', 'minutes': 0}
      ]
    }
  }
}

const remove = (eventId) => {
  calendar.events.delete({
    auth: auth.oauth2Client,
    calendarId: CALENDAR_ID,
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

const add = function (event) {
  calendar.events.insert({
    auth: auth.oauth2Client,
    calendarId: CALENDAR_ID,
    resource: event
  }, function (err, event) {
    if (err) {
      console.log('Calendar service err (adding event): ' + err)
      return
    }
    console.log('Event created: %s', event.htmlLink)
  })
}

module.exports = {
  list,
  add,
  removeBySpacedId,
  createEvent
}
