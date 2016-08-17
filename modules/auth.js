const google = require('googleapis')
const OAuth2 = google.auth.OAuth2
const path = require('path')
const storage = require('node-persist')
storage.initSync({dir: path.join(__dirname, '/../store')})

// load env variables
require('dotenv').load()

// setting up OAuth
const oauth2Client = new OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URL)
google.options({ auth: oauth2Client }) // set auth as a global default
//
const AUTH_URL = oauth2Client.generateAuthUrl({
  access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
  scope: 'https://www.googleapis.com/auth/calendar'
})

const authorize = function (res, callback) {
  // if auth via stored tokens is possible, do stuff
  readTokens(
    () => {
      console.log('tokens read, authed')
      callback()
    },
    () => {
      if (res !== null) {
        console.log('couldn\'t read tokens from file, proceeding to auth')
        return res.redirect(AUTH_URL)
      } else {
        console.log('you gotta auth via browser')
        return
      }
    }
  )
}

// read/write creds
const storeTokens = (tokens) => {
  if (tokens !== undefined) {
    console.log('storing tokens in store')
    storage.setItem('CREDENTIALS', tokens)
  }
}
const readTokens = (successCallback, errorCallback) => {
  const tokens = storage.getItem('CREDENTIALS')
  if (tokens === undefined) {
    errorCallback()
    return
  }
  console.log('read tokens successfully')

  oauth2Client.setCredentials(tokens)

  oauth2Client.refreshAccessToken(function (err, tokens) {
    if (err) {
      errorCallback()
      return err
    }

    oauth2Client.setCredentials(tokens)
    storeTokens(tokens)

    successCallback()
  })
}

module.exports = {
  oauth2Client,
  authorize,
  storeTokens,
  readTokens
}
