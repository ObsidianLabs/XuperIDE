import React from 'react'

import {
  DebouncedFormGroup,
  FormGroup,
  Label,
  CustomInput,
} from '@obsidians/ui-components'

import {
  WorkspaceContext,
  BaseProjectManager,
  AbstractProjectSettingsTab,
  ProjectPath,
} from '@obsidians/workspace'

import platform from '@obsidians/platform'
import { DockerImageInputSelector } from '@obsidians/docker'
import compilerManager from '@obsidians/compiler'

const languages = [
  { key: 'cpp', text: 'C++' },
  { key: 'solidity', text: 'Solidity' },
  // { key: 'go', text: 'Go' },
  // { key: 'java', text: 'Java' },
]

export default class ProjectSettingsTab extends AbstractProjectSettingsTab {
  static contextType = WorkspaceContext

  componentDidMount () {
    BaseProjectManager.channel.on('settings', this.debouncedUpdate)
  }
  
  componentWillUnmount () {
    BaseProjectManager.channel.off('settings', this.debouncedUpdate)
  }

  renderCompilerSelector () {
    const { projectSettings } = this.context
    const language = projectSettings?.get('language')

    if (language === 'cpp') {
      return (
        <DockerImageInputSelector
          key='compiler-xdev'
          channel={compilerManager.xdev}
          disableAutoSelection
          bg='bg-black'
          label='Xdev version'
          noneName='Xdev'
          modalTitle='Xdev Manager'
          downloadingTitle='Downloading Xdev'
          selected={projectSettings?.get('compilers.xdev')}
          onSelected={xdev => this.onChange('compilers.xdev')(xdev)}
        />
      )
    } else if (language === 'solidity') {
      return (
        <DockerImageInputSelector
          key='compiler-solc'
          channel={compilerManager.solc}
          disableAutoSelection
          bg='bg-black'
          label='Solc version'
          noneName='solc'
          modalTitle='Solc Manager'
          downloadingTitle='Downloading Solc'
          extraOptions={platform.isDesktop && [{
            id: 'default',
            display: 'Default Solc',
            onClick: () => this.onChange('compilers.solc')('default')
          }]}
          selected={projectSettings?.get('compilers.solc')}
          onSelected={solc => this.onChange('compilers.solc')(solc)}
        />
      )
    } else if (language === 'go') {
      return (
        <DockerImageInputSelector
          key='compiler-go'
          channel={compilerManager.go}
          disableAutoSelection
          bg='bg-black'
          label='Go version'
          noneName='go'
          modalTitle='Go Manager'
          downloadingTitle='Downloading Go'
          selected={projectSettings?.get('compilers.go')}
          onSelected={go => this.onChange('compilers.go')(go)}
        />
      )
    } else if (language === 'java') {
      return (
        <DockerImageInputSelector
          key='compiler-java'
          channel={compilerManager.maven}
          disableAutoSelection
          bg='bg-black'
          label='Maven version'
          noneName='maven'
          modalTitle='Maven Manager'
          downloadingTitle='Downloading Maven'
          selected={projectSettings?.get('compilers.maven')}
          onSelected={maven => this.onChange('compilers.maven')(maven)}
        />
      )
    }
  }

  render () {
    const { projectRoot, projectSettings } = this.context

    return (
      <div className='custom-tab bg2'>
        <div className='jumbotron bg-transparent text-body'>
          <div className='container'>
            <h1>Project Settings</h1>
            <ProjectPath projectRoot={projectRoot} />

            <h4 className='mt-4'>General</h4>
            <FormGroup>
            <Label>Project language</Label>
              <CustomInput
                id='settings-language'
                type='select'
                className='bg-black'
                value={projectSettings?.get('language')}
                onChange={event => this.onChange('language')(event.target.value)}
              >
                {languages.map(item => <option key={item.key} value={item.key}>{item.text}</option>)}
              </CustomInput>
            </FormGroup>
            <DebouncedFormGroup
              label='Main file'
              className='bg-black'
              value={projectSettings?.get('main')}
              onChange={this.onChange('main')}
              placeholder={`Required`}
            />
            <DebouncedFormGroup
              label='Smart contract to deploy'
              className='bg-black'
              value={projectSettings?.get('deploy')}
              onChange={this.onChange('deploy')}
              placeholder={`Required`}
            />
            <h4 className='mt-4'>Compiler</h4>
            {this.renderCompilerSelector()}
            <AbstractProjectSettingsTab.DeleteButton context={this.context} />
          </div>
        </div>
      </div>
    )
  }
}
