import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Split the two big always-on libraries out of the app chunk so a code
        // change doesn't invalidate them in visitors' caches. SheetJS is not
        // listed here on purpose — it is dynamically imported by the Excel
        // export and Rollup already gives it its own on-demand chunk.
        manualChunks: {
          leaflet: ['leaflet', 'react-leaflet'],
          charts: ['chart.js', 'react-chartjs-2', 'chartjs-plugin-annotation'],
        },
      },
    },
  },
  // base is '/' on Vercel; on GitHub Pages it must match the repo name.
  // Set VITE_BASE_PATH=/open-meteo-explorer/ in GitHub Actions env, leave unset for Vercel.
  base: process.env.VITE_BASE_PATH ?? '/',
})
