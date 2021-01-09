import React, { PureComponent } from 'react'

import { connect } from '@obsidians/redux'

import platform from '@obsidians/platform'
import headerActions, { Header, NavGuard } from '@obsidians/header'
import { networkManager } from '@obsidians/network'
import { actions } from '@obsidians/workspace'

import { List } from 'immutable'

const networkList = [
  {
    id: 'xuper',
    group: 'remote',
    name: 'Baidu Xuper',
    fullName: 'Baidu Xuper',
    icon: 'fas fa-vial',
    notification: 'Switched to <b>Baidu Xuper</b> network.',
    url: 'https://xuper.baidu.com/nodeapi',
    explorer: 'https://xuper.baidu.com',
  }
]
if (platform.isDesktop) {
  networkList.push({
    id: 'local',
    group: 'default',
    name: 'Local',
    fullName: 'Local Xuperchain',
    icon: 'fas fa-laptop-code',
    notification: 'Switched to <b>Local</b> Xuperchain.',
    chainId: 0,
  })
}
const networks = List(networkList)

class HeaderWithRedux extends PureComponent {
  componentDidMount () {
    actions.history = this.props.history
    headerActions.history = this.props.history
    if (!networkManager.network) {
      networkManager.setNetwork(networks.get(0))
    }
    this.navGuard = new NavGuard(this.props.history)
  }

  networkList = networksByGroup => {
    const networkList = []
    const groups = networksByGroup.toJS()
    const keys = Object.keys(groups)
    keys.forEach((key, index) => {
      if (key !== 'default') {
        networkList.push({ header: key })
      }
      const networkGroup = groups[key].sort((b, a) => b.name < a.name ? -1 : 1)
      networkGroup.forEach(network => networkList.push(network))
      if (index !== keys.length - 1) {
        networkList.push({ divider: true })
      }
    })
    return networkList
  }

  render () {
    console.debug('[render] HeaderWithRedux')
    const { profile, projects, contracts, accounts, network } = this.props

    const selectedProject = projects.get('selected')?.toJS() || {}

    const networkGroups = networks.groupBy(n => n.group)
    const networkList = this.networkList(networkGroups)
    const selectedNetwork = networks.find(n => n.id === network) || {}

    const starred = accounts.getIn([network, 'accounts'])?.toJS() || []
    const selectedContract = contracts.getIn([network, 'selected']) || ''
    const selectedAccount = accounts.getIn([network, 'selected']) || ''

    return (
      <Header
        profile={profile}
        projects={projects.get('local').toJS()}
        selectedProject={selectedProject}
        selectedContract={selectedContract}
        selectedAccount={selectedAccount}
        starred={starred}
        network={selectedNetwork}
        networkList={networkList}
      />
    )
  }
}

export default connect([
  'profile',
  'projects',
  'contracts',
  'accounts',
  'network',
])(HeaderWithRedux)
