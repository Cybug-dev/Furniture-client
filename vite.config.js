import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = (process.env.VITE_API_URL || env.VITE_API_URL || '').trim()

  if (!apiUrl) {
    throw new Error(
      `VITE_API_URL is required for the ${mode} build. Configure it for this environment before building.`,
    )
  }

  try {
    new URL(apiUrl)
  } catch {
    throw new Error(`VITE_API_URL must be a valid absolute URL. Received: ${apiUrl}`)
  }

  return {
    plugins: [react()],
    server: {
      host: 'localhost',
      port: 5173,
      strictPort: true,
      open: '/auth',
    },
  }
})
