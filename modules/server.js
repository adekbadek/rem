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

  // url for CLI authorization
  app.get('/auth', function (req, res) {
    auth.authorize(res, () => {
      return res.send('authorization successful')
    })
  })

  // list all events created with rem
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
        return res.redirect('/auth')
        auth.storeTokens(tokens, res)
      }
    })
  })

  console.log('starting a server at localhost:3000')
  app.listen(3000)
}

module.exports = {
  init
}
