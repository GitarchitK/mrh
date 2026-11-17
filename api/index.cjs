const app = require('../server/index.cjs');

module.exports = (req, res) => {
  // Ensure the route starts with /api if Vercel strips it in rewrites
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  return app(req, res);
};
