const express = require('express')

const auth = require('./modules/auth.js')
const events = require('./modules/events.js')

const app = express()

// get the calendar first
auth.authorize(null, () => {
  events.getTheCalendar(() => {

    events.removeBySpacedId('SPC_1')
    events.addMany('review x', 'descr here', {id: 1})

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
