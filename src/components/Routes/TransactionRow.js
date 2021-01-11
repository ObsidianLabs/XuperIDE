import React, { PureComponent } from 'react'

import { Badge } from '@obsidians/ui-components'
import { utils } from '@obsidians/sdk'

import moment from 'moment'

import {
  TransactionFee,
  Address,
} from '@obsidians/explorer'

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
  onClick = () => {

  }

  render () {
    const { tx, owner } = this.props
    console.log(tx)
    let TxComponent = <TransactionTransfer tx={tx} owner={owner} />
    return (
      <tr onClick={this.onClick}>
        <td><small>{moment(tx.create_time * 1000).format('MM/DD HH:mm:ss')}</small></td>
        <td>
          <div className='flex-1 overflow-hidden'>
            <Address addr={tx.txid} redirect={false}/>
          </div>
        </td>
        <td>{TxComponent}</td>
        <td>
          <TransactionFee value={tx.fee}/>
        </td>
        <td>
          <TransactionFee value={tx.fee}/>
        </td>
      </tr>
    )
  }
}
