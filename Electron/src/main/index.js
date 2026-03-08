import { app, shell, BrowserWindow, ipcMain, net } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import express from "express"
import { execSync } from "child_process"
import fg from "fast-glob"

const appContext = express()
const P2P_Port = 3500;

function getMyTailscaleIP() {
  try {
    const status = JSON.parse(execSync("tailscale status --json")).toString();
    return status.Self.TailscaleIP[0] //Gets the IPv4 addresss
  }
  catch (e) {
    console.error("Tailscale not running");
    return null;
  }
}

// 2. The endpoint other peers will call to get this computer's files 
appContext.get('/api/local-files', async (req, res) => {
  //Scan local files (adjust directory as needed)
  try {
    const entries = await fg(['C:/Users/Public/**/*'],
      { onlyFiles: true });
    res.json({
      computer: require('os').hostname(),
      files: entries
    });

  }
  catch (e) {
    res.status(500).send("Error scanning");
  }
});

//3. Start listening ONLY on the Tailscale network 
const myTsIp = getMyTailscaleIP();
if (myTsIp) {

  appContext.listen(P2P_Port, myTsIp, () => {
    console.log(`P2P Node listening on http://${myTsIp}:${P2P_Port}`);
  });

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

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.handle('get-tailscale-devices', () => {
    return new Promise((resolve, reject) => {
      const tailnet = '-' // Use your tailnet name or '-' for default
      const apiKey = "tskey-api-kMuqUf38td11CNTRL-Vio2AVU7QSY2aY6LKhMaSYNC655cZ42L";//ENTER KEY ;)
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
            const data = JSON.parse(body);
            // The Tailscale API returns an object with a 'devices' array, not a direct array
            if (data && data.devices && Array.isArray(data.devices)) {
              const ipsOnly = data.devices.map(device => {
                // Try getting the IPv4 address from the devices list
                return device.addresses && device.addresses.length > 0 ? device.addresses[0] : null
              }).filter(Boolean); // Filter out any null values just in case
              resolve(ipsOnly);
            } else {
              // Fallback if the data shape changes or is empty
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
ipcMain.handle("get-devices", async () => {
  return new Promise((resolve, reject) => {
    exec("tailscale status --json", (err, stdout) => {
      if (err) reject(err);
      else resolve(stdout);
    });
  });
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

