const auth = require('./auth.js')
const events = require('./events.js')

// mode is the first argument passed
// summary is all that follows
const init = (mode, summary) => {
  if (mode) {
    auth.authorize(null, null, () => {
      if (mode === 'remove') {
        console.log('removing all events...')
        events.removeEvents()
      } else if (mode.length > 0 && summary.length > 0) {
        events.addMany(summary, {shortIntervals: (mode === 'sh')})
        // TODO: wait for all add/remove callbacks
        setTimeout(() => { process.exit(-1) }, 10000)
      }
    })
  }
}

module.exports = {
  init
}
