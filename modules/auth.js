'use strict'

const google = require('googleapis')
const OAuth2 = google.auth.OAuth2
const path = require('path')

const store = require('./store.js')

// load env variables
const dotenv = require('dotenv')
dotenv.config({path: path.join(__dirname, '/../.env')})
dotenv.load()

// set up OAuth
const oauth2Client = new OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URL)
google.options({ auth: oauth2Client }) // set auth as a global default
//
const AUTH_URL = oauth2Client.generateAuthUrl({
  access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
  scope: 'https://www.googleapis.com/auth/calendar'
})

const authorize = function (res, req, callback) {
  readTokens(
    res,
    req,
    // if auth via tokens is possible, carry on
    () => {
      console.log('tokens read, authed')
      return callback()
    },
    // otherwise redirect to auth (web version) or start server (CLI version)
    () => {
      if (global.IS_CLI) {
        if (res !== null) {
          console.log('couldn\'t read tokens from file, proceeding to auth')
          return res.redirect(AUTH_URL)
        } else {
          console.log('authenticate via browser (localhost:3000/auth) and retry')
          require('./server.js').init()
          return
        }
      } else {
        console.log('couldn\'t read tokens from cookie, proceeding to auth')
        return res.redirect(AUTH_URL)
      }
    }
  )
}

// read/write creds
const storeTokens = (tokens, res = null) => {
  if (global.IS_CLI && tokens !== undefined) {
    console.log('storing tokens in store')
    store.set('CREDENTIALS', tokens)
  } else if (res) {
    console.log('storing tokens in cookie')
    store.set('CREDENTIALS', tokens, res)
  }
}
const readTokens = (res, req, successCallback, errorCallback) => {
  const tokens = store.get('CREDENTIALS', req)
  if (tokens === undefined) {
    return errorCallback()
  }
  console.log('read tokens successfully')

  oauth2Client.setCredentials(tokens)

  oauth2Client.refreshAccessToken(function (err, tokens) {
    if (err) {
      errorCallback()
      return err
    }

    oauth2Client.setCredentials(tokens)
    storeTokens(tokens, res)

    successCallback()
  })
}

module.exports = {
  oauth2Client,
  authorize,
  storeTokens
}
