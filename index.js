const google = require('googleapis')
const OAuth2 = google.auth.OAuth2
const calendar = google.calendar('v3')
const express = require('express')
const fs = require('fs')
const path = require('path')

// load env variables
require('dotenv').load()

const TOKEN_PATH = path.join(__dirname, '/calendar-creds.json')

// setting up OAuth
const oauth2Client = new OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URL)
google.options({ auth: oauth2Client }) // set auth as a global default
//
const AUTH_URL = oauth2Client.generateAuthUrl({
  access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
  scope: 'https://www.googleapis.com/auth/calendar'
})
let AUTH_CODE = null

// init express
const app = express()

// endpoint hit on OAuth callback:
app.get('/authcallback', function (req, res) {
  AUTH_CODE = res.req._parsedUrl.query.replace('code=', '')
  oauth2Client.getToken(AUTH_CODE, function (err, tokens) {
    // Now tokens contains an access_token and an optional refresh_token. Save them.
    if (!err) {
      oauth2Client.setCredentials(tokens)
      storeTokens(tokens)

      return res.redirect('/')
    }
  })
})

app.get('/list', function (req, res) {
  authorize(res, () => {
    retrieveEvents((events) => {
      return res.send(events)
    })
  })
})

app.get('/', function (req, res) {
  authorize(res, () => {
    // addEvent(newEvent)

    return res.send('auth successful')
  })
})

const authorize = function (res, callback) {
  // if auth via stored tokens is possible, do stuff
  readTokens(
    () => {
      console.log('tokens read, authed')
      callback()
    },
    () => {
      console.log('couldn\'t read tokens from file, proceeding to auth')
      return res.redirect(AUTH_URL)
    }
  )
}

// read/write creds
const storeTokens = (tokens) => {
  fs.writeFile(TOKEN_PATH, JSON.stringify(tokens))
}
const readTokens = (successCallback, errorCallback) => {
  fs.readFile(TOKEN_PATH, 'utf8', (err, tokens) => {
    if (err) {
      errorCallback()
      return err
    }

    oauth2Client.setCredentials(JSON.parse(tokens))

    oauth2Client.refreshAccessToken(function (err, tokens) {
      if (err) {
        errorCallback()
        return err
      }

      oauth2Client.setCredentials(tokens)
      storeTokens(tokens)

      successCallback()
    })
  })
}

// TODO: a function that returns event
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

const addEvent = function (event) {
  calendar.events.insert({
    auth: oauth2Client,
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

const retrieveEvents = function (callback) {
  calendar.events.list({
    auth: oauth2Client,
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

app.listen(3000)
