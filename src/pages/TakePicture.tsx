// src/pages/TakePicture.tsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
// 🔊 촬영 사운드 임포트
import shutterUrl from '../sound/sound.mp3'

// 📸 프레임 이미지 (투명 배경, 사람은 오른쪽)
import tema1 from '../image/tema1.png'
import tema2 from '../image/tema2.png'
import tema3 from '../image/tema3.png'

const OUTPUT_W = 1030
const OUTPUT_H = 480

export default function TakePicture() {
    const navigate = useNavigate()

    const videoRef = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const shutterRef = useRef<HTMLAudioElement | null>(null)

    const { stream, isFront, images, setImages, frame } = useAppStore()

    const TOTAL_SHOTS = 6
    const [shots, setShots] = useState<number>(TOTAL_SHOTS)
    const [timer, setTimer] = useState<number>(10)

    const isFrameMode = frame === '2'
    const overlayFrames = [tema1, tema2, tema3]

    // 현재 몇 번째 샷인지(0~5)
    const currentShotIndex = Math.max(0, Math.min(TOTAL_SHOTS - 1, TOTAL_SHOTS - shots))

    // shotIndex(0~5) → frameIndex(0~2)
    const getOverlayForShot = (shotIndex: number) => {
        const clamped = Math.max(0, Math.min(TOTAL_SHOTS - 1, shotIndex))
        const frameIndex = Math.floor(clamped / 2) // 0,1→0 / 2,3→1 / 4,5→2
        return overlayFrames[frameIndex]
    }

    // 미리보기용 현재 프레임
    const currentOverlay = isFrameMode ? getOverlayForShot(currentShotIndex) : null

    useEffect(() => {
        const run = async () => {
        if (!stream || !videoRef.current) return
        videoRef.current.srcObject = stream

        // 미리보기 사이즈 고정
        videoRef.current.width = OUTPUT_W
        videoRef.current.height = OUTPUT_H

        await videoRef.current.play()
        }
        run()
        return () => {
        if (videoRef.current) videoRef.current.pause()
        }
    }, [stream])

    /** 🔊 셔터 사운드 */
    const playShutter = (waitForEnd: boolean) => {
        const audio = shutterRef.current
        if (!audio) return Promise.resolve()

        audio.pause()
        audio.currentTime = 0

        return new Promise<void>(async (resolve) => {
        try {
            await audio.play()
        } catch {
            resolve()
            return
        }

        if (!waitForEnd) {
            resolve()
            return
        }

        const onEnded = () => {
            audio.removeEventListener('ended', onEnded)
            resolve()
        }
        if (audio.ended) {
            resolve()
        } else {
            audio.addEventListener('ended', onEnded, { once: true })
        }
        })
    }

    /** 📸 캡처 + (옵션) 프레임 합성 + 저장 */
    const captureAndStore = async (
        targetIndex: number,
        opts?: { waitSoundEnd?: boolean; overlaySrc?: string | null }
    ) => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas) return
        if (video.readyState < 2) return

        const w = OUTPUT_W
        const h = OUTPUT_H
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.clearRect(0, 0, w, h)

        // 🔍 비디오 원본 크기
        const videoW = video.videoWidth
        const videoH = video.videoHeight

        console.log('video size:', videoW, videoH)

        // ⚠️ 아직 videoWidth/Height가 0인 경우: 예전 방식으로 fallback
        if (!videoW || !videoH) {
        if (isFront) {
            ctx.save()
            ctx.translate(w, 0)
            ctx.scale(-1, 1)
            ctx.drawImage(video, 0, 0, w, h)
            ctx.restore()
        } else {
            ctx.drawImage(video, 0, 0, w, h)
        }
        } else {
        // ✅ object-fit: cover와 같은 방식으로 가운데를 잘라서 그리기
        const canvasAspect = w / h // 1030 / 480
        const videoAspect = videoW / videoH

        let srcX = 0
        let srcY = 0
        let srcW = videoW
        let srcH = videoH

        if (videoAspect > canvasAspect) {
            // 비디오가 더 가로로 넓음 → 좌우를 잘라냄
            srcH = videoH
            srcW = videoH * canvasAspect
            srcX = (videoW - srcW) / 2
            srcY = 0
        } else {
            // 비디오가 더 세로로 길거나 동일 → 상하를 잘라냄
            srcW = videoW
            srcH = videoW / canvasAspect
            srcX = 0
            srcY = (videoH - srcH) / 2
        }

        if (isFront) {
            // 🎥 전면카메라: 좌우 반전
            ctx.save()
            ctx.translate(w, 0)
            ctx.scale(-1, 1)
            ctx.drawImage(video, srcX, srcY, srcW, srcH, 0, 0, w, h)
            ctx.restore()
        } else {
            // 📷 후면카메라: 그대로
            ctx.drawImage(video, srcX, srcY, srcW, srcH, 0, 0, w, h)
        }
        }

        // 2) 프레임 이미지가 있다면 오버레이 (비율 유지 contain)
        if (opts?.overlaySrc) {
        const frameImg = new Image()
        frameImg.src = opts.overlaySrc
        await new Promise<void>((resolve, reject) => {
            frameImg.onload = () => resolve()
            frameImg.onerror = () => reject(new Error('프레임 이미지 로드 실패'))
        })

        const frameW = frameImg.width
        const frameH = frameImg.height

        if (frameW && frameH) {
            // object-fit: contain처럼 프레임 비율 유지해서 중앙 배치
            const scale = Math.min(w / frameW, h / frameH)
            const drawW = frameW * scale
            const drawH = frameH * scale
            const drawX = (w - drawW) / 2
            const drawY = (h - drawH) / 2

            ctx.drawImage(frameImg, drawX, drawY, drawW, drawH)
        } else {
            // 혹시라도 사이즈를 못 읽으면 기존 방식으로
            ctx.drawImage(frameImg, 0, 0, w, h)
        }
        }

        // 3) 셔터 사운드
        await playShutter(!!opts?.waitSoundEnd)

        // 4) 결과를 dataURL로 변환 (항상 1030x480)
        const dataUrl: string = await new Promise<string>((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
            if (!blob) return reject(new Error('Blob 생성 실패'))
            const reader = new FileReader()
            reader.onloadend = () => resolve(String(reader.result))
            reader.onerror = reject
            reader.readAsDataURL(blob)
            },
            'image/jpeg',
            0.92
        )
        })

        const next = [...images]
        next[targetIndex] = dataUrl
        setImages(next)
    }

    /** ⏱ 자동 타이머 / 연속 촬영 로직 */
    useEffect(() => {
        if (shots === 0) return

        if (timer === 0) {
        ;(async () => {
            // 이번에 찍을 인덱스 (0~5)
            const targetIndex = TOTAL_SHOTS - shots
            const isLast = shots === 1

            // 프레임 모드일 때는 shotIndex 기준으로 프레임 선택
            const overlaySrc = isFrameMode ? getOverlayForShot(targetIndex) : null

            await captureAndStore(targetIndex, {
            waitSoundEnd: isLast,
            overlaySrc,
            })

            if (isLast) {
            navigate('/selectImage')
            } else {
            setShots((s) => {
                const nextShots = Math.max(s - 1, 0)
                if (nextShots > 0) setTimer(10)
                return nextShots
            })
            }
        })()

        return
        }

        const id = setTimeout(() => setTimer((t) => t - 1), 1000)
        return () => clearTimeout(id)
    }, [timer, shots, navigate, isFrameMode])

    return (
        <div style={{ display: 'flex', height: '100%', gap: 24, alignItems: 'stretch' }}>
        {/* 왼쪽: 웹캠 + (옵션) 프레임 오버레이 */}
        <div
            style={{
            flex: 1,
            borderRadius: 16,
            overflow: 'hidden',
            border: '2px solid rgba(0,0,0,0.8)',
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 300,
            }}
        >
            {stream ? (
            <>
                <div
                style={{
                    position: 'relative',
                    width: `${OUTPUT_W}px`,
                    height: `${OUTPUT_H}px`,
                }}
                >
                <video
                    ref={videoRef}
                    style={{
                    width: `${OUTPUT_W}px`,
                    height: `${OUTPUT_H}px`,
                    objectFit: 'cover',
                    transform: isFront ? 'scaleX(-1)' : 'none',
                    }}
                    playsInline
                    muted
                    autoPlay
                />
                {/* 프레임 모드일 때 웹캠 위에 프레임 이미지 표시 */}
                {isFrameMode && currentOverlay && (
                    <img
                    src={currentOverlay}
                    alt="frame overlay"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: `${OUTPUT_W}px`,
                        height: `${OUTPUT_H}px`,
                        objectFit: 'contain',
                        pointerEvents: 'none',
                    }}
                    />
                )}
                </div>
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <audio ref={shutterRef} src={shutterUrl} preload="auto" />
            </>
            ) : (
            <div style={{ color: '#000', opacity: 0.8 }}>
                카메라가 꺼져 있습니다. 설정에서 카메라를 켜주세요.
            </div>
            )}
        </div>

        {/* 오른쪽: 진행 정보 */}
        <div
            style={{
            width: 340,
            borderRadius: 16,
            border: '2px solid rgba(0,0,0,0.8)',
            background: 'rgba(255,255,255,0.7)',
            color: 'black',

            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',

            padding: 20,
            gap: 24,

            backdropFilter: 'blur(6px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
        >
            <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1 }}>
            {shots}/{TOTAL_SHOTS}
            </div>
            <div style={{ fontSize: 32, fontWeight: 600, opacity: 0.8 }}>{timer}s</div>
        </div>
        </div>
    )
}
