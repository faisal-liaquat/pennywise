import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    // Generate source maps for easier debugging in production
    sourcemap: false,
    // Chunk size warning threshold (kB)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          supabase: ['@supabase/supabase-js'],
          'date-fns': ['date-fns'],
        },
      },
    },
  },
  // Ensure environment variables are properly loaded
  envPrefix: 'VITE_',
})
