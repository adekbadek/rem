const express = require('express')
const cookieParser = require('cookie-parser')

const store = require('./store.js')

const init = () => {
  // TODO: for some reason, events and auth return empty obj's when assigned out of init()
  const events = require('./events.js')
  const auth = require('./auth.js')

  const app = express()
  app.use(cookieParser())

  // views for web app
  app.set('views', './views')
  app.set('view engine', 'pug')

  // web app starting point
  app.get('/', function (req, res) {
    auth.authorize(res, req, () => {
      return res.render('index', {
        authorized: true,
        userinfo: store.get('USER_INFO', req)
      })
    }, () => {
      return res.render('index', {authorized: false})
    })
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
    for (var cookie in req.cookies) {
      res.clearCookie(cookie)
    }
    return res.redirect('/')
  })

  // endpoint hit on OAuth callback:
  app.get('/authcallback', function (req, res) {
    auth.oauth2Client.getToken(res.req._parsedUrl.query.replace('code=', ''), function (err, tokens) {
      if (!err) {
        auth.oauth2Client.setCredentials(tokens)
        auth.storeTokens(tokens, res)

        auth.getUserInfo(res)

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
