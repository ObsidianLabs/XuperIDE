import React, { PureComponent } from 'react'

import {
  Modal,
  DebouncedFormGroup,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledButtonDropdown
} from '@obsidians/ui-components'

import redux from '@obsidians/redux'

import { networkManager } from '@obsidians/network'

export default class CustomNetworkModal extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      info: { url: '', option: '' },
    }
    this.modal = React.createRef()
  }

  openModal (customNetwork = {}) {
    this.setState({ info: customNetwork })
    this.modal.current?.openModal()
  }

  update (customNetwork) {
    this.setState({ info: customNetwork })
    this.tryCreateSdk(customNetwork)
  }

  tryCreateSdk = async ({ url, option }) => {
    const status = await networkManager.updateCustomNetwork({ url, option })
    return !!status
  }

  loadLocalNetwork = () => {
    this.setState({ info: {
      url: '127.0.0.1:37101',
      option: '',
    } })
  }

  loadXuperNetwork = () => {
    this.setState({ info: {
      url: 'https://xuper.baidu.com/nodeapi',
      option: JSON.stringify({
        transfer: {
          server: 'https://xuper.baidu.com/nodeapi',
          fee: '400',
          endorseServiceCheckAddr: 'jknGxa6eyum1JrATWvSJKW3thJ9GKHA9n',
          endorseServiceFeeAddr: 'aB2hpHnTBDxko3UoP2BpBZRujwhdcAFoT'
        },
        makeTransaction: {
          server: 'https://xuper.baidu.com/nodeapi',
          fee: '400',
          endorseServiceCheckAddr: 'jknGxa6eyum1JrATWvSJKW3thJ9GKHA9n',
          endorseServiceFeeAddr: 'aB2hpHnTBDxko3UoP2BpBZRujwhdcAFoT'
        }
      }, null, 2),
    } })
  }

  onConfirmCustomNetwork = async () => {
    const valid = await this.tryCreateSdk(this.state.info)
    if (!valid) {
      return
    }
    redux.dispatch('UPDATE_GLOBAL_CONFIG', { customNetwork: this.state.info })
    this.modal.current.closeModal()
    this.props.onUpdate(this.state.info)
  }

  render () {
    const { info } = this.state

    return (
      <Modal
        ref={this.modal}
        title='Custom Network'
        ActionBtn={
          <UncontrolledButtonDropdown>
            <DropdownToggle caret color='success'>Examples</DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={this.loadLocalNetwork}>local</DropdownItem>
              <DropdownItem onClick={this.loadXuperNetwork}>xuper.baidu.com</DropdownItem>
            </DropdownMenu>
          </UncontrolledButtonDropdown>
        }
        onConfirm={this.onConfirmCustomNetwork}
      >
        <DebouncedFormGroup
          label='Node URL'
          placeholder='grpc://... or http(s)://...'
          maxLength='300'
          value={info.url}
          onChange={url => this.setState({ info: { ...info, url } })}
        />
        <DebouncedFormGroup
          label='Option'
          type='textarea'
          placeholder='Must be a valid JSON string'
          inputGroupClassName='code'
          height={300}
          value={info.option}
          onChange={option => this.setState({ info: { ...info, option } })}
        />
      </Modal>
    )
  }
}
