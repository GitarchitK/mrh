import React, { useEffect } from 'react';
import { getLocalBusinessSchema, getServiceSchema } from '../../lib/seo';

interface SeoHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  serviceData?: { name: string; description: string };
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  canonicalPath = '',
  serviceData,
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

    // 2b. Update Canonical and Open Graph URL
    const domain = 'https://mobilerepairinghouse.com';
    const fullCanonical = canonicalPath ? `${domain}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}` : `${domain}/`;
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

    // 3. Inject Structured Data JSON-LD
    const scriptId = 'local-seo-jsonld';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const schemas = [getLocalBusinessSchema()];
    if (serviceData) {
      schemas.push(getServiceSchema(serviceData.name, serviceData.description) as any);
    }

    scriptEl.textContent = JSON.stringify(schemas);
  }, [title, description, canonicalPath, serviceData]);

  return null;
};
