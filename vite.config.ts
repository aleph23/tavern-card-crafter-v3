import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: './', // important：Electron Need a relative path
  server: { host: '::', port: 6090 },
  plugins: [react(), mode === 'development' && componentTagger()].filter(Boolean),
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: { outDir: 'dist', assetsDir: 'assets' },
}))
