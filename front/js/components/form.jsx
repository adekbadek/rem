import React from 'react'

import utils from './../utils'

export default class Form extends React.Component {
  constructor () {
    super()
    this.onSubmit = this.onSubmit.bind(this)
  }
  onSubmit (e) {
    e.preventDefault()
    let mode = null
    const radios = document.querySelectorAll('form input[type="radio"]')
    Array.prototype.forEach.call(radios, function (el, i) {
      if (el.checked) { mode = el.value }
    })
    utils.ajax({
      method: 'POST',
      url: '/api/add',
      data: {
        mode,
        summary: this.refs.summary.value
      }},
      (resp) => {
        this.props.onAddItem(JSON.parse(resp))
      },
      (err) => { console.log(err) }
    )
    this.refs.summary.value = ''
  }
  render () {
    return <form id="add-form" onSubmit={this.onSubmit}>
      <label htmlFor="f-mode">mode</label>
      <span className="radio">
        <input type="radio" name="mode" id="f-mode" value="sh" defaultChecked /><span>short</span>
      </span>
      <span className="radio">
        <input type="radio" name="mode" id="f-mode" value="lg" /><span>long</span>
      </span>
      <br />
      <label htmlFor="f-summary">summary</label>
      <input type="text" id="f-summary" ref="summary" />
      <br />
      <input type="submit" id="f-submit" className="btn" value="add" />
    </form>
  }
}
Form.propTypes = {
  onAddItem: React.PropTypes.func
}
