'use strict'

// arguments passed to script
const args = process.argv.slice(2)

// if there are args passed, run CLI, otherwise start server
if (args.length >= 1) {
  console.log('init as CLI')

  global.IS_CLI = true

  require('./modules/cli.js').init(args[0], args.slice(1).join(' '))
} else {
  console.log('init as SERVER')
  require('./modules/server.js').init()
}
