'use strict'

const express = require('express')
const path = require('path')

const auth = require('./modules/auth.js')
const events = require('./modules/events.js')
const cli = require('./modules/cli.js')
cli.init()

const app = express()

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

if (!cli.wasInvokedViaCLI()) {
  console.log('starting a server at localhost:3000')
  app.listen(3000)
}
