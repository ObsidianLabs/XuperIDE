import Contract from '@obsidians/contract'
import ContractPage from './ContractPage'

Contract.defaultProps = {
  ...Contract.defaultProps,
  valueFormatter: v => v,
  Page: ContractPage,
}

export default Contract
