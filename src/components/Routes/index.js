import React, { Suspense, lazy } from 'react'
import { Route, Redirect } from 'react-router-dom'
import CacheRoute, { CacheSwitch } from 'react-router-cache-route'

import Auth from '@obsidians/auth'
import { Input, LoadingScreen, CenterScreen } from '@obsidians/ui-components'
import { NewProjectModal } from '@obsidians/project'

import BottomBar from './BottomBar'

Input.defaultProps = {
  type: 'text',
  autoComplete: 'off',
  autoCorrect: 'off',
  autoCapitalize: 'off',
  spellCheck: 'false'
}

NewProjectModal.defaultProps = {
  noCompilerOption: true,
  defaultTemplate: 'cpp-counter',
  templates: [
    {
      group: `cpp`,
      badge: `C++`,
      children: [
        { id: 'cpp-counter', display: 'Counter' },
      ],
    },
    {
      group: `solidity`,
      badge: `Solidity`,
      children: [
        { id: 'sol-counter', display: 'Counter' },
      ],
    },
    {
      group: `go`,
      badge: `Go`,
      children: [
        { id: 'go-counter', display: 'Counter' },
      ],
    },
    {
      group: `java`,
      badge: `Java`,
      children: [
        { id: 'java-counter', display: 'Counter' },
        { id: 'java-erc20', display: 'ERC20' },
      ],
    },
  ]
}

const UserHomepage = lazy(() => import('./UserHomepage' /* webpackChunkName: "tabs" */))
const Project = lazy(() => import('./Project' /* webpackChunkName: "tabs" */))
const Contract = lazy(() => import('./Contract' /* webpackChunkName: "tabs" */))
const Explorer = lazy(() => import('./Explorer' /* webpackChunkName: "tabs" */))
const Network = lazy(() => import('./Network' /* webpackChunkName: "tabs" */))

export default function (props) {
  return (
    <React.Fragment>
      {props.children}
      <Suspense fallback={<LoadingScreen />}>
        <CacheSwitch>
          <Route
            exact
            path='/'
            render={() => <Redirect to={`/${Auth.username || 'local'}`} />}
          />
          <CacheRoute
            path='/contract/:value?'
            component={Contract}
            className='p-relative w-100 h-100'
          />
          <CacheRoute
            exact
            path='/account/:value?'
            component={Explorer}
            className='p-relative w-100 h-100'
          />
          <CacheRoute
            exact
            path='/network/:network?'
            component={Network}
            className='p-relative w-100 h-100'
          />
          <Route
            exact
            path='/:username'
            component={UserHomepage}
            className='p-relative w-100 h-100'
          />
          <CacheRoute
            exact
            path='/:username/:project'
            cacheKey='project-editor'
            component={Project}
            className='p-relative w-100 h-100'
          />
          <Route
            render={() => <CenterScreen>Invalid URL</CenterScreen>}
          />
        </CacheSwitch>
      </Suspense>
      <CacheRoute
        component={BottomBar}
        className='border-top-1 d-flex flex-row'
      />
    </React.Fragment>
  )
}
