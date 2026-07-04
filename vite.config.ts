import { defineConfig } from 'vite';

export default defineConfig({
  base: '/us_thai_fire_calculator/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          chart: ['chart.js'],
        },
      },
    },
  },
});
