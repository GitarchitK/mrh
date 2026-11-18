import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const app = require('../server/index.cjs');

export default function handler(req, res) {
  // Restore the original URL if Vercel rewrite flattened or modified req.url
  const targetUrl = req.originalUrl || req.headers['x-matched-path'] || req.url || '';
  if (targetUrl.startsWith('/api')) {
    req.url = targetUrl;
  } else if (!req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  return app(req, res);
}
