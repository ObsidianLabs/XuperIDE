import React, { PureComponent } from 'react'
import { withRouter } from 'react-router-dom'

import { connect } from '@obsidians/redux'
import Network from '@obsidians/network'
import nodeManager from '@obsidians/node'

import CustomNetworkModal from './CustomNetworkModal'

nodeManager.execStart = async ({ name, version }) => {
  const containerName = `${process.env.PROJECT}-${name}-${version}`
  const startNode = [
    'docker run -it --rm',
    `--name ${containerName}`,
    `-p 37101:37101`,
    `-p 47101:47101`,
    `-v ${process.env.PROJECT}-${name}:/data`,
    `${process.env.DOCKER_IMAGE_NODE}:${version}`,
    `/bin/bash -c "cp /data/xchain.yaml conf/xchain.yaml && ./xchain --vm ixvm --datapath /data/blockchain --keypath /data/keys --port 0.0.0.0:37101"`
  ].join(' ')
  await nodeManager._terminal.exec(startNode, {
    resolveOnFirstLog: true,
    stopCommand: `docker stop ${containerName}`,
  })

  const startIndexer = [
    'docker run -it --rm',
    `--name ${process.env.PROJECT}-${name}-indexer`,
    `-p 8088:8088`,
    `-v ${process.env.PROJECT}-${name}:/data`,
    `-w /data/xindexer`,
    `xuper/xindexer:1.0.0`,
    `xindexer`
  ].join(' ')
  await nodeManager._indexerTerminal.exec(startIndexer, {
    resolveOnFirstLog: true,
    stopCommand: `docker stop ${process.env.PROJECT}-${name}-indexer`,
  })
  return { id: `dev.${name}`, version }
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
        tabs={{ indexer: true }}
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
