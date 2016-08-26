import React from 'react'

import utils from './../utils'

export default class ListElem extends React.Component {
  constructor (props) {
    super(props)

    // docs: "We recommend that you bind your event handlers in the constructor so they are only bound once for every instance:"
    this.removeReminder = this.removeReminder.bind(this)
    this.saveNewName = this.saveNewName.bind(this)
    this.handleNameInputChange = this.handleNameInputChange.bind(this)
    this.handleNameInputFocus = this.handleNameInputFocus.bind(this)
    this.handleNameInputBlur = this.handleNameInputBlur.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)

    this.state = {
      name: this.props.groupItem.summary,
      changed: false,
      btnsOpacity: 0
    }
  }
  removeReminder () {
    // optimistic update
    this.props.onRemoveItem(this.props.spcId)
    utils.ajax({method: 'POST', url: `/api/remove/${this.props.spcId}`}, (resp) => {
      console.log(resp)
    }, (err) => { console.log(err) })
  }
  saveNewName (value) {
    if (this.state.changed) {
      this.setState({
        changed: false
      })
      utils.ajax({
        method: 'POST',
        url: `/api/update/${this.props.spcId}`,
        data: {eventSummary: value}
      }, (resp) => {
        console.log(resp)
      }, (err) => { console.log(err) })
    }
  }
  handleNameInputChange (event) {
    this.setState({
      name: event.target.value,
      changed: true
    })
  }
  handleNameInputFocus (event) {
    this.setState({ btnsOpacity: 1 })
  }
  handleNameInputBlur (event) {
    this.setState({ btnsOpacity: 0 })
    this.saveNewName(event.target.value)
  }
  handleKeyPress (event) {
    if (event.key === 'Enter') {
      this.saveNewName(event.target.value)
    }
  }
  render () {
    return <div>
      <span className="event-name">
        <input type="text" ref="eventNameInput" value={this.state.name} onChange={this.handleNameInputChange} onFocus={this.handleNameInputFocus} onBlur={this.handleNameInputBlur} onKeyPress={this.handleKeyPress} />
      </span>
      <button className="btn-small btn-delete" tabIndex="-1" onClick={this.removeReminder} style={{opacity: this.state.btnsOpacity}}>delete</button>
    </div>
  }
}
ListElem.propTypes = {
  groupItem: React.PropTypes.object,
  spcId: React.PropTypes.string,
  onRemoveItem: React.PropTypes.func
}
