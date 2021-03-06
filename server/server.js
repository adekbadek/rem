const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const path = require('path')
const xssFilters = require('xss-filters')

const webpack = require('webpack')
const config = require('./../webpack.config.dev')
const compiler = webpack(config)

const store = require('./store.js')

const init = () => {
  // TODO: for some reason, events and auth return empty obj's when assigned out of init()
  const events = require('./events.js')
  const auth = require('./auth.js')

  const app = express()
  app.use(bodyParser.json())
  app.use(cookieParser())
  app.set('port', (process.env.PORT || 3000))

  if (app.settings.env === 'development' && !global.IS_CLI) {
    // React HotModuleReplacementPlugin
    app.use(require('webpack-dev-middleware')(compiler, {
      noInfo: true,
      publicPath: config.output.publicPath
    }))
    app.use(require('webpack-hot-middleware')(compiler))
  }

  // views and assets for web app
  app.set('views', './front/views')
  app.set('view engine', 'pug')
  app.use(express.static(path.join(__dirname, '../assets')))

  // all API calls need to be authorized
  app.all('/api/*', (req, res, next) => {
    auth.authorize(res, req, () => {
      next()
    }, () => {
      return res.send('unauthorized')
    })
  })

  // web app starting point
  app.get('/', function (req, res) {
    auth.authorize(res, req, () => {
      return res.render('index', {
        authorized: true,
        env: app.settings.env,
        userinfo: store.get('USER_INFO', req)
      })
    }, () => {
      return res.render('index', {
        authorized: false,
        env: app.settings.env
      })
    })
  })

  // list all events
  app.get('/api/list', function (req, res) {
    events.listAllEvents({calendarId: store.get('CALENDAR_ID', req)}, (events) => {
      return res.send(events)
    })
  })

  // add reminder
  app.post('/api/add', function (req, res) {
    if (req.body.summary && req.body.mode) {
      events.addMany(xssFilters.inHTMLData(req.body.summary), {
        shortIntervals: (req.body.mode === 'sh'),
        calendarId: store.get('CALENDAR_ID', req)
      }, (newEvent) => {
        return res.send(newEvent)
      })
    } else {
      res.status(400)
      return res.send('provide a mode and a summary for reminder to add')
    }
  })

  // remove a reminder
  app.post('/api/remove/:id', function (req, res) {
    if (req.params.id !== undefined) {
      events.removeEvents(store.get('CALENDAR_ID', req), xssFilters.inHTMLData(req.params.id))
      return res.send(`will remove ${req.params.id}`)
    } else {
      res.status(400)
      return res.send('provide an id for reminder to remove')
    }
  })

  // update a reminder
  app.post('/api/update/:id', function (req, res) {
    if (req.params.id !== undefined && req.body.eventSummary) {

      console.log(req.params.id, req.body.eventSummary)
      events.updateEvents(store.get('CALENDAR_ID', req), xssFilters.inHTMLData(req.params.id), xssFilters.inHTMLData(req.body.eventSummary))

      return res.send(`will update ${req.params.id}`)
    } else {
      // test that chaining
      res.status(400)
      return res.send('provide an id and eventSummary for reminder to update')
    }
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
  app.get('/logout', function (req, res) {
    auth.revoke()
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

  app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'))
  })
}

module.exports = {
  init
}
