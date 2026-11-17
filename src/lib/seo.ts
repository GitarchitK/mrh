/**
 * Local SEO structured data and metadata generators for Mobile Repairing House.
 * Follows schema.org/MobilePhoneRepairShop and Google Local Search guidelines.
 */

export const BUSINESS_INFO = {
  name: "Mobile Repairing House",
  legalName: "Mobile Repairing House",
  alternateNames: ["Rajib da Mobile Repairing House", "Mobile Repairing House Dunlop", "MRH Kolkata"],
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
  openingHoursDescription: "Mon - Sun: 10:30 AM - 9:30 PM",
  areaServed: ["Dunlop", "Baranagar", "Bonhooghly", "Belgharia", "Dakshineswar", "Sinthee", "Kamarhati", "Kolkata"],
  priceRange: "₹₹",
  currenciesAccepted: "INR",
  paymentAccepted: "Cash, UPI, Google Pay, PhonePe, Paytm, Debit Card",
};

export function getLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["MobilePhoneRepairShop", "ElectronicsRepairShop", "LocalBusiness"],
    "@id": "https://mobilerepairinghouse.com/#store",
    "name": BUSINESS_INFO.name,
    "alternateName": BUSINESS_INFO.alternateNames,
    "image": [
      "https://mobilerepairinghouse.com/images/store/storefront-day.webp",
      "https://mobilerepairinghouse.com/images/store/workshop-bench.webp",
      "https://mobilerepairinghouse.com/images/logo.webp"
    ],
    "telephone": BUSINESS_INFO.cleanPhone,
    "url": "https://mobilerepairinghouse.com",
    "hasMap": BUSINESS_INFO.googleMapsUrl,
    "priceRange": BUSINESS_INFO.priceRange,
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
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "10:30",
        "closes": "21:30",
      }
    ],
    "areaServed": BUSINESS_INFO.areaServed.map((area) => ({
      "@type": "AdministrativeArea",
      "name": area,
    })),
    "currenciesAccepted": BUSINESS_INFO.currenciesAccepted,
    "paymentAccepted": BUSINESS_INFO.paymentAccepted,
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Smartphone Repair Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Display and Touchscreen Replacement",
            "description": "Cracked screen and touch glass replacement for iPhone and Android devices in Dunlop.",
          },
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Battery Replacement",
            "description": "Quick battery change for slow charging, fast drain, or swollen batteries.",
          },
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Motherboard Diagnostics and Chip-Level Repair",
            "description": "Microsoldering, IC replacement, dead phone diagnosis, and liquid damage recovery.",
          },
        },
      ],
    },
  };
}

export function getServiceSchema(serviceName: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": serviceName,
    "provider": {
      "@type": "MobilePhoneRepairShop",
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
    "areaServed": BUSINESS_INFO.areaServed.map((area) => ({
      "@type": "AdministrativeArea",
      "name": area,
    })),
    "description": description,
  };
}
