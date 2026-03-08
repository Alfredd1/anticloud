import GetDeviceList from "./components/GetDeviceList.jsx";

function App() {
  const ipcHandle = () => window.electron.ipcRenderer.send('ping')

  return (
    <>
    <div>
      <GetDeviceList />
    </div>
    </>
  )
}

export default App
