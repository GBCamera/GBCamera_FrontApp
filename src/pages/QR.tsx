// src/pages/Result.tsx
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { QRCodeCanvas } from 'qrcode.react'  // ✅ QR 코드 컴포넌트 import

export default function QR() {
  const navigate = useNavigate()
  const { resultImage, index } = useAppStore()

  // QR 코드가 나타낼 URL
  const qrUrl = `https://gb-camera-front-end.vercel.app/${index}`

  return (
    <div style={{ textAlign: 'center', marginTop: '40px' }}>
      {!resultImage ? (
        <p>
          결과 이미지가 없습니다.{' '}
          <button onClick={() => navigate('/selectImage')}>이미지 합성하러 가기</button>
        </p>
      ) : (
        <>

          {/* ✅ QR 코드 영역 */}
          <div style={{ marginTop: '30px' }}>
            <h3>📷 이 QR을 스캔하면 결과 페이지로 이동합니다</h3>
            <QRCodeCanvas
              value={qrUrl}
              size={200}          // QR 코드 크기
              bgColor="#ffffff"   // 배경색
              fgColor="#000000"   // QR 전경색
              level="H"           // 오류 복원 수준 (L/M/Q/H)
              includeMargin={true}
            />
            {/* <p style={{ marginTop: '10px', color: '#555' }}>{qrUrl}</p> */}
          </div>

          <button
            onClick={() => navigate('/')}
            style={{
              marginTop: '30px',
              padding: '10px 20px',
              fontSize: '18px',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            돌아가기
          </button>
        </>
      )}
    </div>
  )
}
