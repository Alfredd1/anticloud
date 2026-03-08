import DeviceIps from './components/Tailscale/DeviceIps'
import DeviceStatus from './components/Tailscale/DeviceStatus'

function App() {
  const ipcHandle = () => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <div>
        <DeviceIps />
      </div>

      <div>
        <DeviceStatus />
      </div>
    </>
  )
}

export default App
