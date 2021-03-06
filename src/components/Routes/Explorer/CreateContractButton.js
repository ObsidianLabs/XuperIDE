import React, { PureComponent } from 'react'

import {
  ToolbarButton,
  Modal,
  DebouncedFormGroup,
} from '@obsidians/ui-components'

import notification from '@obsidians/notification'
import { networkManager } from '@obsidians/network'

export default class CreateContractButton extends PureComponent {
  state = {
    name: '',
    pending: false,
  }

  modal = React.createRef()
  input = React.createRef()

  openModal = () => {
    this.modal.current.openModal()
    setTimeout(() => this.input.current.focus(), 100)
  }

  onConfirm = async () => {
    this.setState({ pending: true })
    try {
      await networkManager.sdk.createContractAccount(this.props.value, this.state.name)
    } catch (e) {
      this.setState({ pending: false })
      notification.error('Error', e.message)
      return
    }
    this.setState({ name: '', pending: false })
    notification.success('Contract Account Created')
    this.modal.current.closeModal()
    this.props.explorer.onRefresh()
  }

  render () {
    const { name } = this.state

    return (
      <>
        <ToolbarButton
          id='navbar-xuper-create-contract'
          size='md'
          icon='fas fa-file-plus'
          tooltip='Create Contract Account'
          onClick={this.openModal}
        />
        <Modal
          ref={this.modal}
          title='Create Contract Account'
          onConfirm={this.onConfirm}
          textConfirm='Create'
          confirmDisabled={!/^[1-9][0-9]{15}$/.test(name)}
          pending={this.state.pending && 'Creating...'}
        >
          <DebouncedFormGroup
            ref={this.input}
            label='Name of contract account'
            maxLength={16}
            value={name}
            onChange={name => this.setState({ name })}
            validator={v => !/^[1-9][0-9]{15}$/.test(v) && 'Must be digits of length 16'}
          />
        </Modal>
      </>
    )
  }
}
