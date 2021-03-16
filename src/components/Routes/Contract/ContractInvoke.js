import React, { Component } from 'react'

import {
  UncontrolledButtonDropdown,
  DropdownToggle,
  DebouncedInput,
  Badge,
  ToolbarButton,
} from '@obsidians/ui-components'

import notification from '@obsidians/notification'
import moment from 'moment'

import { DropdownCard } from '@obsidians/contract'
import { KeypairInputSelector } from '@obsidians/keypair'
import { networkManager } from '@obsidians/eth-network'
import queue from '@obsidians/eth-queue'

import Args from './Args'

export default class ContractActions extends Component {
  state = {
    method: 'transfer',
    executing: false,
    results: [],
  }

  args = React.createRef()

  executeInvoke = async () => {
    const args = this.args.current.getArgs()
    this.setState({ executing: true })

    try {
      const tx = await this.props.contract.execute(
        this.state.method,
        { json: args },
        { from: this.state.signer, value: '0' },
        'wasm'
      )

      await queue.add(
        () => networkManager.sdk.sendTransaction(tx, this.state.signer),
        {
          contractAddress: this.props.contract.address,
          name: this.props.contract.name,
          functionName: this.state.method,
          signer: this.state.signer,
          params: args,
          value: '0',
        },
        {
          failed: err => console.warn(err),
        }
      )
    } catch (e) {
      console.warn(e)
      notification.error('Invoke Failed', e.message)
    }
    this.setState({ executing: false })
  }

  renderActionSelector = () => {
    return <>
      <UncontrolledButtonDropdown size='sm'>
        <DropdownToggle color='secondary' className='rounded-0 border-0 px-2 border-right-1'>
          <code className='mx-1'><b>Invoke</b></code>
        </DropdownToggle>
      </UncontrolledButtonDropdown>
      <ToolbarButton
        id='contract-execute-invoke'
        icon={this.state.executing ? 'fas fa-spin fa-spinner' : 'fas fa-play'}
        tooltip='Execute'
        className='border-right-1'
        onClick={this.executeInvoke}
      />
    </>
  }
  
  renderTableBody = () => {
    return this.state.results.map((row, index) => {
      return (
        <tr key={`result-${index}`}>
          <td className='small'>{moment.unix(row.ts).format('MM/DD HH:mm:ss')}</td>
          <td className='small'>{row.signer}</td>
          <td><code className='small'>{row.query}</code></td>
          <td>
            <div className='small'>
              <div>区块：{row.result.block}</div>
              <div>哈希：<code className='break-all'>{row.result.hash}</code></div>
            </div>
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
          {this.renderActionSelector()}
        </div>
        <DropdownCard isOpen title='Method'>
          <DebouncedInput
            size='sm'
            placeholder='Name of the method'
            value={this.state.method}
            onChange={method => this.setState({ method })}
          />
        </DropdownCard>
        <DropdownCard isOpen title='Args'>
          <Args
            ref={this.args}
            initial={{ from: signer, to: '', token: '' }}
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
      </div>
    )
  }
}
