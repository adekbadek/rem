'use strict'

const express = require('express')

const auth = require('./modules/auth.js')
const events = require('./modules/events.js')

const app = express()

// arguments passed to script (non-web version)
const args = process.argv.slice(2)
const mode = args[0]
const summary = args.slice(1).join(' ')

// get the calendar first
auth.authorize(null, () => {
  events.getTheCalendar(() => {

    events.removeEvents()

    if (args.length > 2 && mode.length > 0 && summary.length > 0) {
      events.addMany(summary, {shortIntervals: (mode === 'short')})
    }

  })
})

app.get('/', function (req, res) {
  auth.authorize(res, () => {
    return res.send('auth successful')
  })
})

app.get('/list', function (req, res) {
  auth.authorize(res, () => {
    events.list((events) => {
      return res.send(events)
    })
  })
})

// endpoint hit on OAuth callback:
app.get('/authcallback', function (req, res) {
  auth.oauth2Client.getToken(res.req._parsedUrl.query.replace('code=', ''), function (err, tokens) {
    if (!err) {
      auth.oauth2Client.setCredentials(tokens)
      auth.storeTokens(tokens)
      return res.redirect('/')
    }
  })
})

app.listen(3000)
