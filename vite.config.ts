import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

import { miaodaDevPlugin } from "miaoda-sc-plugin";

export default defineConfig({
  plugins: [react(), svgr({
      svgrOptions: {
        icon: true, exportType: 'named', namedExport: 'ReactComponent', }, }), miaodaDevPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 0,
    strictPort: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-App-Id'],
      exposedHeaders: ['Content-Range', 'X-Total-Count'],
      credentials: true,
    },
    proxy: {
      '/api/forum': {
        target: 'https://hmediapost.newblock.online',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/forum/, '/api/friend'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Origin', 'https://hmediapost.newblock.online');
          });
        },
      },
      '/api/worldview': {
        target: 'https://worldviewplatform.newblock.online',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/worldview/, '/api'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Origin', 'https://worldviewplatform.newblock.online');
          });
        },
      },
      '/api/ai': {
        target: 'https://d.lconai.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ai/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Origin', 'https://d.lconai.com');
          });
        },
      },
      '/api/live': {
        target: 'https://nchat.live',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/live/, '/api'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Origin', 'https://nchat.live');
          });
        },
      },
    },
  },
  build: {
    target: ['es2020', 'safari14'],
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-radix';
            }
            if (id.includes('motion') || id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('react-markdown') || id.includes('remark') || id.includes('unified')) {
              return 'vendor-markdown';
            }
            if (id.includes('ky') || id.includes('axios')) {
              return 'vendor-http';
            }
            if (id.includes('pixi.js') || id.includes('pixi-live2d-display') || id.includes('@pixi')) {
              return 'vendor-live2d';
            }
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: true,
    sourcemap: false,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'motion',
      'pixi.js',
      'pixi-live2d-display',
    ],
    esbuildOptions: {
      target: ['es2020', 'safari14'],
    },
  },
});
