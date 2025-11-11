// src/pages/TakePicture.tsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

export default function TakePicture() {
    const navigate = useNavigate()

    const videoRef = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    const { frame, stream, isFront, images, setImages } = useAppStore()

    const [shots, setShots] = useState<number>(8)
    const [timer, setTimer] = useState<number>(1)

    useEffect(() => {
        const run = async () => {
            if (!stream || !videoRef.current) return
            videoRef.current.srcObject = stream

            // 📍 비디오 크기 고정
            videoRef.current.width = 1030
            videoRef.current.height = 480

            await videoRef.current.play()
        }
        run()
        return () => {
            if (videoRef.current) videoRef.current.pause()
        }
    }, [stream])

    const captureAndStore = async (targetIndex: number) => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas) return
        if (video.readyState < 2) return

        // 📍 고정된 크기로 캡처
        const w = 1030
        const h = 480
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        if (isFront) {
            ctx.save()
            ctx.translate(w, 0)
            ctx.scale(-1, 1)
            ctx.drawImage(video, 0, 0, w, h)
            ctx.restore()
        } else {
            ctx.drawImage(video, 0, 0, w, h)
        }

        const dataUrl: string = await new Promise<string>((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) return reject(new Error('Blob 생성 실패'))
                const reader = new FileReader()
                reader.onloadend = () => resolve(String(reader.result))
                reader.onerror = reject
                reader.readAsDataURL(blob)
            }, 'image/jpeg', 0.92)
        })

        const next = [...images]
        next[targetIndex] = dataUrl
        setImages(next)
    }

    useEffect(() => {
        if (shots === 0) return
        if (timer === 0) {
            const targetIndex = 8 - shots
            captureAndStore(targetIndex)
            setShots((s) => {
                const next = Math.max(s - 1, 0)
                if (next > 0) setTimer(1)
                return next
            })
            return
        }
        const id = setTimeout(() => setTimer((t) => t - 1), 1000)
        return () => clearTimeout(id)
    }, [timer, shots]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (shots === 0) {
            navigate('/selectImage')
        }
    }, [shots, navigate])

    return (
        <div style={{ display: 'flex', height: '100%', gap: 24, alignItems: 'stretch' }}>
            {/* 왼쪽: 웹캠 */}
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
                        <video
                            ref={videoRef}
                            style={{
                                width: '1030px', // 📍 비디오 표시 크기 고정
                                height: '480px',
                                objectFit: 'cover',
                                transform: isFront ? 'scaleX(-1)' : 'none',
                            }}
                            playsInline
                            muted
                            autoPlay
                        />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
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
                    background: 'transparent',
                    color: 'black',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    padding: 16,
                }}
            >
                <div style={{ fontSize: 14, opacity: 0.85 }}>
                    선택된 프레임: <b>{frame ?? '없음'}</b>
                </div>
                <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1 }}>{shots}/8</div>
                <div style={{ fontSize: 28, fontWeight: 600 }}>{timer}s</div>

                <button
                    onClick={() => navigate('/selectImage')}
                    style={{
                        marginTop: 8,
                        padding: '10px 16px',
                        borderRadius: 10,
                        background: 'transparent',
                        color: 'black',
                        border: '2px solid black',
                        cursor: 'pointer',
                    }}
                >
                    이미지 선택으로 이동
                </button>
            </div>
        </div>
    )
}
