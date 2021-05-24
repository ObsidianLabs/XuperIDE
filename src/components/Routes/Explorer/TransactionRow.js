import React, { PureComponent } from 'react'

import { Badge } from '@obsidians/ui-components'
import { utils } from '@obsidians/sdk'

import moment from 'moment'

import {
  TransactionFee,
  Address,
} from '@obsidians/explorer'

import { networkManager } from '@obsidians/network'

function TransactionTransfer ({ tx, owner }) {
  const amount = `${utils.unit.fromValue(tx.amount)} ${process.env.TOKEN_SYMBOL}`
  return (
    <div className='d-flex flex-row align-items-center'>
      <div className='flex-1 overflow-hidden'>
        <Address addr={tx.from} showTooltip={false}/>
      </div>
      <div className='mx-3 text-muted'>
        <i className='fas fa-arrow-alt-right' />
      </div>
      <div className='flex-1 overflow-hidden'>
        <Address addr={tx.to} showTooltip={false}/>
      </div>
      <Badge pill color={tx.from === owner ? 'danger' : 'success'}>
        {amount}
      </Badge>
    </div>
  )
}

export default class TransactionRow extends PureComponent {
  constructor (props) {
    super(props)
    this.state = { tx: props.tx }
  }

  componentDidMount () {
    if (!this.state.tx.create_time) {
      this.refresh(this.state.tx.txid)
    }
  }

  refresh = async txid => {
    const tx = await networkManager.sdk.queryTransaction(txid, this.props.owner)
    this.setState({ tx })
  }

  onClick = () => {}

  render () {
    const { owner } = this.props
    const { tx } = this.state
    const ts = (+tx.timestamp) || (tx.create_time * 1000)
    return (
      <tr onClick={this.onClick}>
        <td><small>{moment(ts).format('MM/DD HH:mm:ss')}</small></td>
        <td>
          <div className='flex-1 overflow-hidden'>
            <Address addr={tx.txid} redirect={false}/>
          </div>
        </td>
        <td>
        {
          tx.initiator
          ? <code><small>{tx.initiator}</small></code>
          : `${tx.tx_inputs?.length} input(s)`
        }
        </td>
        <td>{tx.tx_outputs?.length} output(s)</td>
        <td align='right'>
          <Badge pill color={tx.amount >= 0 ? 'success' : 'danger'}>
            {tx.amount}
          </Badge>
        </td>
        <td align='right'><Badge pill color='secondary'>{tx.fee}</Badge></td>
        <td className='small'>{tx.desc}</td>
      </tr>
    )
  }
}
