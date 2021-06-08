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

import { networkManager, CustomNetworkModal } from '@obsidians/network'

export default class CustomXuperNetworkModal extends CustomNetworkModal {
  loadLocalNetwork = () => {
    this.setState({
      url: '127.0.0.1:37101',
      option: '',
    })
  }

  loadXuperNetwork = () => {
    this.setState({
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
    })
  }
  
  render () {
    const { url, option } = this.state

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
          value={url}
          onChange={url => this.setState({ url })}
        />
        <DebouncedFormGroup
          label='Option'
          type='textarea'
          placeholder='Must be a valid JSON string'
          inputGroupClassName='code'
          height={300}
          value={option}
          onChange={option => this.setState({ option })}
        />
      </Modal>
    )
  }
}
