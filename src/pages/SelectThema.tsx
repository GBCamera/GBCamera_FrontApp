import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

export default function SelectFrame() {
    const navigate = useNavigate()
    const setFrame = useAppStore((s)=>s.setFrame)

    return (
        <div 
            style={{ 
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
                height: '100%',
                paddingTop: '210px',   // 🔥 제목 위치 더 아래로 이동
                gap: '70px',           // 🔥 제목과 버튼 사이 간격 증가
                textAlign: 'center',
            }}
        >

            {/* 제목 */}
            <p 
                style={{
                    fontSize: '40px',
                    fontWeight: 700,
                    margin: 0,
                }}
            >
                원하는 테마를 선택하세요
            </p>

            {/* 버튼 그룹 (좌우 배치) */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '40px',           // 버튼 간 간격도 조금 더 여유 있게
                    justifyContent: 'center',
                    width: '100%',
                    maxWidth: '600px',
                }}
            >
                <button
                    onClick={() => { setFrame("1"); navigate('/takePicture') }}
                    style={{
                        padding: '18px 40px',
                        fontSize: '24px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: '2px solid black',
                        background: 'transparent', 
                    }}
                >
                    혼자 찍기
                </button>

                <button
                    onClick={() => { setFrame("2"); navigate('/takePicture') }}
                    style={{
                        padding: '18px 40px',
                        fontSize: '24px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: '2px solid black',
                        background: 'transparent',
                    }}
                >
                    같이 찍기
                </button>
            </div>

        </div>
    )
}
