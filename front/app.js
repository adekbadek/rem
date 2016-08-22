const $ = require('jquery')

require('./style')

const removeEvent = (el) => {
  $.get(`/remove?id=${$(el).attr('data-toremove')}`, (data) => {
    $(el).parent().remove()
  })
}

const addEvent = (data) => {
  $.post({
    url: '/add',
    data: JSON.stringify({mode: data.mode, summary: data.summary}),
    contentType: 'application/json',
    success: (data) => {
      console.log(data)
      // TODO: update list
    }
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
      $(buttonEl).on('click', function () { removeEvent(this) })
      $(reminderEl).append(descrEl)
      $(reminderEl).append(buttonEl)
      $list.append(reminderEl)
    }
  })

  $('#add-form').on('submit', function (ev) {
    ev.preventDefault()
    const formData = $(this).serializeArray().reduce(function (a, x) { a[x.name] = x.value; return a }, {})
    addEvent(formData)
  })
})
