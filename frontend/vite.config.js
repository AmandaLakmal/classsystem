import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // ── Browser compatibility shim ────────────────────────────────────────────
  // sockjs-client (and some other Node-era packages) reference the Node.js
  // `global` object which does not exist in browsers. This tells Vite to
  // replace every occurrence of `global` with `globalThis` at bundle time,
  // which IS available in all modern browsers and resolves the crash:
  //   "Uncaught ReferenceError: global is not defined"
  define: {
    global: 'globalThis',
  },
})

