import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

// 이미지 import
import aloneImg from '../image/alone.png'
import withImg from '../image/with.png'

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
                minHeight: '40vh',
                paddingTop: '90px',
                gap: '130px',
                textAlign: 'center',
                overflow: 'hidden',
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

            {/* 버튼 그룹 */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '150px',
                    justifyContent: 'center',
                    width: '100%',
                    maxWidth: '600px',
                }}
            >
                {/* 🔵 혼자 찍기 버튼 */}
                <button
                    onClick={() => { setFrame("1"); navigate('/takePicture') }}
                    style={{
                        padding: '20px',
                        fontSize: '24px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: '2px solid black',
                        background: 'transparent',
                        width: '220px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                    }}
                >
                    <img 
                        src={aloneImg}
                        alt="혼자 찍기"
                        style={{
                            width: '160px',
                            height: '160px',
                            objectFit: 'contain',
                        }}
                    />
                    <span style={{ fontSize: '22px', fontWeight: 600 }}>
                        혼자 찍기
                    </span>
                </button>

                {/* 🟣 같이 찍기 버튼 */}
                <button
                    onClick={() => { setFrame("2"); navigate('/takePicture') }}
                    style={{
                        padding: '20px',
                        fontSize: '24px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: '2px solid black',
                        background: 'transparent',
                        width: '220px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                    }}
                >
                    <img 
                        src={withImg}
                        alt="같이 찍기"
                        style={{
                            width: '160px',
                            height: '160px',
                            objectFit: 'contain',
                        }}
                    />
                    <span style={{ fontSize: '22px', fontWeight: 600 }}>
                        같이 찍기
                    </span>
                </button>
            </div>
        </div>
    )
}
