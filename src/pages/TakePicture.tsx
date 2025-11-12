// src/pages/TakePicture.tsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
// 🔊 촬영 사운드 임포트
import shutterUrl from '../sound/sound.mp3'

export default function TakePicture() {
    const navigate = useNavigate()

    const videoRef = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    // 🔊 오디오 ref
    const shutterRef = useRef<HTMLAudioElement | null>(null)

    const { stream, isFront, images, setImages } = useAppStore()

    const [shots, setShots] = useState<number>(8)
    const [timer, setTimer] = useState<number>(10) // ⏱️ 초기값

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

    /** 🔊 셔터 사운드 재생 유틸 (끝까지 대기 옵션) */
    const playShutter = (waitForEnd: boolean) => {
        const audio = shutterRef.current
        if (!audio) return Promise.resolve()

        audio.pause()
        audio.currentTime = 0

        return new Promise<void>(async (resolve) => {
        try {
            await audio.play() // 재생 시작 보장
        } catch {
            // 자동재생 차단 등 실패해도 무시하고 진행
            resolve()
            return
        }

        if (!waitForEnd) {
            // 끝까지 안 기다리는 경우 즉시 resolve
            resolve()
            return
        }

        const onEnded = () => {
            audio.removeEventListener('ended', onEnded)
            resolve()
        }
        // 혹시 ended가 이미 발생한 경우 대비
        if (audio.ended) {
            resolve()
        } else {
            audio.addEventListener('ended', onEnded, { once: true })
        }
        })
    }

    const captureAndStore = async (targetIndex: number, opts?: { waitSoundEnd?: boolean }) => {
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

        // 🔊 촬영 소리 (옵션에 따라 끝까지 대기)
        await playShutter(!!opts?.waitSoundEnd)

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
        // 비동기로 처리 (셔터 소리 완료 대기 포함)
        ;(async () => {
            const targetIndex = 8 - shots
            const isLast = shots === 1

            // 마지막 샷이면 셔터 소리 끝날 때까지 대기
            await captureAndStore(targetIndex, { waitSoundEnd: isLast })

            if (isLast) {
            // 마지막 샷: 소리 끝난 뒤에 화면 전환
            navigate('/selectImage')
            } else {
            // 다음 샷으로 진행
            setShots((s) => {
                const next = Math.max(s - 1, 0)
                if (next > 0) setTimer(10) // 다음 촬영까지 대기 시간 재설정
                return next
            })
            }
        })()

        return
        }

        const id = setTimeout(() => setTimer((t) => t - 1), 1000)
        return () => clearTimeout(id)
    }, [timer, shots, navigate]) // eslint-disable-line react-hooks/exhaustive-deps

    // 🔁 shots===0 시점 자동 이동은 제거 (마지막 샷에서 소리 완료 후 navigate하도록 위에서 처리)
    // useEffect(() => {
    //   if (shots === 0) {
    //     navigate('/selectImage')
    //   }
    // }, [shots, navigate])

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
                {/* 🔊 촬영 사운드 엘리먼트 */}
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
            background: 'transparent',
            color: 'black',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            padding: 16,
            }}
        >
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
