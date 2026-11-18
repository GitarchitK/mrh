import React, { useEffect } from 'react';
import { getLocalBusinessSchema, getServiceSchema, getBreadcrumbSchema, getGeoMetaTags } from '../../lib/seo';

interface SeoHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  serviceData?: { name: string; description: string };
  breadcrumbs?: { name: string; url: string }[];
  keywords?: string;
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  canonicalPath = '',
  serviceData,
  breadcrumbs,
  keywords,
}) => {
  useEffect(() => {
    // 1. Update Title
    document.title = `${title} | Mobile Repairing House Dunlop`;

    // 2. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // 2b. Update Meta Keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', keywords);
    }

    // 3. Update Canonical and Open Graph URL
    const domain = 'https://mobilerepairinghouse.com';
    const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
    const fullCanonical = canonicalPath ? `${domain}${cleanPath}` : `${domain}/`;

    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', fullCanonical);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute('content', fullCanonical);

    // 4. Ensure GEO Meta Tags are actively synchronized
    const geoTags = getGeoMetaTags();
    Object.entries(geoTags).forEach(([name, content]) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    // 5. Inject Structured Data JSON-LD
    const scriptId = 'local-seo-jsonld';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const schemas: any[] = [getLocalBusinessSchema()];
    if (serviceData) {
      schemas.push(getServiceSchema(serviceData.name, serviceData.description));
    }
    if (breadcrumbs && breadcrumbs.length > 0) {
      schemas.push(getBreadcrumbSchema(breadcrumbs));
    }

    scriptEl.textContent = JSON.stringify(schemas);
  }, [title, description, canonicalPath, serviceData, breadcrumbs, keywords]);

  return null;
};
