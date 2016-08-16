const google = require('googleapis')
const calendar = google.calendar('v3')
const moment = require('moment')

const auth = require('./auth.js')

const retrieve = function (callback) {
  calendar.events.list({
    auth: auth.oauth2Client,
    calendarId: 'primary',
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
        eventList.push({
          summary: event.summary,
          start: event.start.dateTime || event.start.date,
          end: event.end.dateTime || event.end.date
        })
      })
      callback(eventList)
    }
  })
}

// TODO: function returning spaced repetition dates (using moment)
console.log(moment().format())

// TODO: a function that returns an event
let newEvent = {
  'summary': 'Test event hello',
  'description': 'Here is a desctiption for the event',
  'start': {
    'dateTime': '2016-08-17T09:00:00-04:00'
  },
  'end': {
    'dateTime': '2016-08-17T09:30:00-04:00'
  },
  'reminders': {
    'useDefault': false,
    'overrides': [
      {'method': 'popup', 'minutes': 10}
    ]
  }
}

const add = function (event) {
  calendar.events.insert({
    auth: auth.oauth2Client,
    calendarId: 'primary',
    resource: event
  }, function (err, event) {
    if (err) {
      console.log('There was an error contacting the Calendar service: ' + err)
      return
    }
    console.log('Event created: %s', event.htmlLink)
  })
}

module.exports = {
  retrieve,
  add
}
