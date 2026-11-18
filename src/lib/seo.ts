/**
 * Local SEO structured data and metadata generators for Mobile Repairing House.
 * Follows schema.org/MobilePhoneRepairShop, ElectronicsRepairShop, and Google Local Search guidelines.
 */

export const BUSINESS_INFO = {
  name: "Mobile Repairing House",
  legalName: "Mobile Repairing House",
  alternateNames: [
    "Mobile Repairing House Dunlop",
    "MRH Kolkata",
    "Mobile Repairing House Bhajan Complex",
    "Mobile Repairing House Baranagar",
    "Mobile Repairing House BT Road",
  ],
  owner: "Debasish",
  phone: "+91 97327 89938",
  whatsapp: "+91 97327 89938",
  cleanPhone: "+919732789938",
  email: "debasish@mobilerepairinghouse.com",
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
    geoRadiusMeters: 15000,
  },
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=M92H%2BQ4%20Kolkata%2C%20West%20Bengal",
  openingHoursDescription: "Mon - Sun: 10:30 AM - 9:30 PM",
  areaServed: [
    "Dunlop, Kolkata (700108)",
    "Baranagar, Kolkata (700036 / 700090)",
    "Bonhooghly, Kolkata (700108 / 700035)",
    "Saket Nagar, Dunlop (700108)",
    "Belgharia, Kolkata (700056)",
    "Dakshineswar, Kolkata (700076)",
    "Sinthee, Kolkata (700050)",
    "Kamarhati, North 24 Parganas (700058)",
    "Ariadaha & Alambazar, Kolkata",
    "ISI Kolkata (Indian Statistical Institute area)",
    "Barrackpore Trunk Road (B.T. Road) Corridor",
    "North Kolkata",
  ],
  priceRange: "₹₹",
  currenciesAccepted: "INR",
  paymentAccepted: "Cash, UPI, Google Pay, PhonePe, Paytm, Debit Card, Net Banking",
};

export function getLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["MobilePhoneRepairShop", "ElectronicsRepairShop", "LocalBusiness"],
    "@id": "https://mobilerepairinghouse.com/#store",
    "name": BUSINESS_INFO.name,
    "legalName": BUSINESS_INFO.legalName,
    "alternateName": BUSINESS_INFO.alternateNames,
    "image": [
      "https://mobilerepairinghouse.com/images/store/storefront-day.webp",
      "https://mobilerepairinghouse.com/images/store/workshop-bench.webp",
      "https://mobilerepairinghouse.com/images/store/accessories-display.webp",
      "https://mobilerepairinghouse.com/images/logo.webp"
    ],
    "telephone": BUSINESS_INFO.cleanPhone,
    "url": "https://mobilerepairinghouse.com",
    "hasMap": BUSINESS_INFO.googleMapsUrl,
    "priceRange": BUSINESS_INFO.priceRange,
    "currenciesAccepted": BUSINESS_INFO.currenciesAccepted,
    "paymentAccepted": BUSINESS_INFO.paymentAccepted,
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
    "serviceArea": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": BUSINESS_INFO.geo.latitude,
        "longitude": BUSINESS_INFO.geo.longitude,
      },
      "geoRadius": `${BUSINESS_INFO.geo.geoRadiusMeters}`,
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
    "founder": {
      "@type": "Person",
      "name": BUSINESS_INFO.owner,
      "jobTitle": "Master Diagnostic Technician & Owner",
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": BUSINESS_INFO.cleanPhone,
      "contactType": "customer service",
      "areaServed": "IN",
      "availableLanguage": ["English", "Bengali", "Hindi"],
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Smartphone Repair Services Catalog",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Display and Touchscreen Replacement",
            "description": "Cracked screen, flickering OLED, touch failure, and glass replacement for iPhone, Samsung, Xiaomi, Realme, Vivo, and OnePlus in Dunlop.",
          },
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Battery Replacement",
            "description": "OEM grade battery replacement for fast battery drain, unexpected phone shutdowns, and swollen batteries with warranty.",
          },
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Charging Port & Sub-Board Repair",
            "description": "Micro-soldering and replacement of loose or burned Type-C and Lightning charging ports.",
          },
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Motherboard Diagnostics and Chip-Level Repair",
            "description": "Microsoldering, IC replacement, dead phone diagnosis, short circuit troubleshooting, and liquid damage recovery.",
          },
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Camera & Lens Glass Repair",
            "description": "Blurry camera, cracked lens glass, autofocus failure, and optical image stabilization (OIS) repair.",
          },
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Speaker and Microphone Repair",
            "description": "Low ear-speaker volume, distorted loudspeaker audio, and mic repair for clear voice calls.",
          },
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Water and Liquid Damage Assessment",
            "description": "Ultrasonic board cleaning, corrosion removal, power rail short circuit diagnosis, and critical data recovery.",
          },
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Back Glass & Housing Replacement",
            "description": "Laser back glass removal and premium housing replacement for iPhone and premium Android models.",
          },
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Network & Connectivity Troubleshooting",
            "description": "No SIM detection, weak Wi-Fi, Bluetooth dropping, and cellular baseband IC diagnostics.",
          },
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Software & OS Recovery",
            "description": "Boot loop recovery, software brick rescue, OS update fixes, and data backup solutions.",
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
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": BUSINESS_INFO.geo.latitude,
        "longitude": BUSINESS_INFO.geo.longitude,
      },
    },
    "areaServed": BUSINESS_INFO.areaServed.map((area) => ({
      "@type": "AdministrativeArea",
      "name": area,
    })),
    "description": description,
  };
}

export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith("http") ? item.url : `https://mobilerepairinghouse.com${item.url.startsWith('/') ? item.url : `/${item.url}`}`,
    })),
  };
}

export function getGeoMetaTags() {
  return {
    "geo.region": "IN-WB",
    "geo.placename": "Dunlop, Baranagar, Kolkata",
    "geo.position": `${BUSINESS_INFO.geo.latitude};${BUSINESS_INFO.geo.longitude}`,
    "ICBM": `${BUSINESS_INFO.geo.latitude}, ${BUSINESS_INFO.geo.longitude}`,
    "geo.country": "IN",
    "geo.postalcode": BUSINESS_INFO.address.postalCode,
    "address": `${BUSINESS_INFO.address.streetAddress}, ${BUSINESS_INFO.address.addressLocality}, ${BUSINESS_INFO.address.addressRegion} ${BUSINESS_INFO.address.postalCode}, India`,
  };
}
