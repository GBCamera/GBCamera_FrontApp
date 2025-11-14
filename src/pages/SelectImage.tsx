import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

type Slot = { x: number; y: number; w: number; h: number }

const FRAME_W = 1181
const FRAME_H = 1772
const FRAME_ASPECT = FRAME_W / FRAME_H

const frameImages = import.meta.glob('../image/*.png', { eager: true, as: 'url' })

// 🔢 오른쪽에서 보여줄 썸네일 개수
const VISIBLE_COUNT = 6

export default function SelectImage() {
  const navigate = useNavigate()
  const { images, setSelectImg } = useAppStore()

  // 선택된 이미지 인덱스 (로컬 상태)
  const [selectedIdx, setSelectedIdx] = useState<number[]>([])

  const leftPaneRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const frameImgRef = useRef<HTMLImageElement | null>(null)
  const imageCacheRef = useRef<Map<number, HTMLImageElement>>(new Map())
  const [isReady, setIsReady] = useState(false)

  const framePath = frameImages['../image/1.png'] as string

  // 📌 프레임 속 슬롯 위치 설정
  const BASE_X = 0.065
  const BASE_Y = 0.02
  const SLOT_W = 0.87
  const SLOT_H = 0.32
  const GAP_PX = -1
  const MAX_SLOTS = 3

  const linearLayout: Slot[] = useMemo(() => {
    const count = Math.min(MAX_SLOTS, selectedIdx.length || MAX_SLOTS)
    const arr: Slot[] = []
    for (let i = 0; i < count; i++) {
      arr.push({
        x: BASE_X,
        y: BASE_Y + i * (SLOT_H - 0.034),
        w: SLOT_W,
        h: SLOT_H,
      })
    }
    return arr
  }, [selectedIdx.length])

  // 이미지 로더
  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })

  // 캔버스 사이즈 조정
  const sizeCanvasToContainer = () => {
    const canvas = canvasRef.current
    const host = leftPaneRef.current
    if (!canvas || !host) return { cssW: 0, cssH: 0 }

    const availW = host.clientWidth
    const availH = host.clientHeight
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

  // 캔버스 다시 그리기
  const redraw = async () => {
    const canvas = canvasRef.current
    const frameImg = frameImgRef.current
    if (!canvas || !frameImg) return
    const { cssW, cssH } = sizeCanvasToContainer()
    if (!cssW || !cssH) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, cssW, cssH)
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, cssW, cssH)

    const visibleCount = Math.min(selectedIdx.length, MAX_SLOTS)
    for (let i = 0; i < visibleCount; i++) {
      const idx = selectedIdx[i]
      const src = images[idx]
      if (!src) continue

      let imgEl = imageCacheRef.current.get(idx)
      if (!imgEl) {
        imgEl = await loadImage(src)
        imageCacheRef.current.set(idx, imgEl)
      }

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

  // 프레임 이미지 로드
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      frameImgRef.current = img
      setIsReady(true)
      redraw()
    }
    img.src = framePath
  }, [framePath])

  // 선택 변경 시 다시 그리기
  useEffect(() => {
    if (isReady) redraw()
  }, [selectedIdx, isReady, linearLayout, images])

  // 창 크기 변경 시 업데이트
  useEffect(() => {
    const onResize = () => redraw()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [selectedIdx, linearLayout, isReady])

  // 썸네일 선택
  const handlePick = (idx: number) => {
    if (!isReady || !images[idx]) return
    setSelectedIdx((prev) => {
      if (prev.includes(idx)) return prev.filter((i) => i !== idx)
      if (prev.length >= MAX_SLOTS) return prev
      return [...prev, idx]
    })
  }

  // 다음 페이지 이동
  const handleGoSelectFrame = () => {
    const selectedImages = selectedIdx.map((i) => images[i]).filter(Boolean)
    setSelectImg(selectedImages)
    navigate('/selectframe')
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
          flex: '0 0 60%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            border: '2px solid #333',
            borderRadius: 8,
            background: '#000',
          }}
        />
      </div>

      {/* 오른쪽 썸네일 6개 (2×3) */}
      <div
        style={{
          flex: '0 0 40%',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          gap: 8,
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gridTemplateRows: 'repeat(3, auto)', // 🔁 행 높이를 콘텐츠에 맞게
            gap: 8,
          }}
        >
          {images.slice(0, VISIBLE_COUNT).map((img, idx) => {
            const isSelected = selectedIdx.includes(idx)
            return (
              <button
                key={idx}
                onClick={() => handlePick(idx)}
                disabled={!img}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: img ? 'pointer' : 'default',
                  width: '100%',
                  // height는 콘텐츠에 맡김
                }}
              >
                <div
                  style={{
                    width: '100%',
                    borderRadius: 10,
                    border: isSelected ? '3px solid #4f8cff' : '2px solid #ccc',
                    overflow: 'hidden',
                    opacity: isSelected ? 0.7 : 1,
                    position: 'relative',
                    aspectRatio: '1030 / 480', // ✅ 썸네일 박스를 이미지 비율로 고정
                  }}
                >
                  {img ? (
                    <img
                      src={img}
                      alt={`이미지 ${idx + 1}`}
                      onLoad={(e) => {
                        const el = e.currentTarget
                        console.log(
                          `썸네일 ${idx} - natural: ${el.naturalWidth}x${el.naturalHeight}, display: ${el.clientWidth}x${el.clientHeight}`
                        )
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background: '#eee',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#888',
                        border: '2px dashed #ccc',
                      }}
                    >
                      {idx + 1}
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* 버튼 */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleGoSelectFrame}
            disabled={selectedIdx.length === 0}
            style={{
              height: 48,
              width: '100%',
              fontSize: 18,
              borderRadius: 8,
              cursor: selectedIdx.length ? 'pointer' : 'not-allowed',
              opacity: selectedIdx.length ? 1 : 0.6,
            }}
          >
            프레임 선택하기
          </button>
        </div>
      </div>
    </div>
  )
}
