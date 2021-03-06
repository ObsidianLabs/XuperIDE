import React, { PureComponent } from 'react'

import platform from '@obsidians/platform'
import { connect } from '@obsidians/redux'
import Project, { ProjectToolbar } from '@obsidians/project'
import { modelSessionManager } from '@obsidians/code-editor'

import ProjectSettingsTab from './ProjectSettingsTab'
import DeployButton from './DeployButton'

modelSessionManager.registerCustomTab('settings', ProjectSettingsTab, 'Project Settings')

ProjectToolbar.defaultProps = {
  noDeploy: true,
  ExtraButtons: DeployButton,
}

class ProjectWithProps extends PureComponent {
  async componentDidMount () {
    this.props.cacheLifecycles.didRecover(() => {
      window.dispatchEvent(new Event('resize'))
    })
  }

  render () {
    const { projects, match } = this.props
    const { username, project } = match.params

    let type, projectRoot, selected
    if (username === 'local') {
      type = 'Local'
      selected = projects.get('selected')?.toJS() || {}
      projectRoot = selected.path
    } else {
      type = 'Remote'
      projectRoot = `${username}/${project}`
    }

    if (type === 'Local' && platform.isWeb) {
      return null
    }
    
    return (
      <Project
        theme='obsidians'
        projectRoot={projectRoot}
        type={type}
      />
    )
  }
}

export default connect(['projects'])(ProjectWithProps)
