import React from 'react'

import utils from './../utils'

export default class Form extends React.Component {
  constructor () {
    super()
    this.onSubmit = this.onSubmit.bind(this)
  }
  onSubmit (e) {
    e.preventDefault()
    utils.ajax({
      method: 'POST',
      url: '/api/add',
      data: {
        mode: this.refs.mode.value,
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
      <input type="text" id="f-mode" ref="mode" />
      <br />
      <label htmlFor="f-summary">summary</label>
      <input type="text" id="f-summary" ref="summary" />
      <br />
      <input type="submit" id="f-submit" className="btn" />
    </form>
  }
}
Form.propTypes = {
  onAddItem: React.PropTypes.func
}
