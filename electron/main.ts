import { app, BrowserWindow, ipcMain } from 'electron'
import type { WebContents } from 'electron'
import * as path from 'path'
import * as fs from 'fs'

let mainWindow: BrowserWindow | null = null
const isDev = !app.isPackaged

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js')

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
    autoHideMenuBar: true,
    show: true,
  })

  if (isDev) {
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173/'
    mainWindow.loadURL(devUrl)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    const indexHtml = path.join(process.resourcesPath, 'dist', 'index.html')
    const fallback = path.join(__dirname, '..', 'dist', 'index.html')
    mainWindow.loadFile(fs.existsSync(indexHtml) ? indexHtml : fallback)
  }

  mainWindow.on('closed', () => { mainWindow = null })
}

/** -----------------------
 *  로컬 타입 (any 금지)
 *  ----------------------*/
type Printer = {
  name: string
  displayName?: string
  isDefault?: boolean
}

type WCWithPrinters = WebContents & {
  getPrinters?: () => Printer[]
  getPrintersAsync?: () => Promise<Printer[]>
}

/** -----------------------
 *  프린터 목록 요청
 *  ----------------------*/
ipcMain.handle('printers:list', async (event) => {
  const wc = event.sender as WCWithPrinters
  const printers: Printer[] =
    (wc.getPrintersAsync ? await wc.getPrintersAsync() : wc.getPrinters?.()) ?? []
  return printers.map((p) => ({
    name: p.name,
    displayName: p.displayName,
    isDefault: p.isDefault,
  }))
})

/** -----------------------
 *  이미지(dataURL) 인쇄 (다이얼로그 없이)
 *  ----------------------*/
ipcMain.handle('print:image', async (_event, payload: { dataURL: string; deviceName?: string; copies?: number }) => {
  const { dataURL, deviceName, copies = 1 } = payload || {}
  if (!dataURL || !/^data:image\/(png|jpeg|jpg);base64,/.test(dataURL)) {
    throw new Error('Invalid dataURL provided for printing')
  }

  return await new Promise<boolean>((resolve, reject) => {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      backgroundColor: '#ffffff',
      webPreferences: { offscreen: true },
    })

    // ✅ window.print() 제거 — 다이얼로그가 뜨는 원인이므로 사용하지 않음
    const html = `<!doctype html>
<html>
<head><meta charset="utf-8" />
<style>
  *{margin:0;padding:0}
  html,body{width:100%;height:100%;background:#fff}
  img{width:100vw;height:100vh;object-fit:contain;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  @page{size:auto;margin:0}
</style></head>
<body>
  <img id="p" src="${dataURL}" />
</body></html>`

    win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))

    win.webContents.on('did-finish-load', async () => {
      try {
        // 이미지 로드가 실제로 끝났는지 확인 후 인쇄
        await win.webContents.executeJavaScript(`
          new Promise((resolve, reject) => {
            const img = document.getElementById('p');
            if (!img) return reject('no img');
            if (img.complete) return resolve(true);
            img.onload = () => resolve(true);
            img.onerror = () => reject('img error');
          })
        `)

        win.webContents.print(
          {
            silent: true,                  // ✅ 다이얼로그 없이 출력
            deviceName: deviceName || undefined, // 특정 프린터 지정 가능
            printBackground: true,
            copies,
            margins: { marginType: 'none' },
            landscape: false,
          },
          (success, reason) => {
            win.destroy()
            if (!success) reject(new Error(reason || 'Print failed'))
            else resolve(true)
          }
        )
      } catch (err) {
        win.destroy()
        reject(err)
      }
    })
  })
})

/** -----------------------
 *  앱 생명주기 관리
 *  ----------------------*/
app.whenReady().then(createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
