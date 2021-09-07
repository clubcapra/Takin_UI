import { ipcMain } from 'electron'
import {
  TERMINAL_MAIN,
  TERMINAL_RENDERER,
  TERMINNAL_STARTED,
} from '../shared/constants'
import { Client } from 'ssh2'
import { getMainWindow } from './index'
// import pty from 'node-pty'
// import os from 'os'

// const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash'

// const ptyProcess = pty.spawn(shell, [], {
//   name: 'xterm-color',
//   cols: 80,
//   rows: 30,
//   cwd: process.env.HOME,
//   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//   // @ts-ignore
//   env: process.env,
// })

// ptyProcess.on('data', function (data) {
//   process.stdout.write(data)
// })

export const initTerminalClient = () => {
  ipcMain.on(TERMINAL_MAIN, (_event, data, opts) => {
    if (data === TERMINNAL_STARTED) {
      ipcMain.removeAllListeners(TERMINAL_MAIN)
      startTerminalClient(opts)
    }
  })
}

const startTerminalClient = (opts: {
  host: string
  port: number
  username: string
  password: string
}) => {
  const client = new Client()
  client
    .on('ready', () => {
      client.shell((err, stream) => {
        if (err) {
          console.error('ERROR: Failed to start a shell\n', err)
        }
        if (stream === undefined) {
          console.error('ERROR: stream is undefined\n', err)
          return
        }
        ipcMain.on(TERMINAL_MAIN, (_, data) => {
          if (data === TERMINNAL_STARTED) {
            return
          }
          stream.write(data)
        })
        stream
          .on('close', () => client.end())
          .on('data', (data: unknown) =>
            getMainWindow()?.webContents.send(TERMINAL_RENDERER, data)
          )
      })
    })
    .on('error', (err) => console.error('ERROR: Failed to connect\n', err))
    .connect(opts)
}
