import GetIps from "./components/GetIps"

function App() {
  const ipcHandle = () => window.electron.ipcRenderer.send('ping')

  return (
    <>
    <div>
      <GetIps/>
    </div>
    </>
  )
}

export default App
