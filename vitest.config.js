import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'sb-original/image-context': new URL('./sb-image-context-stub.js', import.meta.url).pathname,
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    server: { deps: { inline: [/@storybook\/nextjs-vite/] } },
  },
})
