const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://mobilerepairinghouse.com';

// Current ISO Date (YYYY-MM-DD) for valid search engine lastmod timestamps
const TODAY = new Date().toISOString().slice(0, 10);

const STATIC_ROUTES = [
  // --- Core Hub Pages ---
  { path: '/', priority: '1.0', changefreq: 'daily', lastmod: TODAY },
  { path: '/services', priority: '0.9', changefreq: 'weekly', lastmod: TODAY },
  { path: '/iphone-repair', priority: '0.9', changefreq: 'weekly', lastmod: TODAY },
  { path: '/android-repair', priority: '0.9', changefreq: 'weekly', lastmod: TODAY },
  { path: '/shop', priority: '0.85', changefreq: 'daily', lastmod: TODAY },
  { path: '/accessories', priority: '0.8', changefreq: 'weekly', lastmod: TODAY },
  { path: '/repair-request', priority: '0.85', changefreq: 'weekly', lastmod: TODAY },
  { path: '/repair-status', priority: '0.7', changefreq: 'weekly', lastmod: TODAY },
  { path: '/contact', priority: '0.85', changefreq: 'monthly', lastmod: TODAY },
  { path: '/about', priority: '0.6', changefreq: 'monthly', lastmod: TODAY },

  // --- Dedicated High-Intent Repair Services (Local Dunlop / Kolkata) ---
  { path: '/services/display-touchscreen-replacement', priority: '0.95', changefreq: 'weekly', lastmod: TODAY },
  { path: '/services/battery-replacement', priority: '0.9', changefreq: 'weekly', lastmod: TODAY },
  { path: '/services/charging-port-repair', priority: '0.9', changefreq: 'weekly', lastmod: TODAY },
  { path: '/services/motherboard-diagnostics-repair', priority: '0.85', changefreq: 'weekly', lastmod: TODAY },
  { path: '/services/camera-repair', priority: '0.8', changefreq: 'weekly', lastmod: TODAY },
  { path: '/services/speaker-microphone-repair', priority: '0.8', changefreq: 'weekly', lastmod: TODAY },
  { path: '/services/water-damage-assessment', priority: '0.85', changefreq: 'weekly', lastmod: TODAY },
  { path: '/services/back-glass-repair', priority: '0.8', changefreq: 'weekly', lastmod: TODAY },
  { path: '/services/network-connectivity-troubleshooting', priority: '0.75', changefreq: 'weekly', lastmod: TODAY },
  { path: '/services/software-troubleshooting', priority: '0.75', changefreq: 'weekly', lastmod: TODAY },

  // --- Shop Category Collections ---
  { path: '/shop/chargers', priority: '0.75', changefreq: 'weekly', lastmod: TODAY },
  { path: '/shop/cables', priority: '0.75', changefreq: 'weekly', lastmod: TODAY },
  { path: '/shop/earphones', priority: '0.75', changefreq: 'weekly', lastmod: TODAY },
  { path: '/shop/protection', priority: '0.75', changefreq: 'weekly', lastmod: TODAY },
  { path: '/shop/power_banks', priority: '0.7', changefreq: 'weekly', lastmod: TODAY },
  { path: '/shop/spares', priority: '0.7', changefreq: 'weekly', lastmod: TODAY },
  { path: '/shop/tools', priority: '0.7', changefreq: 'weekly', lastmod: TODAY },

  // --- Legal & Trust ---
  { path: '/privacy-policy', priority: '0.3', changefreq: 'yearly', lastmod: TODAY },
  { path: '/terms', priority: '0.3', changefreq: 'yearly', lastmod: TODAY },
];

/**
 * Builds standard XML sitemap adhering to sitemaps.org 0.9 protocol.
 */
function generateSitemapXml(extraRoutes = []) {
  const allRoutes = [...STATIC_ROUTES, ...extraRoutes];

  const xmlEntries = allRoutes.map((route) => {
    const loc = route.path === '/' ? `${BASE_URL}/` : `${BASE_URL}${route.path}`;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${route.lastmod || TODAY}</lastmod>
    <changefreq>${route.changefreq || 'weekly'}</changefreq>
    <priority>${route.priority || '0.5'}</priority>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries.join('\n')}
</urlset>
`;
}

/**
 * Saves sitemap.xml to public/ and dist/ (if exists)
 */
function syncSitemapFiles() {
  const xml = generateSitemapXml();

  const publicPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(publicPath, xml, 'utf8');
  console.log(`[Sitemap] Synced static sitemap to ${publicPath}`);

  const distPath = path.resolve(__dirname, '../dist/sitemap.xml');
  if (fs.existsSync(path.dirname(distPath))) {
    fs.writeFileSync(distPath, xml, 'utf8');
    console.log(`[Sitemap] Synced dist sitemap to ${distPath}`);
  }

  return xml;
}

if (require.main === module) {
  syncSitemapFiles();
}

module.exports = {
  generateSitemapXml,
  syncSitemapFiles,
  STATIC_ROUTES,
  BASE_URL,
};
