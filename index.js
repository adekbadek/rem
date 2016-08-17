const express = require('express')

const auth = require('./modules/auth.js')
const events = require('./modules/events.js')

const app = express()

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

app.get('/list', function (req, res) {
  auth.authorize(res, () => {
    events.list((events) => {
      return res.send(events)
    })
  })
})

app.get('/', function (req, res) {
  auth.authorize(res, () => {
    return res.send('auth successful')
  })
})

// run directly in script
auth.authorize(null, () => {
  // always get the calendar first
  events.getTheCalendar(() => {

    events.removeBySpacedId('SPC_1')
    events.addMany('review x', 'descr here', {id: 1})

  })
})

app.listen(3000)
