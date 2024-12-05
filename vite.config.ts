import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      fastRefresh: true,
      include: "src/**/*.{jsx,tsx}",
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'lucide-react': ['lucide-react']
        }
      }
    }
  },
  server: {
    hmr: true,
    open: true,
    overlay: true,
    watch: {
      usePolling: true,
      include: ['src/**']
    }
  }
});
