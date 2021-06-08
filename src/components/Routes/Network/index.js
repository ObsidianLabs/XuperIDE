import Network from '@obsidians/network'
import nodeManager from '@obsidians/node'

import CustomXuperNetworkModal from './CustomXuperNetworkModal'

nodeManager.execStart = async ({ name, version }) => {
  const containerName = `${process.env.PROJECT}-${name}-${version}`
  const startNode = [
    'docker run -it --rm',
    `--name ${containerName}`,
    `-p 37101:37101`,
    `-p 47101:47101`,
    // '-v /var/run/docker.sock:/var/run/docker.sock',
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

Network.defaultProps = {
  tabs: { indexer: true },
  CustomNetworkModal: CustomXuperNetworkModal,
}

export default Network
