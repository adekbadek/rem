import React from 'react'
import { render } from 'react-dom'

export class App extends React.Component {
  constructor(props){
    super(props)
    // set initial state
  }
  render () {
    return (
      <div>
        Hello React!
      </div>
    )
  }
}

render(<App />, document.getElementById('root'))
