import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const apiProxyConfig = {
  target: 'http://localhost:3001',
  changeOrigin: true,
  configure: (proxy: any) => {
    proxy.on('error', (err: any, _req: any, res: any) => {
      if (res && typeof res.writeHead === 'function' && !res.headersSent) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            error: 'Backend API server is not running on port 3001. Please start it with "npm run dev".',
          })
        );
      }
    });
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': apiProxyConfig,
    },
  },
  preview: {
    port: 5173,
    host: true,
    proxy: {
      '/api': apiProxyConfig,
    },
  },
});
