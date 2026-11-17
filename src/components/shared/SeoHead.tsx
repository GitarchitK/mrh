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
