import React from 'react'

import utils from './../utils'

export default class ListElem extends React.Component {
  constructor () {
    super()
    // docs: "We recommend that you bind your event handlers in the constructor so they are only bound once for every instance:"
    this.removeReminder = this.removeReminder.bind(this)
  }
  removeReminder () {
    // optimistic update
    this.props.onRemoveItem(this.props.spcId)
    utils.ajax({method: 'POST', url: `/api/remove/${this.props.spcId}`}, (resp) => {
      console.log(resp)
    }, (err) => { console.log(err) })
  }
  render () {
    return <div>
      <span>{this.props.groupItem.summary} ({this.props.groupItem.events.length})</span>
      <button className="btn-small btn-delete" onClick={this.removeReminder}>delete</button>
    </div>
  }
}
ListElem.propTypes = {
  groupItem: React.PropTypes.object,
  spcId: React.PropTypes.string,
  onRemoveItem: React.PropTypes.func
}
