/**
 * Local SEO structured data and metadata generators for Mobile Repairing House.
 * Follows schema.org/LocalBusiness and Google Local Search guidelines.
 */

export const BUSINESS_INFO = {
  name: "Mobile Repairing House",
  legalName: "Mobile Repairing House",
  owner: "Debasish",
  phone: "+91 97327 89938",
  whatsapp: "+91 97327 89938",
  cleanPhone: "+919732789938",
  address: {
    streetAddress: "Bhajan Complex, 139, Barrackpore Trunk Road, Dunlop, Saket Nagar, Bonhooghly",
    addressLocality: "Baranagar, Kolkata",
    addressRegion: "West Bengal",
    postalCode: "700108",
    addressCountry: "IN",
  },
  geo: {
    plusCode: "M92H+Q4, Kolkata, West Bengal",
    latitude: 22.6519,
    longitude: 88.3752,
  },
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=M92H%2BQ4%20Kolkata%2C%20West%20Bengal",
  openingHoursDescription: "Available during shop working hours. Contact Debasish directly for visit confirmation.",
  areaServed: ["Dunlop", "Baranagar", "Bonhooghly", "Belgharia", "Dakshineswar", "Kolkata"],
  priceRange: "₹₹",
};

export function getLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": BUSINESS_INFO.name,
    "image": "https://mobilerepairinghouse.in/favicon.svg",
    "telephone": BUSINESS_INFO.cleanPhone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": BUSINESS_INFO.address.streetAddress,
      "addressLocality": BUSINESS_INFO.address.addressLocality,
      "addressRegion": BUSINESS_INFO.address.addressRegion,
      "postalCode": BUSINESS_INFO.address.postalCode,
      "addressCountry": BUSINESS_INFO.address.addressCountry,
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": BUSINESS_INFO.geo.latitude,
      "longitude": BUSINESS_INFO.geo.longitude,
    },
    "url": "https://mobilerepairinghouse.in",
    "hasMap": BUSINESS_INFO.googleMapsUrl,
    "areaServed": BUSINESS_INFO.areaServed,
    "currenciesAccepted": "INR",
    "paymentAccepted": "Cash, UPI",
  };
}

export function getServiceSchema(serviceName: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": serviceName,
    "provider": {
      "@type": "LocalBusiness",
      "name": BUSINESS_INFO.name,
      "telephone": BUSINESS_INFO.cleanPhone,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": BUSINESS_INFO.address.streetAddress,
        "addressLocality": BUSINESS_INFO.address.addressLocality,
        "addressRegion": BUSINESS_INFO.address.addressRegion,
        "postalCode": BUSINESS_INFO.address.postalCode,
        "addressCountry": BUSINESS_INFO.address.addressCountry,
      },
    },
    "areaServed": BUSINESS_INFO.areaServed,
    "description": description,
  };
}
