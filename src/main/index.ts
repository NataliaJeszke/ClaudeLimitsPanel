import { app, ipcMain, Menu, nativeTheme } from 'electron'
import { menubar } from 'menubar'
import path from 'path'
import { startWatcher, stopWatcher } from './watcher'
import { startScheduler, stopScheduler } from './scheduler'
import { getStoreData, resetMonth, clearAllData, setMonthlyBudget, setLaunchAtLogin } from './store'
import { initPricing } from './price-fetcher'

const isDev = process.env.NODE_ENV === 'development'
const iconPath = path.join(__dirname, '../../assets/tray-iconTemplate.png')

const mb = menubar({
  index: isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../../dist/index.html')}`,
  icon: iconPath,
  browserWindow: {
    width: 340,
    height: 450,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    }
  },
  preloadWindow: true,
})

function sendUsageUpdate(): void {
  if (mb.window && !mb.window.isDestroyed() && !mb.window.webContents.isLoading()) {
    mb.window.webContents.send('usage-update', getStoreData())
  }
}

mb.on('ready', async () => {
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Quit', click: () => app.quit() }
  ])
  mb.tray.on('right-click', () => {
    mb.tray.popUpContextMenu(contextMenu)
  })

  // Fetch fresh pricing before starting the watcher
  await initPricing()

  startScheduler(() => sendUsageUpdate())
  startWatcher(() => sendUsageUpdate())
  nativeTheme.on('updated', () => mb.tray.setImage(iconPath))
})

mb.on('after-show', () => sendUsageUpdate())

ipcMain.handle('get-usage-data', () => getStoreData())

ipcMain.handle('update-budget', (_event, budget: number) => {
  setMonthlyBudget(budget)
  sendUsageUpdate()
  return true
})

ipcMain.handle('reset-month', () => {
  resetMonth()
  sendUsageUpdate()
  return true
})

ipcMain.handle('clear-all-data', () => {
  clearAllData()
  sendUsageUpdate()
  return true
})

ipcMain.handle('set-launch-at-login', (_event, value: boolean) => {
  setLaunchAtLogin(value)
  app.setLoginItemSettings({ openAtLogin: value, openAsHidden: true })
  return true
})

app.on('before-quit', () => {
  stopWatcher()
  stopScheduler()
})
