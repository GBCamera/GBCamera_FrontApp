export type Printer = { name: string; displayName?: string; isDefault?: boolean }
const KEY = 'printerName'

export async function getPrinters(): Promise<Printer[]> {
  try {
    return (await window.electronAPI?.listPrinters()) ?? []
  } catch {
    return []
  }
}

export function getSavedPrinter(): string | null {
  return localStorage.getItem(KEY)
}

export function setSavedPrinter(name: string) {
  localStorage.setItem(KEY, name)
}

export async function printDataURL(dataURL: string, copies: number = 1) {
  const deviceName = getSavedPrinter() || undefined
  await window.electronAPI?.printImage({ dataURL, deviceName, copies })
}
