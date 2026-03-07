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
