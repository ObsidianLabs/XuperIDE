import Explorer, { AccountPage, AccountTransactions } from '@obsidians/explorer'

import ToolbarButtons from './ToolbarButtons'
import AccountInfo from './AccountInfo'
import TransactionHeader from './TransactionHeader'
import TransactionRow from './TransactionRow'

AccountPage.defaultProps = { AccountInfo }
AccountTransactions.defaultProps = {
  TransactionHeader,
  TransactionRow
}
Explorer.defaultProps = {
  ...Explorer.defaultProps,
  valueFormatter: v => v,
  ToolbarButtons: () => null,
  ExtraToolbarButtons: ToolbarButtons,
}

export default Explorer
