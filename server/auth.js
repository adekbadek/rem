'use strict'

const google = require('googleapis')
const userinfo = google.oauth2('v2').userinfo
const OAuth2 = google.auth.OAuth2
const path = require('path')

const store = require('./store.js')

// load env variables
if (process.env.HEROKU === undefined || process.env.HEROKU !== 'yes') {
  const dotenv = require('dotenv')
  dotenv.config({path: path.join(__dirname, '/../.env')})
  dotenv.load()
}

// set up OAuth
const oauth2Client = new OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URL)
google.options({ auth: oauth2Client }) // set auth as a global default
//
const AUTH_URL = oauth2Client.generateAuthUrl({
  access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
  scope: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/userinfo.profile']
})

const authorize = function (res, req, successCallback, errorCallback = null) {
  readTokens(
    res, req,
    // if auth via tokens is possible, carry on
    () => {
      console.log('tokens read, authed')
      return successCallback()
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
        if (errorCallback) {
          // used for index page
          errorCallback()
        } else {
          console.log('couldn\'t read tokens from cookie, proceeding to auth')
          return res.redirect(AUTH_URL)
        }
      }
    }
  )
}

const getUserInfo = (res) => {
  userinfo.get({
    auth: oauth2Client,
    fields: 'given_name,family_name'
  }, function (err, info) {
    if (err) {
      return console.log('Google service err (getting userinfo): ' + err)
    }
    store.set('USER_INFO', info, res)
  })
}

// read creds
const readTokens = (res, req, successCallback, errorCallback) => {
  const tokens = store.get('CREDENTIALS', req)
  if (tokens === undefined) {
    return errorCallback()
  }

  oauth2Client.setCredentials(tokens)
  console.log('TOKENS BEFORE REFRESHACCESSTOKEN:', tokens.refresh_token)
  store.set('CREDENTIALS', tokens, res)

  oauth2Client.refreshAccessToken(function (err, tokens) {
    if (err) {
      errorCallback()
      return console.log('Error in refreshAccessToken', err)
    }

    oauth2Client.setCredentials(tokens)
    console.log('TOKENS BEFORE REFRESHACCESSTOKEN:', tokens.refresh_token)
    store.set('CREDENTIALS', tokens, res)

    successCallback()
  })
}

module.exports = {
  oauth2Client,
  getUserInfo,
  authorize
}
