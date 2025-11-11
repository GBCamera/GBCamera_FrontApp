// src/pages/Setting.tsx
import { useEffect, useRef, useState } from 'react'
import { useAppStore, QUALITY_MAP } from '../store/useAppStore'
import type { Quality } from '../store/useAppStore'
import { useNavigate } from 'react-router-dom'
import { getPrinters, setSavedPrinter, getSavedPrinter } from '../lib/printer'
import type { Printer } from '../lib/printer'

export default function Setting() {
    const navigate = useNavigate()
    const videoRef = useRef<HTMLVideoElement | null>(null)

    const {
        stream, setStream,
        quality, setQuality,
        fps, setFps,
        isFront, setIsFront,
        deviceId, setDeviceId,
        devices, setDevices,
    } = useAppStore()

    // ------- Electron 프린터 연동 -------
    const [printers, setPrinters] = useState<Printer[]>([])
    const [printerName, setPrinterName] = useState<string>(getSavedPrinter() || '')

    useEffect(() => {
        // Electron 환경에서만 목록이 들어옵니다 (웹 브라우저에서는 빈 배열)
        getPrinters().then((list) => {
            setPrinters(list)
            if (!printerName && list.length > 0) {
                const def = list.find((p) => p.isDefault)
                if (def) {
                    setPrinterName(def.name)
                    setSavedPrinter(def.name)
                }
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function handlePrinterChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const name = e.target.value
        setPrinterName(name)
        setSavedPrinter(name)
    }

    // 현재 비디오 트랙
    const getVideoTrack = () => stream?.getVideoTracks?.()[0]

    // 장치 나열
    const refreshDevices = async () => {
        const list = await navigator.mediaDevices.enumerateDevices()
        setDevices(list.filter((d) => d.kind === 'videoinput'))
    }

    // 스트림 시작/재시작
    const startOrRestart = async (opts?: { forceDeviceId?: string }) => {
        const { width, height } = QUALITY_MAP[quality]
        const constraints: MediaStreamConstraints = {
            video: opts?.forceDeviceId
                ? {
                    deviceId: { exact: opts.forceDeviceId },
                    width: { ideal: width },
                    height: { ideal: height },
                    frameRate: { ideal: fps, max: Math.max(30, fps) },
                }
                : {
                    // 후면은 일부 브라우저에서 environment 지원, 안되면 기본 장치 유지
                    facingMode: isFront ? 'user' : ({ exact: 'environment' } as const),
                    width: { ideal: width },
                    height: { ideal: height },
                    frameRate: { ideal: fps, max: Math.max(30, fps) },
                },
            audio: false,
        }

        // 새 스트림
        const newStream = await navigator.mediaDevices.getUserMedia(constraints)

        // 미리보기 연결
        if (videoRef.current) {
            videoRef.current.srcObject = newStream
            await videoRef.current.play()
        }

        // 기존 정리 + store에 저장
        const old = stream
        setStream(newStream)
        if (old) old.getTracks().forEach((t) => t.stop())

        // 장치 목록 갱신
        await refreshDevices()
    }

    // 이미 켜진 트랙에 해상도/FPS 적용
    const applyQuality = async () => {
        const track = getVideoTrack()
        if (!track) return
        const { width, height } = QUALITY_MAP[quality]
        await track.applyConstraints({
            width: { ideal: width },
            height: { ideal: height },
            frameRate: { ideal: fps, max: Math.max(30, fps) },
        })
    }

    // 처음 들어오면(또는 stream 없으면) 권한 요청 + 스트림 시작
    useEffect(() => {
        const boot = async () => {
            try {
                if (!stream) {
                    await startOrRestart()
                } else if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    await videoRef.current.play()
                }
                await refreshDevices()
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error('카메라 초기화 실패:', e)
                alert('카메라 권한을 허용해주세요.')
            }
        }
        boot()

        // 페이지 떠날 때 미리보기만 일시정지(스트림은 유지: 재권한 방지)
        return () => {
            if (videoRef.current) videoRef.current.pause()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div style={{ display: 'flex', height: '100%', gap: 24, alignItems: 'stretch' }}>
            {/* 왼쪽: 미리보기 */}
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
                <video
                    ref={videoRef}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: isFront ? 'scaleX(-1)' : 'none', // 전면 미러
                    }}
                    playsInline
                    muted
                    autoPlay
                />
            </div>

            {/* 오른쪽: 설정 */}
            <div
                style={{
                    width: 340,
                    borderRadius: 16,
                    border: '2px solid rgba(0,0,0,0.8)',
                    background: 'transparent',
                    color: 'black',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    padding: 16,
                }}
            >
                <h3 style={{ margin: 0 }}>카메라 설정</h3>

                {/* 해상도 */}
                <label style={{ fontSize: 12 }}>해상도</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {(['720p', '1080p', '4k'] as Quality[]).map((q) => (
                        <button
                            key={q}
                            onClick={async () => {
                                setQuality(q)
                                await applyQuality()
                            }}
                            style={{
                                padding: '6px 10px',
                                borderRadius: 8,
                                border: '1px solid #000',
                                background: quality === q ? '#000' : 'transparent',
                                color: quality === q ? '#fff' : '#000',
                                cursor: 'pointer',
                            }}
                        >
                            {q.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* FPS */}
                <label style={{ fontSize: 12, marginTop: 6 }}>FPS: {fps}</label>
                <input
                    type="range"
                    min={15}
                    max={60}
                    step={1}
                    value={fps}
                    onChange={(e) => setFps(parseInt(e.target.value, 10))}
                    onMouseUp={applyQuality}
                    onTouchEnd={applyQuality}
                />

                {/* 전/후면 전환 */}
                <button
                    onClick={async () => {
                        setIsFront(!isFront)
                        await startOrRestart()
                    }}
                    style={{
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid #000',
                        background: 'transparent',
                        cursor: 'pointer',
                    }}
                >
                    카메라 반전 (현재: {isFront ? '원본' : '반전'})
                </button>

                {/* 장치 선택 */}
                {devices.length > 0 && (
                    <>
                        <label style={{ fontSize: 12 }}>카메라 선택</label>
                        <select
                            value={deviceId}
                            onChange={async (e) => {
                                const id = e.target.value
                                setDeviceId(id)
                                await startOrRestart({ forceDeviceId: id || undefined })
                            }}
                            style={{
                                padding: 6,
                                borderRadius: 8,
                                border: '1px solid #000',
                                background: 'transparent',
                            }}
                        >
                            <option value="">기본 장치</option>
                            {devices.map((d) => (
                                <option key={d.deviceId} value={d.deviceId}>
                                    {d.label || `Camera ${d.deviceId.slice(0, 4)}`}
                                </option>
                            ))}
                        </select>
                    </>
                )}

                {/* 수동 재시작(문제시) */}
                <button
                    onClick={() => startOrRestart(deviceId ? { forceDeviceId: deviceId } : undefined)}
                    style={{
                        marginTop: 8,
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: '1px solid #000',
                        background: 'transparent',
                        cursor: 'pointer',
                    }}
                >
                    스트림 재시작
                </button>

                {/* 프린터 선택 */}
                <div style={{ marginTop: 12, textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                        프린터 선택
                    </label>
                    {printers.length === 0 ? (
                        <div style={{ fontSize: 12, opacity: 0.8 }}>
                            Electron 환경이 아니거나 사용 가능한 프린터가 없습니다.
                        </div>
                    ) : (
                        <select
                            value={printerName}
                            onChange={handlePrinterChange}
                            style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #000' }}
                        >
                            <option value="">기본 프린터</option>
                            {printers.map((p) => (
                                <option key={p.name} value={p.name}>
                                    {p.displayName || p.name}{p.isDefault ? ' (기본)' : ''}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <button
                    onClick={() => navigate('/')}
                    style={{
                        marginTop: 8,
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: '1px solid #000',
                        background: 'transparent',
                        cursor: 'pointer',
                    }}
                >
                    돌아가기
                </button>
            </div>
        </div>
    )
}
