const { app, BrowserWindow } = require('electron')

let mainWindow

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1000, height: 800,
    minWidth: 300, minHeight: 150,
    webPreferences: {
      // --- !! IMPORTANT !! ---
      // Disable 'contextIsolation' to allow 'nodeIntegration'
      // 'contextIsolation' defaults to "true" as from Electron v12
      contextIsolation: false,
      nodeIntegration: true
    },
    backgroundColor: '#82083d'
  })

  mainWindow.loadFile("index.html")

  mainWindow.on('closed', () => { mainWindow = null })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) createWindow()
})
