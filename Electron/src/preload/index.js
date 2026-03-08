import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getTailscaleDevices: () => ipcRenderer.invoke('get-tailscale-devices'),
  getTailscaleStatus: () => ipcRenderer.invoke('get-tailscale-status'),
  getFilesFromPeer: (ip, path) => ipcRenderer.invoke('get-files-from-peer', { ip, path })
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
