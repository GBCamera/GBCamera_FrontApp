import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

export default function SelectFrame() {
    const navigate = useNavigate()
    const setFrame = useAppStore((s)=>s.setFrame)

    return (
        <div 
            style={{ 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%', 
            }}
        >
        <p>원하는 테마를 선택하세요</p>
        <button
            onClick={() => {setFrame("1"); navigate('/takePicture')}}
            style={{
            padding: '10px 20px',
            fontSize: '18px',
            borderRadius: '8px',
            cursor: 'pointer',
            }}
        >
            혼자찍기
        </button>
        <button
            onClick={() => {setFrame("2"); navigate('/takePicture')}}
            style={{
            padding: '10px 20px',
            fontSize: '18px',
            borderRadius: '8px',
            cursor: 'pointer',
            }}
        >
            같이 찍기
        </button>
        </div>
    )
}
