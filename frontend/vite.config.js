    import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'

    // https://vitejs.dev/config/
    export default defineConfig({
      plugins: [react()],
    server: {
        host: '127.0.0.1', // Or 'localhost'
        port: 3000,
        proxy: {
      '/api': {
        target: 'http://localhost:5000', // MUST point to your backend port
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/auth': {
        target: 'http://localhost:5000', // MUST point to your backend port
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth/, ''),
      }
    }
  }
})