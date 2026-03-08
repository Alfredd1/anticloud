// import DeviceIps from './components/Tailscale/DeviceIps'
// import DeviceStatus from './components/Tailscale/DeviceStatus'
import TreeView from "./components/TreeViewer"

function App() {
  const ipcHandle = () => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <div>
        <TreeView/>
      </div>
    </>
  )
}

export default App
