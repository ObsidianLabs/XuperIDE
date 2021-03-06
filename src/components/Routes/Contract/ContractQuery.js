import React, { Component } from 'react'

import {
  UncontrolledButtonDropdown,
  DropdownToggle,
  DebouncedInput,
  ToolbarButton,
} from '@obsidians/ui-components'

import notification from '@obsidians/notification'
import moment from 'moment'

import { DropdownCard } from '@obsidians/contract'
import { KeypairInputSelector } from '@obsidians/keypair'
import { networkManager } from '@obsidians/eth-network'

import Args from './Args'

export default class ContractTable extends Component {
  state = {
    method: 'balance',
    executing: false,
    results: [],
  }

  args = React.createRef()

  executeQuery = async () => {
    const args = this.args.current.getArgs()
    this.setState({ executing: true })

    try {
      const result = await this.props.contract.query(this.state.method, { json: args }, { from: this.state.signer }, 'wasm')
      this.setState({
        results: [{
          ts: moment().unix(),
          args: JSON.stringify(args),
          result: typeof result === 'string' ? result : JSON.stringify(result),
        }, ...this.state.results]
      })
    } catch (e) {
      console.warn(e)
      notification.error('Query Failed', e.message)
    }
    this.setState({ executing: false })
  }

  renderTableSelector = () => <>
    <UncontrolledButtonDropdown size='sm'>
      <DropdownToggle color='secondary' className='rounded-0 border-0 px-2 border-right-1'>
        <code className='mx-1'><b>Query</b></code>
      </DropdownToggle>
    </UncontrolledButtonDropdown>
    <ToolbarButton
      id='contract-execute-query'
      icon={this.state.executing ? 'fas fa-spin fa-spinner' : 'fas fa-play'}
      tooltip='Execute'
      className='border-right-1'
      onClick={this.executeQuery}
    />
  </>

  renderTableBody = () => {
    return this.state.results.map((row, index) => {
      return (
        <tr key={`result-${index}`}>
          <td className='small'>{moment.unix(row.ts).format('MM/DD HH:mm:ss')}</td>
          {/* <td className='small'>{row.signer}</td> */}
          <td><code className='small break-all'>{row.args}</code></td>
          <td>
            {
              row.result
              ? <span className='text-success mr-1'><i className='fas fa-check-circle' /></span>
              : <span className='text-danger mr-1'><i className='fas fa-times-circle' /></span>
            }
            <span>{row.result?.toString()}</span>
          </td>
        </tr>
      )
    })
  }

  render () {
    const { signer, contract } = this.props

    return (
      <div className='d-flex flex-column align-items-stretch h-100'>
        <div className='d-flex border-bottom-1'>
          {this.renderTableSelector()}
        </div>
        <DropdownCard isOpen title='Method'>
          <DebouncedInput
            size='sm'
            placeholder='Name of the method'
            value={this.state.method}
            onChange={method => this.setState({ method })}
          />
        </DropdownCard>
        <DropdownCard
          isOpen
          title='Args'
          flex='0 1 auto'
        >
          <Args
            ref={this.args}
            initial={{ caller: signer }}
          />
        </DropdownCard>
        <DropdownCard
          isOpen
          title='Authorization'
          overflow
        >
          <KeypairInputSelector
            size='sm'
            label='Signer'
            value={this.state.signer}
            onChange={signer => this.setState({ signer })}
          />
        </DropdownCard>
        <DropdownCard
          isOpen
          title='Result'
          flex='1 2 auto'
          minHeight='120px'
        >
          <table className='table table-sm table-hover table-striped'>
            <thead>
              <tr>
                <th style={{ width: '15%' }}>Time</th>
                <th style={{ width: '50%' }}>Args</th>
                <th style={{ width: '35%' }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {this.renderTableBody()}
            </tbody>
          </table>
        </DropdownCard>
      </div>
    )
  }
}
