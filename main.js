const { app, BrowserWindow, ipcMain } = require('electron')

let mainWindow, secondWindow

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
    backgroundColor: '#121212'
  })

  secondWindow = new BrowserWindow({
    width: 600, height: 300,
    minWidth: 600, minHeight: 300,
    webPreferences: {
      // --- !! IMPORTANT !! ---
      // Disable 'contextIsolation' to allow 'nodeIntegration'
      // 'contextIsolation' defaults to "true" as from Electron v12
      contextIsolation: false,
      nodeIntegration: true
    },
    backgroundColor: '#121212'
  })

  mainWindow.loadFile("index.html")
  secondWindow.loadFile('scoreboard.html')

  mainWindow.on('closed', () => { mainWindow = null })
}

ipcMain.on('toMain', (e, args) => {
  mainWindow.webContents.send('toMain', args)
})

ipcMain.on('toScoreboard', (e, args) => {
  secondWindow.webContents.send('toScoreboard', args)
})

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) createWindow()
})
