import React, { PureComponent } from 'react'
import { withRouter } from 'react-router-dom'

import { connect } from '@obsidians/redux'
import Network from '@obsidians/network'
import nodeManager from '@obsidians/node'

nodeManager.generateCommand = ({ name, version }) => {
  const containerName = `${process.env.PROJECT}-${name}-${version}`

  return [
    'docker run -it --rm',
    `--name ${containerName}`,
    `-p 37101:37101`,
    `-p 47101:47101`,
    `-v ${process.env.PROJECT}-${name}:/data`,
    `${process.env.DOCKER_IMAGE_NODE}:${version}`,
    `/bin/bash -c "cp /data/xchain.yaml conf/xchain.yaml && ./xchain --datapath /data/blockchain --keypath /data/keys --port 0.0.0.0:37101"`
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
      />
    )
  }
}


export default connect([
  'network',
])(withRouter(NetworkWithProps))
