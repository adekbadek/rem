const $ = require('jquery')

require('./style')

const removeEl = (el) => {
  $.get(`/remove?id=${$(el).attr('data-toremove')}`, (data) => {
    $(el).parent().remove()
  })
}

$(document).ready(function () {
  document.body.style.opacity = 1

  const $list = $('#list')

  $.get('/list', (data) => {
    for (var group in data) {
      const groupItem = data[group]
      let reminderEl = document.createElement('div')
      let descrEl = document.createElement('span')
      descrEl.innerHTML = `${groupItem.summary} (${groupItem.events.length})`
      let buttonEl = document.createElement('button')
      buttonEl.innerHTML = 'delete'
      $(buttonEl).attr('data-toremove', group)
      $(buttonEl).on('click', function () { removeEl(this) })
      $(reminderEl).append(descrEl)
      $(reminderEl).append(buttonEl)
      $list.append(reminderEl)
    }
  })
})
