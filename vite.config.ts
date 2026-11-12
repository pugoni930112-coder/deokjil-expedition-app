
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/deokjil-expedition-app/',
  plugins: [react()],
  server: {
    allowedHosts: ['.loca.lt'],
  },
})