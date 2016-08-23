# rem

  - two ways to use it:
    1. web - *in progress*
      - web app
      - REST API
    2. CLI (see below)

  - in gcal, description of every event contains
    - the ID of this events group
    - the position of the reminder in group (e.g. `(2/4)`)

## Web

### REST API

  look in `server/server.js`

## CLI

  - `$ node index.js <sh/lg> <summary>` - create events (first time it has to auth, so run from console and open localhost:3000)
    - `sh` creates four events - 1, 3, 24, 48 hours from now
    - `lg` creates four events - 1, 10, 30, 60 days from now (each day at 17:00)

  - `$ node index.js remove` - removes all upcoming events
  - `$ node index.js revoke` - revoke access (logout)

## code

### authentication

  using OAuth2 Google library

  creds are stored in locally in files (node-persist library) or in cookies

### events.js

  - event groups can be deleted via ID - `events.removeEvents(<CALENDAR_ID>, <ID>)`
  - `events.removeEvents(<CALENDAR_ID>)` will remove all upcoming events created with this app

## quirks

  because of how [Google OAuth works](http://stackoverflow.com/a/10857806/3772847) you can only be 'logged in' on CLI or web app version simultaneously :(

  ([remove access here](https://security.google.com/settings/security/permissions) if it auth trouble)
