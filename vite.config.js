import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react({
        include: /\.(jsx|js|tsx|ts)$/
      })
    ],
    server: {
      port: parseInt(env.VITE_PORT),
      host: true
    },
    resolve: {
      alias: {
        '@': '/src'
      }
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx'
        }
      }
    }
  }
})
