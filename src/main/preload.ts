import { contextBridge, ipcRenderer } from 'electron'
import type { UsageUpdate } from '../shared/types'

contextBridge.exposeInMainWorld('electronAPI', {
  getUsageData: () => ipcRenderer.invoke('get-usage-data'),
  updateBudget: (budget: number) => ipcRenderer.invoke('update-budget', budget),
  resetMonth: () => ipcRenderer.invoke('reset-month'),
  clearAllData: () => ipcRenderer.invoke('clear-all-data'),
onUsageUpdate: (callback: (data: UsageUpdate) => void) => {
    ipcRenderer.on('usage-update', (_event, data) => callback(data))
  },
  removeUsageUpdateListener: () => {
    ipcRenderer.removeAllListeners('usage-update')
  }
})
