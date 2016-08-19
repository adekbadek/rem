const auth = require('./auth.js')
const events = require('./events.js')

// arguments passed to script (non-web version)
const args = process.argv.slice(2)
const mode = args[0]
const summary = args.slice(1).join(' ')

const init = () => {
  if (mode) {
    // get the calendar first
    auth.authorize(null, () => {
      events.getTheCalendar(() => {
        if (mode === 'remove') {
          console.log('removing all events...')
          events.removeEvents()
        } else if (mode.length > 0 && summary.length > 0) {
          events.addMany(summary, {shortIntervals: (mode === 'sh')})
          // TODO: wait for all add/remove callbacks
          setTimeout(() => { process.exit(-1) }, 10000)
        }
      })
    })
  }
}

const wasInvokedViaCLI = () => {
  return args.length >= 2 && mode.length > 0 && summary.length > 0
}

module.exports = {
  init,
  wasInvokedViaCLI
}
