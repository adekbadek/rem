const $ = require('jquery')

require('./style')

$(document).ready(function () {
  const $list = $('#list')

  $.get('/list', (data) => {
    for (var group in data) {
      group = data[group]
      let reminderEl = document.createElement('div')
      reminderEl.innerHTML = `${group.summary} (${group.events.length})`
      $list.append(reminderEl)
    }
  })
})
