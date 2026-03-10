import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI components
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tooltip',
            'cmdk',
            'sonner',
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
          ],
          // DnD
          'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          // PDF libraries
          'vendor-pdf': ['pdf-lib', 'pdf-merger-js'],
          'vendor-pdfjs': ['pdfjs-dist'],
          'vendor-jspdf': ['jspdf'],
          // QR code
          'vendor-qrcode': ['qrcode'],
        },
      },
    },
  },
});
