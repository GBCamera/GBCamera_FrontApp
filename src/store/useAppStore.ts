// src/store/useAppStore.ts
import { create } from 'zustand'

export type Quality = '720p' | '1080p' | '4k'

export const QUALITY_MAP: Record<Quality, { width: number; height: number }> = {
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '4k': { width: 3840, height: 2160 },
}

export type AppState = {
  index: string
  frame: string | null
  images: string[]
  selectImg: string[]
  stream: MediaStream | null

  quality: Quality
  fps: number
  isFront: boolean
  deviceId: string
  devices: MediaDeviceInfo[]

  /** ✅ 선택된 이미지 인덱스 */
  selectedIdx: number[]
  setSelectedIdx: (idxs: number[]) => void
  addSelectedIdx: (idx: number, limit?: number) => void
  clearSelectedIdx: () => void

  /** ✅ 최종 합성 결과 (dataURL) */
  resultImage: string | null

  setFrame: (frame: string) => void
  setImages: (images: string[]) => void
  setSelectImg: (selectImg: string[]) => void
  setIndex: (index: string) => void
  setStream: (stream: MediaStream | null) => void
  setImageAt: (idx: number, dataUrl: string) => void

  setQuality: (q: Quality) => void
  setFps: (fps: number) => void
  setIsFront: (b: boolean) => void
  setDeviceId: (id: string) => void
  setDevices: (list: MediaDeviceInfo[]) => void

  setResultImage: (dataUrl: string | null) => void

  reset: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  frame: null,
  images: Array(8).fill(''),
  selectImg: Array(4).fill(''),
  index: '',
  stream: null,

  quality: '1080p',
  fps: 30,
  isFront: true,
  deviceId: '',
  devices: [],

  /** ✅ 초기값 */
  selectedIdx: [],
  resultImage: null,

  /** ✅ 선택 인덱스 관련 액션 */
  setSelectedIdx: (idxs) => set({ selectedIdx: idxs }),
  addSelectedIdx: (idx, limit = 3) =>
    set((s) => {
      if (s.selectedIdx.includes(idx)) return s // 이미 선택됨
      if (s.selectedIdx.length >= limit) return s // 최대 개수 초과 방지
      return { selectedIdx: [...s.selectedIdx, idx] }
    }),
  clearSelectedIdx: () => set({ selectedIdx: [] }),

  /** ✅ 이미지 관련 액션 */
  setFrame: (frame) => set({ frame }),
  setImages: (images) => set({ images }),
  setSelectImg: (selectImg) => set({ selectImg }),
  setIndex: (index) => set({ index }),
  setStream: (stream) => set({ stream }),

  setImageAt: (idx, dataUrl) =>
    set((s) => {
      const next = [...s.images]
      if (idx >= 0 && idx < next.length) next[idx] = dataUrl
      return { images: next }
    }),

  /** ✅ 설정 관련 */
  setQuality: (q) => set({ quality: q }),
  setFps: (fps) => set({ fps }),
  setIsFront: (b) => set({ isFront: b }),
  setDeviceId: (id) => set({ deviceId: id }),
  setDevices: (list) => set({ devices: list }),

  /** ✅ 결과 저장 */
  setResultImage: (dataUrl) => set({ resultImage: dataUrl }),

  /** ✅ 전체 리셋 */
  reset: () =>
    set((s) => ({
      frame: null,
      images: Array(8).fill(''),
      selectImg: Array(4).fill(''),
      selectedIdx: [],
      index: '',
      // 스트림 및 카메라 설정 유지
      stream: s.stream,
      quality: s.quality,
      fps: s.fps,
      isFront: s.isFront,
      deviceId: s.deviceId,
      devices: s.devices,
      resultImage: null,
    })),
}))
