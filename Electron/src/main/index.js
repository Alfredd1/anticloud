import { app, shell, BrowserWindow, ipcMain, net } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import express from 'express'
import { exec } from 'child_process'
import fg from 'fast-glob'

async function startP2PServer() {
  const appContext = express()
  appContext.use(express.json())
  const P2P_Port = 3500

  // Endpoint for other peers to get this computer's files
  appContext.post('/api/local-files', async (req, res) => {
    try {
      const searchPath = req.body.path || 'C:/Thing/Root'
      const pattern = `${searchPath.replace(/\\/g, '/').replace(/\/$/, '')}/**/*`
      const entries = await fg([pattern], { onlyFiles: false, objectMode: true, suppressErrors: true })

      res.json({
        computer: require('os').hostname(),
        files: entries.map((entry) => ({
          name: entry.name,
          isDirectory: entry.dirent.isDirectory()
        }))
      })
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'Error scanning files', details: e.message })
    }
  })

  // Get this machine's Tailscale IP and start listening
  exec('tailscale status --json', (err, stdout) => {
    if (err) {
      console.error('Could not get Tailscale status. Is Tailscale running?', err)
      return
    }
    const status = JSON.parse(stdout)
    const myTsIp = status.Self?.TailscaleIPs?.[0]

    if (myTsIp) {
      appContext.listen(P2P_Port, myTsIp, () => {
        console.log(`P2P Node listening on http://${myTsIp}:${P2P_Port}`)
      })
    }
  })
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Start the P2P server
  startP2PServer()

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // IPC handler for getting device status from the local Tailscale CLI
  ipcMain.handle('get-tailscale-status', () => {
    return new Promise((resolve, reject) => {
      exec('tailscale status --json', (err, stdout) => {
        if (err) {
          return reject(err)
        }
        try {
          const status = JSON.parse(stdout)
          const self = {
            hostname: status.Self.HostName,
            online: true // The local device is always "online" to itself
          }
          const peers = Object.values(status.Peer).map((peer) => ({
            hostname: peer.HostName,
            online: peer.Online
          }))
          resolve([self, ...peers])
        } catch (e) {
          reject(e)
        }
      })
    })
  })

  // IPC handler for getting device IPs from the Tailscale API
  ipcMain.handle('get-tailscale-devices', () => {
    return new Promise((resolve, reject) => {
      const tailnet = '-' // Use your tailnet name or '-' for default
      const apiKey = 'tskey-api-kMuqUf38td11CNTRL-Vio2AVU7QSY2aY6LKhMaSYNC655cZ42L' //ENTER KEY ;)
      const request = net.request({
        method: 'GET',
        protocol: 'https:',
        hostname: 'api.tailscale.com',
        path: `/api/v2/tailnet/${tailnet}/devices`
      })

      request.setHeader('Authorization', `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`)

      request.on('response', (response) => {
        let body = ''
        response.on('data', (chunk) => {
          body += chunk.toString()
        })
        response.on('end', () => {
          try {
            const data = JSON.parse(body)
            console.log('Tailscale API Response:', JSON.stringify(data, null, 2))

            if (response.statusCode !== 200) {
              reject(new Error(data.message || `Tailscale API Error: ${response.statusCode}`))
              return
            }

            // The Tailscale API returns an object with a 'devices' array, not a direct array
            if (data && data.devices && Array.isArray(data.devices)) {
              resolve(data.devices)
            } else {
              resolve([]);
            }
          } catch (e) {
            reject(e)
          }
        })
      })
      request.on('error', (error) => reject(error))
      request.end()
    })
  })

  ipcMain.handle('get-files-from-peer', (event, { ip, path }) => {
    return new Promise((resolve, reject) => {
      const request = net.request({
        method: 'POST',
        protocol: 'http:',
        hostname: ip,
        port: 3000,
        path: '/api/ls'
        port: 3500,
        path: '/api/local-files'
      })

      request.setHeader('Content-Type', 'application/json')

      request.on('response', (response) => {
        let body = ''
        response.on('data', (chunk) => {
          body += chunk.toString()
        })
        response.on('end', () => {
          try {
            resolve(JSON.parse(body))
          } catch (e) {
            console.error(`Error parsing JSON from peer ${ip}:`, e)
            resolve({ files: [] })
          }
        })
      })
      request.on('error', (error) => reject(error))
      request.write(JSON.stringify({ path }))
      request.end()
    })
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
