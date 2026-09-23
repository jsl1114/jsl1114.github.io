import fs from 'fs'
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Dev-only pages in public/ are served by `vite` but never shipped.
const DEV_ONLY_FILES = [
  'projects/brownjack/dev-test.html',
  'projects/brownjack/js/dev-test.js',
]

const stripDevOnlyFiles = () => ({
  name: 'strip-dev-only-files',
  apply: 'build',
  closeBundle() {
    for (const file of DEV_ONLY_FILES) {
      // eslint-disable-next-line no-undef
      fs.rmSync(path.resolve(__dirname, 'dist', file), { force: true })
    }
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), stripDevOnlyFiles()],
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
})
