import React, { Component, Suspense, lazy } from 'react'

import fileOps from '@obsidians/file-ops'
import Auth from '@obsidians/auth'
import { NotificationSystem } from '@obsidians/notification'
import Welcome, { checkDependencies } from '@obsidians/welcome'
import { GlobalModals, autoUpdater } from '@obsidians/global'
import { LoadingScreen } from '@obsidians/ui-components'
import redux, { Provider } from '@obsidians/redux'
import { DockerImageChannel } from '@obsidians/docker'

import { config, updateStore } from '@/redux'
import '@/menu'

import Routes from './components/Routes'
import icon from './components/icon.png'
const Header = lazy(() => import('./components/Header' /* webpackChunkName: "components" */))

export default class ReduxApp extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loaded: false,
      dependencies: false
    }
    this.indexerChannel = new DockerImageChannel('xuper/xindexer')
    this.extraItems = [{
      channel: this.indexerChannel,
      title: 'Xindexer in Docker',
      subtitle: 'The indexer for for local node',
      link: 'https://hub.docker.com/r/xuper/xindexer',
      downloadingTitle: 'Downloading xindexer',
    }]
  }

  async componentDidMount () {
    await redux.init(config, updateStore).then(onReduxLoaded)
    this.refresh()
  }

  refresh = async () => {
    const dependencies = await checkDependencies(this.extraItems)
    this.setState({ loaded: true, dependencies })
    autoUpdater.check()
  }

  skip = () => {
    this.setState({ loaded: true, dependencies: true })
  }

  render () {
    if (!this.state.loaded) {
      return <LoadingScreen />
    }

    if (!this.state.dependencies) {
      return (
        <Suspense fallback={<LoadingScreen />}>
          <Welcome
            isReady={checkDependencies}
            onGetStarted={this.skip}
            truffleSubtitle='The smart contract compiler for Xuperchain'
            extraItems={this.extraItems}
          />
          <NotificationSystem />
          <GlobalModals icon={icon} />
        </Suspense>
      )
    }

    return (
      <Provider store={redux.store}>
        <div
          className='body'
          style={{ paddingTop: this.state.dependencies ? '49px' : '0' }}
        >
          <Routes>
            <Header history={this.props.history} />
            <NotificationSystem />
            <GlobalModals icon={icon} />
          </Routes>
        </div>
      </Provider>
    )
  }
}

async function onReduxLoaded () {
  Auth.updateProfile()
  const version = fileOps.current.getAppVersion()
  redux.dispatch('SET_VERSION', { version })
}
