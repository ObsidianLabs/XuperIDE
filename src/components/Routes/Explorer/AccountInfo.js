import React, { PureComponent } from 'react'

import {
  TableCard,
  TableCardRow,
} from '@obsidians/ui-components'

export default class AccountInfo extends PureComponent {
  render () {
    const { account } = this.props

    return (
      <TableCard title='Account Contracts'>
        {account.contracts.map(contract => {
          const nContract = contract.contracts.length
          return (
            <TableCardRow
              key={contract.address}
              name={contract.address}
              icon='fas fa-code'
              badge={nContract > 1 ? `${nContract} Contracts` : `${nContract} Contract`}
            />
          )
        })}
      </TableCard>
    )
  }
}
