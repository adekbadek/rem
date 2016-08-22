require('./style')

import React from 'react'
import { render } from 'react-dom'

import utils from './js/utils'

import Form from './js/components/form'
import ListElem from './js/components/list-elem'

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
    utils.ajax({method: 'GET', url: '/api/list'}, (resp) => {
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
