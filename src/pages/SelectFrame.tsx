// src/pages/SelectFrame.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { getSavedPrinter } from '../lib/printer' // 설정에서 저장한 프린터 이름 사용

type Slot = { x: number; y: number; w: number; h: number }

const FRAME_W = 1181
const FRAME_H = 1772
const FRAME_ASPECT = FRAME_W / FRAME_H
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const frameImages = import.meta.glob('../image/*.png', { eager: true, as: 'url' })

const toBase64Payload = (dataUrlOrBase64: string) => {
  const comma = dataUrlOrBase64.indexOf(',')
  return comma >= 0 ? dataUrlOrBase64.slice(comma + 1) : dataUrlOrBase64
}

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()))

// 안전한 이미지 로더
function loadImageSafe(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()

    try {
      const isHttp = src.startsWith('http://') || src.startsWith('https://')
      if (isHttp) {
        const sameOrigin = new URL(src, location.href).origin === location.origin
        if (!sameOrigin) img.crossOrigin = 'anonymous'
      }
    } catch {
      // ignore invalid URL format
    }

    img.onload = () => resolve(img)
    img.onerror = (e) => {
      console.warn('[image] load failed:', src, e)
      resolve(null)
    }
    img.src = src
  })
}

const PLACEHOLDER_BG = '#000'

export default function SelectFrame() {
  const navigate = useNavigate()
  const { selectImg, index, setFrame, setResultImage } = useAppStore()

  const [saving, setSaving] = useState(false)
  const [selectedFrame, setSelectedFrame] = useState<string>(
    frameImages['../image/1.png'] as string
  )

  const leftPaneRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const frameImgRef = useRef<HTMLImageElement | null>(null)
  const imageCacheRef = useRef<Map<number, HTMLImageElement>>(new Map())

  /** 배치 설정 */
  const PREVIEW_HEIGHT_RATIO = 0.8
  const FRAME_PANEL_RATIO = 0.4
  const FRAME_CROP_POSITION = 'center'

  const BASE_X = 0.065
  const BASE_Y = 0.02
  const SLOT_W = 0.87
  const SLOT_H = 0.32
  const GAP_PX = -1
  const MAX_SLOTS = 3

  const linearLayout: Slot[] = useMemo(() => {
    const count = Math.min(MAX_SLOTS, selectImg.length)
    return Array.from({ length: count }, (_, i) => ({
      x: BASE_X,
      y: BASE_Y + i * (SLOT_H - 0.034),
      w: SLOT_W,
      h: SLOT_H,
    }))
  }, [selectImg.length])

  const blobToDataURL = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })

  /** 캔버스 사이즈 조정 */
  const sizeCanvasToContainer = () => {
    const canvas = canvasRef.current
    const host = leftPaneRef.current
    if (!canvas || !host) return { cssW: 0, cssH: 0 }

    const availW = host.clientWidth
    const availH = host.clientHeight
    if (!availW || !availH) return { cssW: 0, cssH: 0 }

    let cssH = availH
    let cssW = Math.round(cssH * FRAME_ASPECT)
    if (cssW > availW) {
      cssW = availW
      cssH = Math.round(cssW / FRAME_ASPECT)
    }

    const dpr = Math.max(1, window.devicePixelRatio || 1)
    canvas.width = Math.floor(cssW * dpr)
    canvas.height = Math.floor(cssH * dpr)
    canvas.style.width = `${cssW}px`
    canvas.style.height = `${cssH}px`

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.imageSmoothingEnabled = true
    }
    return { cssW, cssH }
  }

  /** 합성 그리기 */
  const drawComposite = () => {
    const canvas = canvasRef.current
    const frameImg = frameImgRef.current
    if (!canvas || !frameImg) return
    const { cssW, cssH } = sizeCanvasToContainer()
    if (!cssW || !cssH) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, cssW, cssH)
    ctx.fillStyle = PLACEHOLDER_BG
    ctx.fillRect(0, 0, cssW, cssH)

    const visibleCount = Math.min(selectImg.length, MAX_SLOTS)
    for (let i = 0; i < visibleCount; i++) {
      const imgEl = imageCacheRef.current.get(i)
      if (!imgEl) continue

      const slot = linearLayout[i]
      const bandX = Math.round(cssW * slot.x)
      const bandY = Math.round(cssH * slot.y) + i * GAP_PX
      const bandW = Math.round(cssW * slot.w)
      const bandH = Math.round(cssH * slot.h)

      const scaleToFit = Math.min(bandW / imgEl.width, bandH / imgEl.height)
      const drawW = Math.round(imgEl.width * scaleToFit)
      const drawH = Math.round(imgEl.height * scaleToFit)
      const drawX = bandX + Math.floor((bandW - drawW) / 2)
      const drawY = bandY + Math.floor((bandH - drawH) / 2)
      ctx.drawImage(imgEl, drawX, drawY, drawW, drawH)
    }

    ctx.drawImage(frameImg, 0, 0, cssW, cssH)
  }

  /** 초기 렌더시 프레임 즉시 로드 및 표시 */
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      frameImgRef.current = img
      drawComposite()
    }
    img.src = selectedFrame
  }, [])

  /** 프레임/사진 변경 시 재렌더 */
  useEffect(() => {
    const run = async () => {
      await nextFrame()
      sizeCanvasToContainer()

      // 프레임
      const frameEl = await loadImageSafe(selectedFrame)
      if (frameEl) {
        frameImgRef.current = frameEl
        drawComposite()
      }

      // 사진들
      imageCacheRef.current.clear()
      const visibleCount = Math.min(selectImg.length, MAX_SLOTS)
      const tasks = selectImg.slice(0, visibleCount).map((src, i) =>
        loadImageSafe(src).then((img) => {
          if (img) imageCacheRef.current.set(i, img)
        })
      )
      await Promise.allSettled(tasks)
      drawComposite()
    }

    run()
  }, [selectedFrame, selectImg])

  /** 창 크기 변경 시 다시 그림 */
  useEffect(() => {
    const onResize = () => drawComposite()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handleSelectFrame = (path: string) => {
    setSelectedFrame(path)
    setFrame(path)
  }

  /** ✅ 저장 후 프린트는 가능한 경우만 수행하고, 나머지 로직은 항상 실행 */
  const handleSaveAndGoResult = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const printerName = getSavedPrinter()
    console.log('[SelectFrame] saved printer =', printerName)

    // 프린터/전자 API 존재 여부 체크 (있으면 인쇄, 없으면 인쇄만 생략)
    const canPrint = !!printerName && !!window.electronAPI?.printImage

    if (!printerName) {
      alert('선택된 프린터가 없습니다. 인쇄는 생략되고 결과만 저장됩니다.')
    } else if (!window.electronAPI?.printImage) {
      alert('Electron 인쇄 기능을 찾을 수 없어 인쇄는 생략되고 결과만 저장됩니다.')
    }

    setSaving(true)
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setSaving(false)
        return
      }
      const dataURL = await blobToDataURL(blob)
      const payloadBase64 = toBase64Payload(dataURL)

      try {
        // 1) 결과 저장 (기존 로직 유지)
        console.log('[SelectFrame] PUT /index/result', { index })
        const res = await fetch(`${API_BASE}/index/result`, {
          method: 'PUT',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'x-index': String(index),
          },
          body: JSON.stringify({ base64: payloadBase64 }),
        })
        console.log('[SelectFrame] save status =', res.status)
        if (!res.ok) throw new Error(`Server error(save): ${res.status}`)

        // 2) 프린터가 준비된 경우에만 인쇄
        if (canPrint) {
          console.log('[SelectFrame] print via Electron =>', { deviceName: printerName })
          await window.electronAPI!.printImage({
            dataURL: dataURL, // data:image/jpeg;base64,....
            deviceName: printerName!, // 메인에서 deviceName으로 받도록 이미 구현됨
            copies: 1,
          })
        }

        // 3) 상태 저장 후 라우팅 (프린터 유무와 상관없이 실행)
        setResultImage(dataURL)
        navigate('/qr')
      } catch (e) {
        console.error('[SelectFrame] print/save error:', e)
        alert('결과 저장 또는 인쇄에 실패했습니다. 서버/프린터 상태를 확인해주세요.')
      } finally {
        setSaving(false)
      }
    }, 'image/jpeg', 0.92)
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: 24,
        alignItems: 'center',
        justifyContent: 'center',
        height: '85vh',
        overflow: 'hidden',
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      {/* 왼쪽 미리보기 */}
      <div
        ref={leftPaneRef}
        style={{
          flex: `0 0 ${100 - FRAME_PANEL_RATIO * 100}%`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: `${PREVIEW_HEIGHT_RATIO * 100}vh`,
          background: 'transparent',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: 'auto',
            height: '100%',
            maxHeight: `${PREVIEW_HEIGHT_RATIO * 100}vh`,
            border: '2px solid #333',
            borderRadius: 8,
            background: '#000',
          }}
        />
      </div>

      {/* 오른쪽 프레임 선택 */}
      <div
        style={{
          flex: `0 0 ${FRAME_PANEL_RATIO * 100}%`,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          gap: 12,
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gridTemplateRows: 'repeat(3, 1fr)',
            gap: 8,
            justifyItems: 'center',
            alignItems: 'center',
          }}
        >
          {Array.from({ length: 6 }, (_, i) => {
            const path = frameImages[`../image/${i + 1}.png`] as string
            const isActive = selectedFrame === path
            return (
              <button
                key={i}
                onClick={() => handleSelectFrame(path)}
                style={{
                  border: isActive ? '3px solid #4f8cff' : '2px solid #ccc',
                  borderRadius: 8,
                  padding: 0,
                  overflow: 'hidden',
                  background: 'none',
                  cursor: 'pointer',
                  width: 120,
                  height: 150,
                }}
              >
                <img
                  src={path}
                  alt={`프레임 ${i + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: FRAME_CROP_POSITION,
                    opacity: isActive ? 0.8 : 1,
                    display: 'block',
                  }}
                />
              </button>
            )
          })}
        </div>

        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <button
            onClick={handleSaveAndGoResult}
            disabled={saving}
            style={{
              height: 48,
              width: '100%',
              fontSize: 18,
              borderRadius: 8,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? '저장 및 출력 중…' : '결과 저장 및 출력'}
          </button>
        </div>
      </div>
    </div>
  )
}
