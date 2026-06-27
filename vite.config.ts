import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Let preview/launch tooling control the port via PORT env; default 5173 for
    // plain `npm run dev`. Avoids the proxy/port mismatch when 5173 is already taken.
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
  },
})
