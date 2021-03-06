import React, { PureComponent } from 'react'

import {
  TableCard,
  TableCardRow,
} from '@obsidians/ui-components'

import { Link } from 'react-router-dom'

export default class AccountInfo extends PureComponent {
  render () {
    const { account } = this.props

    if (!account.contracts?.length) {
      return (
        <TableCard title='Contract Accounts'>
          <TableCardRow name={<span className='text-muted'>(No Contracts)</span>} />
        </TableCard>
      )
    }

    return (
      <TableCard title='Contract Accounts'>
        {account.contracts.map(contract => {
          return (
            <TableCardRow
              key={contract}
              name={<Link to={`/contract/${contract}`} className='text-body'>{contract}</Link>}
              icon='fas fa-code'
            />
          )
        })}
      </TableCard>
    )
  }
}
