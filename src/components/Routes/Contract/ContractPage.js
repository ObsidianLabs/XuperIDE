import React, { PureComponent } from 'react'
import classnames from 'classnames'

import {
  Screen,
  LoadingScreen,
  SplitPane,
  Button,
  UncontrolledButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from '@obsidians/ui-components'

import redux from '@obsidians/redux'
import { networkManager } from '@obsidians/eth-network'

import { ContractActions, ContractViews } from '@obsidians/contract'

import ContractInvoke from './ContractInvoke'
import ContractQuery from './ContractQuery'

export default class ContractPage extends PureComponent {
  constructor (props) {
    super(props)
    this.abiStorageModal = React.createRef()

    this.state = {
      error: null,
      errorType: null,
      contracts: [],
      selected: 0,
      loading: true,
    }
    props.cacheLifecycles.didRecover(this.componentDidRecover)
  }

  componentDidMount () {
    this.props.onDisplay(this)
    this.refresh()
  }

  componentDidUpdate (prevProps) {
    if (prevProps.value !== this.props.value) {
      this.refresh()
    }
  }

  componentDidRecover = () => {
    this.props.onDisplay(this)
  }

  refresh = async () => {
    this.setState({ loading: true, error: null, contract: null, errorType: null })

    await new Promise(resolve => setTimeout(resolve, 10))

    const value = this.props.value

    if (!value) {
      this.setState({ loading: false, error: 'No address entered.' })
      return
    }

    let contracts
    try {
      contracts = await networkManager.sdk.contractsFrom(value)
      this.setState({ loading: false, contracts, selected: 0 })
    } catch (e) {
      console.warn(e)
      this.setState({ loading: false, error: e.message })
      return
    }
  }

  selectContract = index => {
    this.setState({ selected: index })
  }

  renderContractSelector = () => {
    const { contracts, selected } = this.state
    return (
      <UncontrolledButtonDropdown size='sm'>
        <DropdownToggle color='primary' caret className='rounded-0 border-0 px-2 border-right-1'>
          <i className='fas fa-file-invoice mr-1' />
          <code className='mx-1'><b>{contracts[selected]?.name}</b></code>
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem header>contracts</DropdownItem>
          {contracts.map((c, index) => (
            <DropdownItem
              key={c.txid}
              className={classnames({ active: index === selected })}
              onClick={() => this.selectContract(index)}
            >
              <code>{c.name}</code>
            </DropdownItem>
          ))}
        </DropdownMenu>
      </UncontrolledButtonDropdown>
    )
  }

  render () {
    const { value, signer } = this.props
    const { loading, contracts, error, selected } = this.state

    if (!networkManager.sdk) {
      return null
    }

    if (!value) {
      return (
        <Screen>
          <h4 className='display-4'>New Page</h4>
          <p className='lead'>Please enter an {process.env.CHAIN_NAME} contract address.</p>
        </Screen>
      )
    }

    if (loading) {
      return <LoadingScreen />
    }

    if (error) {
      return (
        <Screen>
          <h4 className='display-4'>Error</h4>
          <p>{error}</p>
        </Screen>
      )
    }

    if (!contracts.length) {
      return (
        <Screen>
          <h4 className='display-4'>No Contract</h4>
          <p>There is no deployed contract under this account yet.</p>
        </Screen>
      )
    }

    const contract = contracts[selected] || {}

    let abi
    try {
      abi = JSON.parse(redux.getState().abis.getIn([`${value}/${contract.name}`, 'abi']))
    } catch {}

    let ContractInspector = null
    if (!abi) {
      ContractInspector = (
        <div className='d-flex p-relative h-100 w-100'>
          <SplitPane
            split='vertical'
            defaultSize={Math.floor(window.innerWidth / 2)}
            minSize={200}
          >
            <ContractInvoke signer={signer} contract={contract} />
            <ContractQuery signer={signer} contract={contract} />
          </SplitPane>
        </div>
      )
    } else {
      const functions = abi.filter(item => item.type === 'function')
      const actions = functions.filter(item => item.stateMutability !== 'view' && item.stateMutability !== 'pure')
      const views = functions.filter(item => item.stateMutability === 'view' || item.stateMutability === 'pure')
  
      ContractInspector = (
        <div className='d-flex p-relative h-100 w-100'>
          <SplitPane
            split='vertical'
            defaultSize={Math.floor(window.innerWidth / 2)}
            minSize={200}
          >
            <ContractActions value={value} abi={actions} contract={contract} />
            <ContractViews value={value} abi={views} contract={contract} signerSelector />
          </SplitPane>
        </div>
      )
    }

    return (
      <div className='d-flex flex-column align-items-stretch h-100'>
        <div className='d-flex border-bottom-1'>
          {this.renderContractSelector()}
        </div>
        {ContractInspector}
      </div>
    )
  }
}
