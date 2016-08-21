const express = require('express')
const cookieParser = require('cookie-parser')
const path = require('path')

const init = () => {
  // TODO: for some reason, events and auth return empty obj's when assigned out of init()
  const events = require('./events.js')
  const auth = require('./auth.js')

  const app = express()
  app.use(cookieParser())

  // web app starting point
  app.get('/', function (req, res) {
    return res.sendFile(path.join(__dirname, '/../front/index.html'))
  })

  // list all events created with rem
  app.get('/list', function (req, res) {
    auth.authorize(res, req, () => {
      events.list(req, (events) => {
        return res.send(events)
      })
    })
  })

  // url for authorizing app
  app.get('/auth', function (req, res) {
    auth.authorize(res, req, () => {
      if (req && req.cookies.CREDENTIALS) {
        return res.redirect('/')
      } else {
        return res.send('CLI authorization successful')
      }
    })
  })

  // clear cookie
  app.get('/forget', function (req, res) {
    console.log('remove cookies')
    res.clearCookie('CREDENTIALS')
    res.clearCookie('CALENDAR_ID')
    res.clearCookie('CURRENT_ID')
    return res.redirect('/')
  })

  // endpoint hit on OAuth callback:
  app.get('/authcallback', function (req, res) {
    auth.oauth2Client.getToken(res.req._parsedUrl.query.replace('code=', ''), function (err, tokens) {
      if (!err) {
        auth.oauth2Client.setCredentials(tokens)
        auth.storeTokens(tokens, res)

        // get/create the calendar first
        events.getTheCalendar(req, res, () => {
          return res.redirect('/auth')
        })
      }
    })
  })

  console.log('starting a server at localhost:3000')
  app.listen(3000)
}

module.exports = {
  init
}