import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic',
  }), svgr({
    svgrOptions: {
      icon: true,
      exportType: 'named',
      namedExport: 'ReactComponent',
    },
  })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  esbuild: {
    loader: 'tsx',
    include: /\.(tsx?|jsx?)$/,
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
  },
});
