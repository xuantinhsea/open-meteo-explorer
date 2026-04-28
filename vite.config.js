import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // base is '/' on Vercel; on GitHub Pages it must match the repo name.
  // Set VITE_BASE_PATH=/open-meteo-explorer/ in GitHub Actions env, leave unset for Vercel.
  base: process.env.VITE_BASE_PATH ?? '/',
})
