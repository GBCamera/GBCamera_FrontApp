// electron/preload.js (CommonJS)
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  listPrinters: () => ipcRenderer.invoke('printers:list'),
  printImage: (payload) => ipcRenderer.invoke('print:image', payload),
})
