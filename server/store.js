const storage = require('node-persist')
const path = require('path')
storage.initSync({dir: path.join(__dirname, '/../server/store')})

const get = (what, res = null) => {
  if (global.IS_CLI) {
    return storage.getItem(what)
  } else if (res) {
    return res.cookies[what]
  }
}

const set = (key, value, res = null) => {
  if (global.IS_CLI) {
    return storage.setItem(key, value)
  } else if (res) {
    return res.cookie(key, value, { httpOnly: true, secure: true })
  }
}

module.exports = {
  get,
  set
}
