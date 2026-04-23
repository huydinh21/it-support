// Import các thư viện cốt lõi của React để xây dựng giao diện
import React from 'react'
// Import ReactDOM để kết nối React vào HTML DOM thực tế chạy trên trình duyệt
import ReactDOM from 'react-dom/client'
// Import File App.tsx là Component Gốc (Root Component) chứa toàn bộ phần mềm
import App from './App.tsx'
// Import file CSS tổng chứa các biến màu sắc và các thiết kế dùng chung
import './index.css'

// =========================================================
// KHỞI TẠO ỨNG DỤNG MỨC CAO NHẤT (ENTRY POINT)
// =========================================================
// Tìm thẻ có id='root' trong file index.html (Nằm ngoài cùng dự án Vite) 
// Sau đó "Render" (vẽ giao diện) nội dung của thẻ <App /> vào bên trong thẻ đó.
ReactDOM.createRoot(document.getElementById('root')!).render(
  // React.StrictMode: Chế độ kiểm tra nghiêm ngặt của React lúc dev. 
  // Nó sẽ chạy các component 2 lần để phát hiện lỗi tiềm ẩn (Memory leak, effects...).
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
