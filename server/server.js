const express = require('express')
const cookieParser = require('cookie-parser')
const path = require('path')

const store = require('./store.js')

const init = () => {
  // TODO: for some reason, events and auth return empty obj's when assigned out of init()
  const events = require('./events.js')
  const auth = require('./auth.js')

  const app = express()
  app.use(cookieParser())

  // views and assets for web app
  app.set('views', './views')
  app.set('view engine', 'pug')
  app.use(express.static(path.join(__dirname, '../assets')))

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
      events.list(store.get('CALENDAR_ID', req), (events) => {
        return res.send(events)
      })
    })
  })

  // remove an event group
  app.get('/remove', function (req, res) {
    auth.authorize(res, req, () => {
      if (req.query.id !== undefined) {
        events.removeEvents(store.get('CALENDAR_ID', req), req.query.id)
        return res.send(`will remove ${req.query.id}`)
      } else {
        return res.send('provide an id for event group to remove')
      }
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

  // clear cookies
  app.get('/forget', function (req, res) {
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
        store.set('CREDENTIALS', tokens, res)

        auth.getUserInfo(res)

        // get/create the calendar first
        events.getTheCalendar(req, res, () => {
          return res.redirect('/auth')
        })
      }
    })
  })

  app.listen(3000)
}

module.exports = {
  init
}
