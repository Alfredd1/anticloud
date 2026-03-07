

function App() {
  const ipcHandle = () => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <div>
        <p className='font-medium'>Hello world</p>
      </div>
    </>
  )
}

export default App
