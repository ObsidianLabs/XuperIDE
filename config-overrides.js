const os = require('os')
const path = require('path')
const {
  override,
  addWebpackExternals,
  addWebpackAlias,
  addWebpackPlugin
} = require('customize-cra')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

function findWebpackPlugin (plugins, pluginName) {
  return plugins.find(plugin => plugin.constructor.name === pluginName)
}

function overrideProcessEnv (value) {
  return config => {
    const plugin = findWebpackPlugin(config.plugins, 'DefinePlugin')
    const processEnv = plugin.definitions['process.env'] || {}
    plugin.definitions['process.env'] = {
      ...processEnv,
      ...value
    }
    return config
  }
}

function addWasmLoader (options) {
  return config => {
    config.resolve.extensions.push('.wasm')
    config.module.rules.forEach(rule => {
      (rule.oneOf || []).forEach(oneOf => {
        if (oneOf.loader && oneOf.loader.indexOf('file-loader') >= 0) {
          oneOf.exclude.push(/\.wasm$/);
        }
      })
    })
    return config
  }
}

const overrides = [
  addWebpackAlias({
    crypto: 'crypto-browserify',
    'prettier/standalone': 'prettier/standalone',
    prettier: 'prettier/standalone',
    '@': path.resolve(__dirname, 'src/lib'),
    '@obsidians/welcome': `@obsidians/${process.env.BUILD}-welcome`,
    '@obsidians/header': `@obsidians/${process.env.BUILD}-header`,
    '@obsidians/bottombar': `@obsidians/${process.env.BUILD}-bottombar`,
    '@obsidians/compiler': `@obsidians/${process.env.PROJECT}-compiler`,
    '@obsidians/project': `@obsidians/${process.env.BUILD}-project`,
    '@obsidians/contract': `@obsidians/${process.env.BUILD}-contract`,
    '@obsidians/explorer': `@obsidians/${process.env.BUILD}-explorer`,
    '@obsidians/sdk': `@obsidians/${process.env.PROJECT}-sdk`,
    '@obsidians/network': `@obsidians/${process.env.BUILD}-network`,
    '@obsidians/node': `@obsidians/${process.env.BUILD}-node`,
  }),
  overrideProcessEnv({
    CDN: JSON.stringify(!!process.env.CDN),
    BUILD: JSON.stringify(process.env.BUILD),
    PROJECT: JSON.stringify(process.env.PROJECT || process.env.BUILD),
    PROJECT_NAME: JSON.stringify(process.env.PROJECT_NAME),
    OS_IS_LINUX: JSON.stringify(os.type() === 'Linux'),
    OS_IS_WINDOWS: JSON.stringify(os.type() === 'Windows_NT'),
    OS_IS_MAC: JSON.stringify(os.type() === 'Darwin'),
    CHAIN_NAME: '"Xuperchain"',
    CHAIN_SHORT_NAME: '"Xuper"',
    CHAIN_EXECUTABLE_NAME: '"Xuperchain Node"',
    CHAIN_EXECUTABLE_NAME_IN_LABEL: '"Xuperchain node"',
    TOKEN_SYMBOL: '"XUPER"',
    COMPILER_NAME: '"Xdev"',
    COMPILER_NAME_IN_LABEL: '"Xdev"',
    COMPILER_VERSION_KEY: '"xdev"',
    DOCKER_IMAGE_NODE: '"obsidians/xuperchain"',
  }),
  addWasmLoader(),
]

if (process.env.CDN) {
  overrides.unshift(addWebpackExternals({
    react: 'React',
    'react-dom': 'ReactDOM',
    'monaco-editor': 'monaco'
  }))
} else {
  overrides.push(addWebpackPlugin(
    new MonacoWebpackPlugin({
      languages: ['json', 'javascript', 'typescript', 'css', 'html', 'markdown', 'c', 'cpp', 'shell']
    })
  ))
}

module.exports = {
  webpack: override(...overrides)
}
