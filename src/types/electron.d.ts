// src/types/electron.d.ts
import type { ElectronAPI } from '../../electron/preload'

// Renderer 전역(window)에 bridge 노출
declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

/**
 * 'electron' 모듈에 대한 타입 보강
 * - WebContents에 getPrinters / getPrintersAsync 추가
 * - PrinterInfo에 isDefault 등 필요한 필드 추가
 */
import 'electron'
declare module 'electron' {
  interface PrinterInfo {
    name: string
    displayName?: string
    isDefault?: boolean
    // 필요 시 여기에 추가 필드를 확장해도 됩니다 (description, status, options 등)
  }

  interface WebContents {
    getPrinters?: () => PrinterInfo[]
    getPrintersAsync?: () => Promise<PrinterInfo[]>
  }
}

export {}
