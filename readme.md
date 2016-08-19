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

### REST

  - `/list` returns all events created with rem

## CLI

  - `$ node index.js <sh/lg> <summary>` - create events (first time it has to auth, so run from console and open localhost:3000)
    - `sh` creates four events - 1, 3, 24, 48 hours from now
    - `lg` creates four events - 1, 10, 30, 60 days from now (each day at 17:00)

  - `$ node index.js remove` - removes all events

## code

### events.js

  - event groups can be deleted via ID - `events.removeEvents(<ID>)`
  - `events.removeEvents()` will remove all events created with this app
