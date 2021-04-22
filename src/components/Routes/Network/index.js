import React, { PureComponent } from 'react'
import { withRouter } from 'react-router-dom'

import { connect } from '@obsidians/redux'
import Network from '@obsidians/network'
import nodeManager from '@obsidians/node'

import CustomNetworkModal from './CustomNetworkModal'

nodeManager.generateCommand = ({ name, version }) => {
  const containerName = `${process.env.PROJECT}-${name}-${version}`

  return [
    'docker run -it --rm',
    `--name ${containerName}`,
    `-p 37101:37101`,
    `-p 47101:47101`,
    `-v ${process.env.PROJECT}-${name}:/data`,
    `${process.env.DOCKER_IMAGE_NODE}:${version}`,
    `/bin/bash -c "cp /data/xchain.yaml conf/xchain.yaml && ./xchain --vm ixvm --datapath /data/blockchain --keypath /data/keys --port 0.0.0.0:37101"`
  ].join(' ')
}

class NetworkWithProps extends PureComponent {
  state = {
    active: true
  }

  componentDidMount () {
    this.props.cacheLifecycles.didCache(() => this.setState({ active: false }))
    this.props.cacheLifecycles.didRecover(() => this.setState({ active: true }))
  }

  render () {
    return (
      <Network
        networkId={this.props.network}
        active={this.state.active}
        customNetwork={this.props.globalConfig.get('customNetwork')}
        CustomNetworkModal={CustomNetworkModal}
      />
    )
  }
}


export default connect([
  'network',
  'globalConfig',
])(withRouter(NetworkWithProps))