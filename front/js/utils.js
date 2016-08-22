const ajax = (options, successCallback, errorCallback) => {
  const xhr = new XMLHttpRequest()
  xhr.open(options.method, options.url)
  xhr.onload = function () {
    if (xhr.status === 200) {
      successCallback(xhr.responseText)
    } else {
      errorCallback(xhr.status)
    }
  }
  if (options.data) {
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(JSON.stringify(options.data))
  } else {
    xhr.send()
  }
}

module.exports = {
  ajax
}
