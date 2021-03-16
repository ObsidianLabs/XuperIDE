import React, { PureComponent } from 'react'

import {
  Modal,
  Button,
  DebouncedFormGroup,
  UncontrolledTooltip,
  Label,
  DropdownInput,
} from '@obsidians/ui-components'

import redux from '@obsidians/redux'
import fileOps from '@obsidians/file-ops'
import notification from '@obsidians/notification'
import { KeypairInputSelector } from '@obsidians/keypair'
import { txOptions } from '@obsidians/sdk'

import { networkManager } from '@obsidians/eth-network'
import { ContractForm } from '@obsidians/eth-contract'

import Args from '../Contract/Args'

export default class DeployerButton extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      pending: false,
      language: 'WASM',
      constructorAbi: null,
      contractName: '',
      wasm: '',
      abi: null,
      bin: '',
      signer: '',
      contractAccounts: [],
      contractAccount: '',
    }
    this.modal = React.createRef()
    this.args = React.createRef()
  }

  componentDidMount () {
    // this.props.projectManager.deployButton = this
  }

  componentDidUpdate (_, prevState) {
    if (this.state.signer !== prevState.signer) {
      this.updateContractAccounts()
    }
  }

  updateContractAccounts = async () => {
    const account = await networkManager.sdk?.accountFrom(this.state.signer)
    const contractAccounts = account.contracts?.map(c => ({ id: c, display: c })) || []
    const contractAccount = contractAccounts[0]?.id || ''
    this.setState({ contractAccounts, contractAccount })
  }

  onClick = async () => {
    if (this.state.pending) {
      return
    }

    const projectManager = this.props.projectManager

    if (!networkManager.sdk) {
      notification.error('Error', 'No running node. Please start one first.')
      return
    }

    const settings = await projectManager.checkSettings()
    if (!settings?.deploy) {
      notification.error('Error', `Please set the smart contract to deploy in project settings.`)
      return
    }

    if (settings.language === 'cpp') {
      return await this.deployCppContract(settings)
    } else if (settings.language === 'solidity') {
      return await this.deploySolidityContract(settings)
    }
  }

  deployCppContract = async settings => {
    const projectManager = this.props.projectManager
    const contractPath = projectManager.pathForProjectFile(settings.deploy)

    let bin
    try {
      const buffer = []
      const content = await fileOps.current.readFile(contractPath, null)
      const arr = Uint8Array.from(content)
      arr.forEach(n => buffer.push(String.fromCharCode(n)))
      bin = buffer.join('')
    } catch (e) {
      notification.error('Error', e.message)
      return
    }

    this.setState({ language: 'WASM', constructorAbi: null, bin })

    this.modal.current.openModal()
  }

  deploySolidityContract = async settings => {
    const projectManager = this.props.projectManager
    const contractPath = projectManager.pathForProjectFile(settings.deploy)

    const abiPath = contractPath.replace(/\.bin$/, '.abi')
    let abiJson
    try {
      abiJson = await fileOps.current.readFile(abiPath)
    } catch (e) {
      notification.error('ABI Error', e.message)
      return
    }

    let abi
    try {
      abi = JSON.parse(abiJson)
    } catch {
      notification.error('ABI Error', `Fail to parse the content for the ABI file ${abiPath}.`)
      return
    }
    const constructorAbi = abi.find(item => item.type === 'constructor')

    const bin = await fileOps.current.readFile(contractPath)

    this.setState({ language: 'Solidity', constructorAbi, abi, bin })

    this.modal.current.openModal()
  }

  confirmDeploymentParameters = async () => {
    let parameters = { array: [], obj: {} }
    if (this.state.constructorAbi) {
      try {
        parameters = this.form.getParameters()
      } catch (e) {
        notification.error('Error in Constructor Parameters', e.message)
        return
      }
    }

    const { language, contractName, abi, bin, signer, contractAccount } = this.state

    if (!contractAccount) {
      notification.error('Error', 'No contract account found for the selected signer address.')
      return
    }

    this.setState({ pending: true })

    let res
    try {
      if (language === 'Solidity') {
        res = await networkManager.sdk.deploy(signer, contractAccount, contractName, bin, abi, 'evm', parameters.json)
        redux.dispatch('ABI_ADD', {
          name: contractName,
          codeHash: `${contractAccount}/${contractName}`,
          abi: JSON.stringify(abi)
        })
      } else if (language === 'WASM') {
        const args = this.args.current?.getArgs()
        res = await networkManager.sdk.deploy(signer, contractAccount, contractName, bin, undefined, 'wasm', args)
      }
    } catch (e) {
      notification.error('Error', e.message)
      this.setState({ pending: false })
      return
    }

    if (res.header && res.header.error) {
      notification.error('Error', res.header.error)
      this.setState({ pending: false })
      return
    }
    
    this.setState({ pending: false })
    this.modal.current.closeModal()
  }

  closeModal = () => {
    this.modal.current.closeModal()
  }

  render () {
    const {
      language,
      pending,
      contractName,
      constructorAbi,
      signer,
      contractAccounts,
      contractAccount,
    } = this.state

    let icon = <span key='deploy-icon'><i className='fab fa-docker' /></span>
    if (pending) {
      icon = <span key='deploying-icon'><i className='fas fa-spinner fa-spin' /></span>
    }

    let constructorParameters = null
    if (constructorAbi) {
      constructorParameters = <>
        <Label>Constructor Parameters</Label>
        <ContractForm
          ref={form => { this.form = form }}
          size='sm'
          {...constructorAbi}
          Empty={<div className='small'>(None)</div>}
        />
        <div className='mb-2' />
      </>
    } else if (language === 'WASM') {
      constructorParameters = (
        <div className='mb-2'>
          <Label>Constructor Parameters</Label>
          <Args ref={this.args} initial={{ '': '' }} />
        </div>
      )
    }

    return <>
      <Button
        size='sm'
        color='default'
        id='toolbar-btn-deploy'
        key='toolbar-btn-deploy'
        className='rounded-0 border-0 flex-none px-2 w-5 flex-column align-items-center'
        onClick={this.onClick}
      >
        {icon}
      </Button>
      <UncontrolledTooltip trigger='hover' delay={0} placement='bottom' target='toolbar-btn-deploy'>
        { pending ? 'Deploying' : `Deploy`}
      </UncontrolledTooltip>
      <Modal
        ref={this.modal}
        overflow
        title={<span>Deploy {language} Contract <b>{contractName}</b></span>}
        textConfirm='Deploy'
        pending={pending && 'Deploying...'}
        onConfirm={this.confirmDeploymentParameters}
      >
        <DebouncedFormGroup
          label='Name'
          placeholder='4 to 15 letters, allow alphabets, numbers and underscore'
          value={contractName}
          onChange={contractName => this.setState({ contractName })}
        />
        {constructorParameters}
        <KeypairInputSelector
          label='Signer'
          value={signer}
          onChange={signer => this.setState({ signer })}
        />
        <DropdownInput
          label='Contract Account'
          options={contractAccounts}
          placeholder='(None)'
          value={contractAccount}
          onChange={contractAccount => this.setState({ contractAccount })}
        />
      </Modal>
    </>
  }
}