import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,      // เปิดให้เครื่องอื่นใน LAN เข้าได้ (ถ้าต้องการ)
    open: true,      // เปิดเบราว์เซอร์อัตโนมัติ
    port: 5173       // จะเปลี่ยนพอร์ตก็ได้
    // open: '/dashboard' // ถ้าอยากเปิด path เฉพาะ
  }
})
