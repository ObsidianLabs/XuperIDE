const { IpcChannel } = require('@obsidians/ipc')
const KeypairManager = require('@obsidians/keypair')
const { AutoUpdate } = require('@obsidians/global')
const CompilerManager = require('@obsidians/xuper-compiler')
const { InstanceManager } = require('@obsidians/xuper-network')
const ProjectChannel = require('@obsidians/xuper-project')
const SdkChannel = require('@obsidians/xuper-sdk')
const AuthChannel = require('@obsidians/auth')
const { DockerImageChannel } = require('@obsidians/docker')

let ipcChannel, keypairManager, autoUpdate, compilerManager, instanceManager, projectChannel, sdkChannel, authChannel, indexerChannel
module.exports = function () {
  ipcChannel = new IpcChannel()
  keypairManager = new KeypairManager(process.env.PROJECT)
  autoUpdate = new AutoUpdate('https://app.obsidians.io/api/v1/check-update/xuper/')
  compilerManager = new CompilerManager()
  instanceManager = new InstanceManager()
  projectChannel = new ProjectChannel()
  sdkChannel = new SdkChannel()
  authChannel = new AuthChannel()
  indexerChannel = new DockerImageChannel('xuper/xindexer')
}
