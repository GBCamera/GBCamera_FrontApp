import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'   // ✅ 변경된 부분
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>   {/* ✅ BrowserRouter 대신 HashRouter 사용 */}
      <App /> 
    </HashRouter>
  </React.StrictMode> 
)
