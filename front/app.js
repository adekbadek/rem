require('./style')

import React from 'react'
import { render } from 'react-dom'

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

class Form extends React.Component {
  constructor () {
    super()
    this.onSubmit = this.onSubmit.bind(this)
  }
  onSubmit (e) {
    e.preventDefault()
    ajax({
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


class ListElem extends React.Component {
  constructor () {
    super()
    // docs: "We recommend that you bind your event handlers in the constructor so they are only bound once for every instance:"
    this.removeReminder = this.removeReminder.bind(this)
  }
  removeReminder () {
    // optimistic update
    this.props.onRemoveItem(this.props.spcId)
    ajax({method: 'POST', url: `/api/remove/${this.props.spcId}`}, (resp) => {
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


export class App extends React.Component {
  constructor (props) {
    super(props)
    this.onRemoveItem = this.onRemoveItem.bind(this)
    this.onAddItem = this.onAddItem.bind(this)
    // set initial state
    this.state = {
      list: null
    }
  }
  componentDidMount () {
    document.body.style.opacity = 1
    ajax({method: 'GET', url: '/api/list'}, (resp) => {
      this.setState({list: JSON.parse(resp)})
    }, (err) => { console.log(err) })
  }
  onRemoveItem (idToRemove) {
    delete this.state.list[idToRemove]
    this.setState({
      list: this.state.list
    })
  }
  onAddItem (newEvent) {
    this.state.list[newEvent.id] = newEvent.eventObject
    this.setState({
      list: this.state.list
    })
  }
  createListElems () {
    let listElems = []
    for (const group in this.state.list) {
      listElems.push(<ListElem groupItem={this.state.list[group]} key={group} spcId={group} onRemoveItem={this.onRemoveItem} />)
    }
    return listElems
  }
  render () {
    return (
      <div>
        <Form onAddItem={this.onAddItem} />
        <div id="list"> {this.createListElems()} </div>
      </div>
    )
  }
}

render(<App />, document.getElementById('root'))
