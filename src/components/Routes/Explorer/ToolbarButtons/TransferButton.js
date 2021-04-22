import React, { PureComponent } from 'react'

import {
  ToolbarButton,
  Modal,
  DebouncedFormGroup,
  FormGroup,
  Label,
} from '@obsidians/ui-components'

import { KeypairInputSelector } from '@obsidians/keypair'

import notification from '@obsidians/notification'
import { networkManager } from '@obsidians/network'

export default class TransferButton extends PureComponent {
  state = {
    amount: '',
    recipient: '',
    pending: false,
  }

  amountInput = React.createRef()
  modal = React.createRef()

  openModal = () => {
    this.modal.current.openModal()
    setTimeout(() => this.amountInput.current.focus(), 100)
  }

  onConfirm = async () => {
    this.setState({ pending: true })
    const { recipient, amount } = this.state
    try {
      await networkManager.sdk.transfer(this.props.value, recipient, amount)
    } catch (e) {
      console.warn(e)
      this.setState({ pending: false })
      notification.error('Error', e.error?.message || e.message)
      return
    }
    this.setState({ amount: '', recipient: '', pending: false })
    this.modal.current.closeModal()
    this.props.explorer.onRefresh()
  }

  render () {
    const { pending, amount, recipient } = this.state

    return (
      <>
        <ToolbarButton
          id='navbar-xuper-transfer'
          size='md'
          icon='fas fa-sign-out-alt'
          tooltip='Transfer'
          onClick={this.openModal}
        />
        <Modal
          ref={this.modal}
          overflow
          title='Transfer'
          onConfirm={this.onConfirm}
          textConfirm='Send'
          confirmDisabled={!amount || !recipient}
          pending={pending && 'Sending...'}
        >
          <DebouncedFormGroup
            ref={this.amountInput}
            label='Amount'
            maxLength='50'
            value={amount}
            onChange={amount => this.setState({ amount })}
          />
          <FormGroup>
            <Label>Recipient</Label>
            <KeypairInputSelector
              ref={this.keypairInput}
              editable
              icon='fas fa-map-marker-alt'
              placeholder='Recipient address'
              maxLength={33}
              value={recipient}
              onChange={recipient => this.setState({ recipient })}
            />
          </FormGroup>
        </Modal>
      </>
    )
  }
}
