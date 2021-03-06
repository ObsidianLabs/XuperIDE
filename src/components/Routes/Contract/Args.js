import React, { Component } from 'react'

import {
  DebouncedInput,
  Button,
} from '@obsidians/ui-components'

import fromPairs from 'lodash/fromPairs'

export default class Args extends Component {
  state = {
    selected: 0,
    keys: [],
    values: [],
  }

  componentDidMount () {
    if (this.props.initial) {
      this.setState({
        keys: Object.keys(this.props.initial),
        values: Object.values(this.props.initial),
      })
    }
  }

  getArgs = () => {
    const { keys, values } = this.state
    return fromPairs(keys.map((k, i) => [k, values[i]]))
  }

  updateArgKey = (value, index) => {
    if (this.state.keys.length > index) {
      this.state.keys[index] = value
      this.forceUpdate()
    }
  }
  
  updateArgValue = (value, index) => {
    if (this.state.values.length > index) {
      this.state.values[index] = value
      this.forceUpdate()
    }
  }

  addArg = () => {
    this.state.keys.push('')
    this.state.values.push('')
    this.forceUpdate()
  }

  removeArg = index => {
    this.state.keys.splice(index, 1)
    this.state.values.splice(index, 1)
    this.forceUpdate()
  }

  renderArgInputs = () => {
    const { keys, values } = this.state
    if (!keys.length) {
      return <span className='text-muted'>(No args)</span>
    }
    return keys.map((key, index) => (
      <div key={`arg-${index}`} className='mb-2 d-flex flex-row'>
        <DebouncedInput
          size='sm'
          inputGroupClassName='col-4 px-0 pr-2'
          placeholder={`Key ${index+1}`}
          value={key}
          onChange={key => this.updateArgKey(key, index)}
        />
        <DebouncedInput
          size='sm'
          inputGroupClassName='col-8 px-0'
          placeholder={`Value ${index+1}`}
          append={<i className='far fa-trash-alt' />}
          value={values[index]}
          onChange={value => this.updateArgValue(value, index)}
          onClickAppend={() => this.removeArg(index)}
        />
      </div>
    ))
  }

  render () {

    return (
      <div className={this.props.className}>
        {this.renderArgInputs()}
        <Button size='sm' color='success' className='float-right' onClick={this.addArg}>
          <i className='fas fa-plus mr-1' />Add
        </Button>
      </div>
    )
  }
}
