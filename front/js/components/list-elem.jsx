import React from 'react'

import utils from './../utils'

export default class ListElem extends React.Component {
  constructor (props) {
    super(props)

    // docs: "We recommend that you bind your event handlers in the constructor so they are only bound once for every instance:"
    this.removeReminder = this.removeReminder.bind(this)
    this.handleNameChange = this.handleNameChange.bind(this)
    this.handleNameInputBlur = this.handleNameInputBlur.bind(this)

    this.state = {
      name: this.props.groupItem.summary,
      changed: false
    }
  }
  removeReminder () {
    // optimistic update
    this.props.onRemoveItem(this.props.spcId)
    utils.ajax({method: 'POST', url: `/api/remove/${this.props.spcId}`}, (resp) => {
      console.log(resp)
    }, (err) => { console.log(err) })
  }
  handleNameChange (event) {
    this.setState({
      name: event.target.value,
      changed: true
    })
  }
  handleNameInputBlur (event) {
    if (this.state.changed) {
      console.log(event.target.value, this.props.spcId)
      this.setState({
        changed: false
      })
      utils.ajax({
        method: 'POST',
        url: `/api/update/${this.props.spcId}`,
        data: {eventSummary: event.target.value}
      }, (resp) => {
        console.log(resp)
      }, (err) => { console.log(err) })
    }
  }
  render () {
    return <div>
      <span className="event-name">
        <input type="text" ref="eventNameInput" value={this.state.name} onChange={this.handleNameChange} onBlur={this.handleNameInputBlur} />
      </span>
      <button className="btn-small btn-delete" onClick={this.removeReminder}>delete</button>
    </div>
  }
}
ListElem.propTypes = {
  groupItem: React.PropTypes.object,
  spcId: React.PropTypes.string,
  onRemoveItem: React.PropTypes.func
}
