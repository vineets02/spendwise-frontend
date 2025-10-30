
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// export default defineConfig({ plugins: [react()], server: { port: 5173, host: true } })
export default defineConfig({
  plugins: [react()],
  // if you deploy under a subpath (GH Pages), set base. For Render root, keep "/".
  base: '/',
  server: {
    host: true,
    // allow Render domain (change to your actual onrender hostname)
    allowedHosts: ['spendwise-frontend-wwqe.onrender.com'],
  },
  preview: {
    host: true,
    allowedHosts: ['spendwise-frontend-wwqe.onrender.com'],
  },
})
