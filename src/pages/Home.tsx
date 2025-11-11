// src/pages/Home.tsx
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export default function Home() {
  const navigate = useNavigate()
  const reset = useAppStore((s) => s.reset)
  const setIndex = useAppStore((s) => s.setIndex)
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    if (loading) return
    setLoading(true)
    try {
      reset()
      // 백엔드에 POST /index
      const res = await fetch(`${API_BASE}/index`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`)
      }
      const data = (await res.json()) as { index: string }
      if (!data?.index) throw new Error('Invalid response: no index')

      // ✅ index를 전역 스토어에 저장
      setIndex(data.index)

      // 다음 화면으로 이동
      navigate('/selectThema')
    } catch (err) {
      console.error(err)
      alert('서버와 통신 중 문제가 발생했습니다. 서버가 실행 중인지 확인해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        position: 'relative',
      }}
    >
      {/* ⚙️ 설정 버튼 */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          navigate('/setting')
        }}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '36px',
        }}
      >
        ⚙️
      </button>

      {/* 시작 버튼 */}
      <button
        onClick={handleStart}                // ✅ 변경: 클릭 시 API 호출
        disabled={loading}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '24px',
          fontWeight: 600,
          textAlign: 'center',
          opacity: loading ? 0.6 : 1,
        }}
      >
        <p style={{ margin: 0, lineHeight: 1.2, color: 'black' }}>인생네컷</p>
        <p
          style={{
            marginTop: '40px',
            fontSize: '20px',
            opacity: 0.8,
            color: 'black',
          }}
        >
          {loading ? '시작 중...' : '시작하기'}
        </p>
      </button>
    </div>
  )
}
