import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Electron 배포 시 file:// 경로 문제 해결용 설정
export default defineConfig({
  base: './', // ✅ 추가: assets, JS 파일 경로를 상대경로로 변경
  plugins: [react()],
})
