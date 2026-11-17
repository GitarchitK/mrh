import { StoreProduct, StoreCategory } from '../types';

export interface StoreCategoryItem {
  id: StoreCategory;
  name: string;
  iconName: string;
  count: number;
}

export const STORE_CATEGORIES: StoreCategoryItem[] = [
  { id: 'all', name: 'All Products', iconName: 'Grid', count: 20 },
  { id: 'chargers', name: 'Fast Chargers', iconName: 'Zap', count: 4 },
  { id: 'cables', name: 'Data Cables', iconName: 'Cable', count: 3 },
  { id: 'earphones', name: 'Audio & Neckbands', iconName: 'Headphones', count: 4 },
  { id: 'power_banks', name: 'Power Banks', iconName: 'BatteryCharging', count: 2 },
  { id: 'protection', name: 'Tempered & Covers', iconName: 'Shield', count: 3 },
  { id: 'spares', name: 'Displays & Batteries', iconName: 'Smartphone', count: 3 },
  { id: 'tools', name: 'Repair Kits & Tools', iconName: 'Wrench', count: 2 },
];

export const STORE_PRODUCTS: StoreProduct[] = [
  // --- CHARGERS ---
  {
    id: 'prod-charger-25w-pd',
    name: '25W USB-C PD Super Fast Wall Charger Adapter',
    slug: '25w-usb-c-super-fast-charger',
    category: 'chargers',
    categoryLabel: 'Fast Chargers',
    brand: 'Samsung Compatible',
    shortDesc: 'Compact 25W Type-C Power Delivery wall charger adapter with multi-layer surge protection.',
    description: 'Engineered for high-speed charging of Galaxy S/M/A series, Google Pixel, and modern iPhones. Features intelligent power negotiation IC to prevent overheating, short circuits, and overcharging.',
    pricePaise: 44900, // ₹449
    mrpPaise: 99900, // ₹999 (55% off)
    rating: 4.6,
    ratingCount: 312,
    inStock: true,
    stockCount: 18,
    badge: 'Best Seller',
    features: [
      '25W Power Delivery 3.0 & PPS Fast Charging',
      'Universal compatibility with Samsung, Pixel & iPhone',
      'Over-voltage and short-circuit protection IC',
      'Compact travel-friendly flame-retardant casing',
    ],
    specs: {
      'Input Voltage': '100-240V AC, 50/60Hz',
      'Output Voltage': '5V/3A, 9V/2.77A, 12V/2.1A (PPS 3.3-11V)',
      'Port Type': 'Single Type-C Port',
      'Fast Charging Protocol': 'PD 3.0, PPS, QC 4.0',
      'Color': 'Glossy White',
    },
    warranty: '6 Months Replacement Warranty',
    returnPolicy: '7 Days Return / Exchange at Counter',
    flipkartAssured: true,
  },
  {
    id: 'prod-charger-65w-gan',
    name: '65W GaN Dual Port (Type-C + USB-A) Ultra-Fast Charger',
    slug: '65w-gan-dual-port-ultra-fast-charger',
    category: 'chargers',
    categoryLabel: 'Fast Chargers',
    brand: 'Portronics',
    shortDesc: 'Gallium Nitride (GaN) technology 65W dual-port super-fast charger for laptops and phones.',
    description: 'High-density GaN charger providing 65W peak output. Can simultaneously fast charge a laptop and smartphone. Generates 40% less heat compared to conventional silicon chargers.',
    pricePaise: 119900, // ₹1,199
    mrpPaise: 249900, // ₹2,499 (52% off)
    rating: 4.8,
    ratingCount: 189,
    inStock: true,
    stockCount: 8,
    badge: 'Deal of the Day',
    features: [
      '65W Gallium Nitride (GaN) high efficiency tech',
      'Dual Port: Type-C (65W Max) + USB-A (18W QC3.0)',
      'Can charge MacBook, Dell laptops, and all smartphones',
      'Smart temperature sensor & surge cut-off',
    ],
    specs: {
      'Technology': 'Gallium Nitride (GaN III)',
      'Max Wattage': '65 Watts Power Delivery',
      'Ports': '1x USB-C + 1x USB-A',
      'Warranty': '1 Year Manufacturer Warranty',
    },
    warranty: '1 Year Replacement Warranty',
    returnPolicy: '7 Days Return / Exchange at Counter',
    flipkartAssured: true,
  },
  {
    id: 'prod-charger-20w-apple',
    name: '20W USB-C Power Adapter for iPhone 11/12/13/14/15',
    slug: '20w-usb-c-power-adapter-iphone',
    category: 'chargers',
    categoryLabel: 'Fast Chargers',
    brand: 'Apple Compatible',
    shortDesc: 'High-speed 20W USB-C wall adapter optimized for Apple iPhone fast charging (0-50% in 30 mins).',
    description: 'Designed specifically to deliver optimal charging current for iPhone models and iPad Air/Mini. Safe for battery health with trickle-charge cycle management.',
    pricePaise: 59900, // ₹599
    mrpPaise: 129900, // ₹1,299 (54% off)
    rating: 4.7,
    ratingCount: 428,
    inStock: true,
    stockCount: 22,
    badge: 'MRH Assured',
    features: [
      'Charges iPhone from 0% to 50% in 30 minutes',
      'Stable voltage curve preserving iPhone battery health',
      'Compatible with iPhone 8 through iPhone 15 Pro Max',
      'Certified fire-resistant polycarbonate body',
    ],
    specs: {
      'Wattage': '20W Power Delivery',
      'Output': '5V/3A, 9V/2.22A',
      'Connector': 'USB Type-C',
    },
    warranty: '6 Months Replacement Warranty',
    returnPolicy: '7 Days Counter Exchange',
    flipkartAssured: true,
  },
  {
    id: 'prod-car-charger-fast',
    name: 'Dual Port 36W Metal Fast Car Charger (QC 3.0 + PD)',
    slug: 'dual-port-36w-metal-car-charger',
    category: 'chargers',
    categoryLabel: 'Fast Chargers',
    brand: 'Ambrane',
    shortDesc: 'Premium heavy zinc-alloy metallic 36W dual fast car charger with blue LED ring.',
    description: 'Compact flush-fit dual output car cigarette socket adapter. Delivers Qualcomm Quick Charge 3.0 and USB-PD simultaneously without voltage drop.',
    pricePaise: 39900, // ₹399
    mrpPaise: 89900, // ₹899 (56% off)
    rating: 4.4,
    ratingCount: 96,
    inStock: true,
    stockCount: 14,
    badge: 'Trending',
    features: [
      'Dual fast charging: Type-C (18W) + USB-A (18W)',
      'Heavy zinc alloy metallic heat-dissipating shell',
      'Soft glowing blue LED indicator for night visibility',
      'Compatible with all 12V-24V car and SUV lighter sockets',
    ],
    specs: {
      'Input': 'DC 12V-24V',
      'Output': '36W Max Combined Output',
      'Body Material': 'Zinc Alloy Metal',
    },
    warranty: '6 Months Warranty',
    returnPolicy: '7 Days Counter Exchange',
    flipkartAssured: true,
  },

  // --- CABLES ---
  {
    id: 'prod-cable-typec-100w',
    name: '100W PD Braided Type-C to Type-C Fast Charging Cable (1.2m)',
    slug: '100w-braided-type-c-to-type-c-cable',
    category: 'cables',
    categoryLabel: 'Data Cables',
    brand: 'Quality Brand',
    shortDesc: 'Heavy-duty 100W (5A) e-Marker nylon braided Type-C cable with 480Mbps data sync.',
    description: 'Built with thick tinned copper wire cores and military-grade ballistic nylon weaving. Lab tested to withstand over 20,000 bends without core damage. E-marker chip ensures safe 100W PD charging.',
    pricePaise: 24900, // ₹249
    mrpPaise: 59900, // ₹599 (58% off)
    rating: 4.7,
    ratingCount: 280,
    inStock: true,
    stockCount: 35,
    badge: 'MRH Assured',
    features: [
      'Supports up to 100W (20V/5A) Power Delivery charging',
      'Built-in E-Marker chip for thermal and voltage safety',
      'Reinforced aluminum alloy connectors & nylon braided body',
      '480 Mbps high speed data transfer',
    ],
    specs: {
      'Length': '1.2 Meters',
      'Max Current': '5 Amperes (100W)',
      'Material': 'Double Braided Nylon & Aluminum Alloy',
    },
    warranty: '6 Months Replacement Warranty',
    returnPolicy: '7 Days Counter Exchange',
    flipkartAssured: true,
  },
  {
    id: 'prod-cable-lightning-fast',
    name: 'Fast Charging Type-C to Lightning Cable for iPhone (1m)',
    slug: 'type-c-to-lightning-fast-cable-iphone',
    category: 'cables',
    categoryLabel: 'Data Cables',
    brand: 'Apple Compatible',
    shortDesc: 'Certified PD fast charging Type-C to 8-pin lightning cable for iPhone and iPad.',
    description: 'Connects iPhone to USB-C power adapters for fast charging. Zero popup warnings on iOS updates. Thick shielded wire core guarantees lightning data transfer.',
    pricePaise: 29900, // ₹299
    mrpPaise: 69900, // ₹699 (57% off)
    rating: 4.5,
    ratingCount: 195,
    inStock: true,
    stockCount: 25,
    badge: 'Popular',
    features: [
      'Enables 20W PD fast charging on iPhone 8 through 14',
      'No "Accessory Not Supported" warnings on latest iOS',
      'Flexible strain-relief collar tested for 15,000+ bends',
      'Fast iTunes data sync at 480 Mbps',
    ],
    specs: {
      'Length': '1 Meter',
      'Connectors': 'USB-C to 8-Pin Lightning',
      'Color': 'Classic White',
    },
    warranty: '6 Months Replacement Warranty',
    returnPolicy: '7 Days Counter Exchange',
    flipkartAssured: true,
  },
  {
    id: 'prod-cable-3in1-universal',
    name: '3-in-1 Universal Fast Cable (Type-C + Lightning + Micro-USB)',
    slug: '3-in-1-universal-fast-charging-cable',
    category: 'cables',
    categoryLabel: 'Data Cables',
    brand: 'Portronics',
    shortDesc: 'One cable for all devices: charge Type-C, iPhone, and older Micro-USB phones simultaneously.',
    description: 'Eliminate cable clutter at home or in your car. Heavy nylon braided construction with aluminum connectors. Supports up to 3.5A total output.',
    pricePaise: 29900, // ₹299
    mrpPaise: 79900, // ₹799 (63% off)
    rating: 4.3,
    ratingCount: 164,
    inStock: true,
    stockCount: 20,
    badge: 'Value Pack',
    features: [
      '3 Connectors: USB-C, Apple Lightning, and Micro-USB',
      'Charge up to 3 devices simultaneously from 1 socket',
      'Heavy nylon braiding prevents knotting and tangling',
      'Gold-plated contacts for zero resistance loss',
    ],
    specs: {
      'Length': '1.2 Meters',
      'Max Current': '3.5A Shared Total',
      'Color': 'Gunmetal Grey',
    },
    warranty: '6 Months Warranty',
    returnPolicy: '7 Days Counter Exchange',
    flipkartAssured: true,
  },

  // --- AUDIO & EARPHONES ---
  {
    id: 'prod-audio-boat-neckband',
    name: 'boAt Rockerz 255 Pro+ Wireless Bluetooth Neckband',
    slug: 'boat-rockerz-255-pro-plus-neckband',
    category: 'earphones',
    categoryLabel: 'Audio & Neckbands',
    brand: 'boAt',
    shortDesc: 'Up to 40 Hours playtime, ASAP Charge (10 mins = 10 hrs), IPX7 water resistance, 10mm drivers.',
    description: 'The iconic wireless neckband tuned for India’s favorite signature bass. Dual pairing feature allows seamless switching between phone and laptop. Magnetic earbuds ensure effortless storage around your neck.',
    pricePaise: 119900, // ₹1,199
    mrpPaise: 299900, // ₹2,999 (60% off)
    rating: 4.6,
    ratingCount: 618,
    inStock: true,
    stockCount: 12,
    badge: 'Best Seller',
    features: [
      'Massive 40 Hours non-stop playtime battery',
      'ASAP Charge: 10 mins charging gives 10 hours playback',
      '10mm Dynamic Drivers with boAt Signature Bass',
      'IPX7 Sweat & Water Resistant for workouts and rain',
    ],
    specs: {
      'Bluetooth Version': 'v5.2',
      'Battery Playtime': '40 Hours',
      'Driver Size': '10mm',
      'Water Resistance': 'IPX7 Certified',
      'Mic': 'Built-in cVc Noise Cancellation Mic',
    },
    warranty: '1 Year Brand Manufacturer Warranty',
    returnPolicy: '7 Days Replacement at Dunlop Counter',
    flipkartAssured: true,
  },
  {
    id: 'prod-audio-tws-earbuds',
    name: 'Airdopes True Wireless (TWS) Earbuds with Quad Mic ENC',
    slug: 'airdopes-tws-wireless-earbuds-enc',
    category: 'earphones',
    categoryLabel: 'Audio & Neckbands',
    brand: 'boAt Compatible',
    shortDesc: 'Compact touch-control TWS earbuds with 35 hours battery case, low latency gaming mode & ENC mic.',
    description: 'Features Environmental Noise Cancellation (ENC) microphones for crystal clear phone calls even in noisy Dunlop market traffic. Low latency gaming mode keeps audio perfectly synced with video.',
    pricePaise: 99900, // ₹999
    mrpPaise: 249900, // ₹2,499 (60% off)
    rating: 4.5,
    ratingCount: 275,
    inStock: true,
    stockCount: 15,
    badge: 'Trending',
    features: [
      'Quad Mic with Environmental Noise Cancellation (ENC)',
      '35 Hours total battery with pocket-sized charging case',
      'Instant Auto-Pairing upon opening lid',
      'Touch controls for Volume, Music, and Voice Assistant',
    ],
    specs: {
      'Bluetooth': 'v5.3',
      'Earbud Playtime': '7 Hours single charge',
      'Charging Port': 'Type-C Fast Charge',
      'Color': 'Carbon Black',
    },
    warranty: '6 Months Replacement Warranty',
    returnPolicy: '7 Days Counter Exchange',
    flipkartAssured: true,
  },
  {
    id: 'prod-audio-typec-wired',
    name: 'Digital DAC Type-C Wired In-Ear Earphones with Mic',
    slug: 'digital-dac-type-c-wired-earphones',
    category: 'earphones',
    categoryLabel: 'Audio & Neckbands',
    brand: 'Audio Master',
    shortDesc: 'High-res audio Type-C earphones with built-in digital DAC chip for OnePlus, Samsung & Pixel.',
    description: 'Bypasses phone internal analog DAC with dedicated digital audio decoding chip. Delivers true lossless audio reproduction and zero hiss or latency.',
    pricePaise: 39900, // ₹399
    mrpPaise: 89900, // ₹899 (56% off)
    rating: 4.4,
    ratingCount: 142,
    inStock: true,
    stockCount: 28,
    badge: 'MRH Assured',
    features: [
      'Built-in DAC chip: works on phones without 3.5mm audio jack',
      'Punchy deep bass with aluminum sound chambers',
      'In-line 3-button remote for calls, volume, and tracks',
      'Tangle-free anti-wrap elastomer cable',
    ],
    specs: {
      'Connector': 'USB Type-C (Digital DAC)',
      'Frequency Response': '20Hz - 20,000Hz',
      'Cord Length': '1.2m',
    },
    warranty: '6 Months Replacement Warranty',
    returnPolicy: '7 Days Counter Exchange',
    flipkartAssured: true,
  },
  {
    id: 'prod-audio-35mm-wired',
    name: 'Deep Bass 3.5mm Stereo In-Ear Earphones with Mic',
    slug: 'deep-bass-35mm-stereo-in-ear-earphones',
    category: 'earphones',
    categoryLabel: 'Audio & Neckbands',
    brand: 'Audio Essentials',
    shortDesc: 'Reliable everyday 3.5mm earphones with silicone ear tips and clear HD calling microphone.',
    description: 'Gold-plated 3.5mm L-shaped audio jack prevents accidental bending inside your pocket. Ideal for daily calling, online classes, and YouTube videos.',
    pricePaise: 19900, // ₹199
    mrpPaise: 49900, // ₹499 (60% off)
    rating: 4.3,
    ratingCount: 310,
    inStock: true,
    stockCount: 40,
    badge: 'Budget Pick',
    features: [
      'L-shaped 3.5mm jack for pocket safety',
      'Crisp vocals and balanced bass response',
      'Universal button to attend calls and pause music',
      'Comes with 3 sizes of soft silicone ear gels',
    ],
    specs: {
      'Jack': '3.5mm Gold Plated',
      'Impedance': '16 Ohms',
      'Cable Length': '1.2m',
    },
    warranty: '3 Months Replacement Warranty',
    returnPolicy: '7 Days Counter Exchange',
    flipkartAssured: true,
  },

  // --- POWER BANKS ---
  {
    id: 'prod-powerbank-10000',
    name: '10,000 mAh 22.5W Two-Way Fast Charging Slim Power Bank',
    slug: '10000mah-225w-slim-fast-charging-power-bank',
    category: 'power_banks',
    categoryLabel: 'Power Banks',
    brand: 'Ambrane',
    shortDesc: 'Pocket slim metallic power bank with dual USB-A + Type-C ports, 22.5W fast charge & LED display.',
    description: 'Charges your phone 2.5 times on a single fill. Airplane cabin approved. Features multi-protocol fast charging including Quick Charge 3.0 and Power Delivery.',
    pricePaise: 94900, // ₹949
    mrpPaise: 199900, // ₹1,999 (53% off)
    rating: 4.6,
    ratingCount: 185,
    inStock: true,
    stockCount: 10,
    badge: 'MRH Assured',
    features: [
      '22.5W Fast Charging (Charges phone 0-50% in 35 mins)',
      'Triple output ports: Charge 3 devices at once',
      'Airplane flight-friendly certified battery capacity',
      'High density lithium polymer cell with 9-layer circuit safety',
    ],
    specs: {
      'Capacity': '10,000 mAh / 37Wh',
      'Max Output': '22.5W Quick Charge',
      'Input Ports': 'Type-C & Micro-USB',
      'Weight': '210 grams',
    },
    warranty: '1 Year Brand Manufacturer Warranty',
    returnPolicy: '7 Days Counter Replacement',
    flipkartAssured: true,
  },
  {
    id: 'prod-powerbank-20000',
    name: '20,000 mAh Heavy Duty 22.5W Power Bank with Digital Display',
    slug: '20000mah-heavy-duty-fast-power-bank',
    category: 'power_banks',
    categoryLabel: 'Power Banks',
    brand: 'Portronics',
    shortDesc: 'Long-haul high capacity power bank capable of 5 phone charges, digital percentage readout.',
    description: 'Never run out of battery during power cuts or long train journeys. Real-time LED digital percentage readout tells you exact battery remaining.',
    pricePaise: 149900, // ₹1,499
    mrpPaise: 319900, // ₹3,199 (53% off)
    rating: 4.7,
    ratingCount: 129,
    inStock: true,
    stockCount: 7,
    badge: 'Deal of the Day',
    features: [
      '20,000 mAh massive capacity (5 full phone charges)',
      'Accurate numerical digital battery percentage LED screen',
      'Dual Type-C and USB-A high-amperage outputs',
      'Anti-scratch textured exterior grip',
    ],
    specs: {
      'Capacity': '20,000 mAh / 74Wh',
      'Max Output': '22.5W Fast Charge',
      'Battery Type': 'Lithium Polymer Core',
    },
    warranty: '1 Year Replacement Warranty',
    returnPolicy: '7 Days Counter Replacement',
    flipkartAssured: true,
  },

  // --- PROTECTION & CASES ---
  {
    id: 'prod-screen-tempered-9h',
    name: '9H Full Glue Edge-to-Edge HD Tempered Glass (Free Counter Fitting)',
    slug: '9h-full-glue-edge-to-edge-tempered-glass',
    category: 'protection',
    categoryLabel: 'Tempered & Covers',
    brand: 'Armor Shield',
    shortDesc: 'Oleophobic coated scratch-resistant 9H tempered glass. Free professional dust-free fitting at counter.',
    description: 'Available for all popular iPhone, Samsung Galaxy, Redmi, Realme, and Vivo models. Smooth rounded 2.5D edges prevent chipping. Touch responsiveness matches bare phone screen.',
    pricePaise: 14900, // ₹149
    mrpPaise: 39900, // ₹399 (63% off)
    rating: 4.7,
    ratingCount: 520,
    inStock: true,
    stockCount: 100,
    badge: 'Free In-Shop Fitting',
    features: [
      '9H Surface Hardness resists keys, coins, and drops',
      'Hydrophobic and Oleophobic anti-fingerprint coating',
      'Full adhesive glue ensures zero touch bubbles or lifting',
      'Free bubble-free professional application at Dunlop counter',
    ],
    specs: {
      'Hardness': '9H Diamond Grade',
      'Transparency': '99.9% High Definition Clarity',
      'Edge Finish': '2.5D Curved Polished Edge',
    },
    warranty: 'Instant On-Counter Fitting Guarantee',
    returnPolicy: 'Verified on handoff at counter',
    flipkartAssured: true,
  },
  {
    id: 'prod-screen-matte-gaming',
    name: 'Matte Anti-Glare Smooth Gaming Tempered Glass',
    slug: 'matte-anti-glare-smooth-gaming-tempered-glass',
    category: 'protection',
    categoryLabel: 'Tempered & Covers',
    brand: 'Gamer Shield',
    shortDesc: 'Ultra-smooth matte finish tempered glass. Zero glare outdoors, zero sweat drag for BGMI/FreeFire.',
    description: 'Specially engineered micro-etched matte surface. Keeps finger movement silky smooth during intense mobile gaming sessions. Zero smudges or oily fingerprints.',
    pricePaise: 19900, // ₹199
    mrpPaise: 49900, // ₹499 (60% off)
    rating: 4.8,
    ratingCount: 230,
    inStock: true,
    stockCount: 45,
    badge: 'Gamer Choice',
    features: [
      'Silky smooth matte touch optimized for mobile gaming',
      'Anti-glare: clear screen visibility under direct sunlight',
      'Anti-sweat and anti-oil smudge coating',
      'Impact dispersion layer protects underlying display',
    ],
    specs: {
      'Finish': 'Frosted Matte Anti-Reflective',
      'Touch Speed': 'Zero Friction Sensitivity',
      'Application': 'Free Counter Application',
    },
    warranty: 'Instant On-Counter Fitting Guarantee',
    returnPolicy: 'Verified on handoff at counter',
    flipkartAssured: true,
  },
  {
    id: 'prod-case-airbag-silicon',
    name: 'Shockproof Airbag Corner Clear Case with Camera Protection',
    slug: 'shockproof-airbag-corner-clear-phone-case',
    category: 'protection',
    categoryLabel: 'Tempered & Covers',
    brand: 'Armor Pro',
    shortDesc: 'Crystal clear TPU case with 4-corner impact shock absorption airbags and raised camera lip.',
    description: 'Military drop-tested clear case that shows off your original phone color while providing 360-degree shock protection. Raised 1.2mm bezels protect both camera lenses and screen from flat drops.',
    pricePaise: 14900, // ₹149
    mrpPaise: 39900, // ₹399 (63% off)
    rating: 4.5,
    ratingCount: 380,
    inStock: true,
    stockCount: 60,
    badge: 'Best Seller',
    features: [
      '4 Corner reinforced anti-shock hollow airbag bumpers',
      'Raised lip around camera bump prevents lens scratches',
      'Anti-yellowing UV resistant German Bayer TPU polymer',
      'Precision cutouts for mic, speakers, and charging ports',
    ],
    specs: {
      'Material': 'Shock-Absorbing Soft TPU Gel',
      'Thickness': '1.5mm Ultra Slim Armor',
      'Protection': 'Military Grade 6-Foot Drop Certified',
    },
    warranty: 'Quality Checked at Counter',
    returnPolicy: '7 Days Counter Exchange',
    flipkartAssured: true,
  },

  // --- REPAIR SPARES (DISPLAYS & BATTERIES) ---
  {
    id: 'prod-spare-display-samsung-m31',
    name: 'Samsung Galaxy M31 Original AMOLED Display Combo Assembly',
    slug: 'samsung-galaxy-m31-original-amoled-display-assembly',
    category: 'spares',
    categoryLabel: 'Displays & Batteries',
    brand: 'Samsung',
    shortDesc: '100% Genuine Super AMOLED screen & touch digitizer assembly with vivid colors & high refresh rate.',
    description: 'Factory-grade OEM replacement screen for Samsung Galaxy M31 (SM-M315F). Corrects cracked glass, black display, unresponsive touch, or display lines. Tested on bench before counter handover or fitting.',
    pricePaise: 245000, // ₹2,450
    mrpPaise: 389900, // ₹3,899 (37% off)
    rating: 4.8,
    ratingCount: 94,
    inStock: true,
    stockCount: 5,
    badge: 'MRH Verified Genuine',
    features: [
      'Original Super AMOLED panel with deep blacks & vivid contrast',
      'Perfect 10-point capacitive multi-touch sensitivity',
      'Exact factory bezel fit with pre-tested display IC flex',
      'Counter installation available with 3-month shop warranty',
    ],
    specs: {
      'Display Type': 'Super AMOLED capacitive touchscreen',
      'Screen Size': '6.4 Inches (1080 x 2340 pixels)',
      'Model Fit': 'Samsung Galaxy M31 (M315F)',
      'Installation': 'Bench Installation available at ₹350',
    },
    warranty: '90 Days Shop Warranty on Screen Assembly',
    returnPolicy: 'Tested live in front of customer at counter',
    flipkartAssured: true,
  },
  {
    id: 'prod-spare-battery-iphone-11',
    name: 'iPhone 11 Premium Replacement Battery (3110 mAh) 100% Health',
    slug: 'iphone-11-premium-replacement-battery-3110mah',
    category: 'spares',
    categoryLabel: 'Displays & Batteries',
    brand: 'Apple Compatible',
    shortDesc: 'Grade-A lithium-ion replacement battery cell. Restores 100% battery health and all-day endurance.',
    description: 'Fixes iPhone 11 battery drain, sudden shutdowns, service battery warnings, and sluggish performance. Uses high-purity cobalt cathode chemistry for 800+ full charging cycles.',
    pricePaise: 185000, // ₹1,850
    mrpPaise: 320000, // ₹3,200 (42% off)
    rating: 4.9,
    ratingCount: 112,
    inStock: true,
    stockCount: 6,
    badge: 'MRH Assured',
    features: [
      'True 3,110 mAh capacity restores factory battery life',
      'Advanced TI battery management protection board',
      'Zero cycle brand new fresh manufacturing batch',
      'Free waterproof adhesive gasket included',
    ],
    specs: {
      'Capacity': '3,110 mAh / 11.91 Wh',
      'Voltage': '3.83V Standard',
      'Compatibility': 'iPhone 11 (A2111, A2223, A2221)',
      'Lifecycle': '800+ Cycles',
    },
    warranty: '6 Months Full Replacement Warranty',
    returnPolicy: 'Immediate bench testing at shop counter',
    flipkartAssured: true,
  },
  {
    id: 'prod-spare-display-redmi-note10',
    name: 'Redmi Note 10 Pro / Pro Max AMOLED Display Folder Assembly',
    slug: 'redmi-note-10-pro-amoled-display-folder',
    category: 'spares',
    categoryLabel: 'Displays & Batteries',
    brand: 'Xiaomi / Redmi',
    shortDesc: '120Hz high refresh rate AMOLED display & touch combo assembly with camera punch-hole.',
    description: 'Direct replacement for Redmi Note 10 Pro and Note 10 Pro Max. Preserves high brightness and 120Hz fluid scrolling. Frame checked straight before mounting.',
    pricePaise: 225000, // ₹2,250
    mrpPaise: 360000, // ₹3,600 (38% off)
    rating: 4.7,
    ratingCount: 88,
    inStock: true,
    stockCount: 4,
    badge: 'MRH Assured',
    features: [
      '120Hz Smooth refresh rate AMOLED panel',
      'Full HD+ 1080 x 2400 resolution with micro punch-hole',
      'Touch sampling rate 240Hz for rapid responsiveness',
      'Bench testing and fitting performed by Debasish',
    ],
    specs: {
      'Size': '6.67 Inches AMOLED',
      'Refresh Rate': '120Hz Supported',
      'Compatibility': 'Redmi Note 10 Pro / Note 10 Pro Max',
    },
    warranty: '90 Days Warranty on Display Assembly',
    returnPolicy: 'Tested live in front of customer',
    flipkartAssured: true,
  },

  // --- TOOLS & REPAIR KITS ---
  {
    id: 'prod-tool-screwdriver-24in1',
    name: '24-in-1 Magnetic Precision Screwdriver Repair Tool Kit',
    slug: '24-in-1-magnetic-precision-screwdriver-kit',
    category: 'tools',
    categoryLabel: 'Repair Kits & Tools',
    brand: 'Mechanic Pro',
    shortDesc: 'S2 alloy steel precision screwdriver bit set with aluminum magnetic slide storage case.',
    description: 'Essential tool kit for opening smartphones, iPhones (Pentalobe, Y-Triwing, Phillips), smartwatches, and electronics. Magnetized bits firmly hold microscopic screws.',
    pricePaise: 49900, // ₹499
    mrpPaise: 99900, // ₹999 (50% off)
    rating: 4.8,
    ratingCount: 165,
    inStock: true,
    stockCount: 12,
    badge: 'Technician Grade',
    features: [
      '24 High-hardness S2 steel precision bits (60HRC)',
      'Includes Pentalobe 0.8 & Tri-wing Y0.6 for all iPhone screws',
      'Sleek push-to-eject aluminum alloy storage case',
      'Swivel cap 360-degree rotating handle for fast screwing',
    ],
    specs: {
      'Bits Material': 'S2 Hardened Chrome Alloy Steel',
      'Bits Count': '24 Precision Bits + 1 Handle',
      'Handle': 'Anodized Aluminum Alloy',
    },
    warranty: '1 Year Tool Replacement Warranty',
    returnPolicy: '7 Days Counter Exchange',
    flipkartAssured: true,
  },
  {
    id: 'prod-tool-b7000-glue',
    name: 'B-7000 Multi-Purpose Mobile Screen & Frame Glue Adhesive (50ml)',
    slug: 'b7000-mobile-screen-frame-glue-adhesive-50ml',
    category: 'tools',
    categoryLabel: 'Repair Kits & Tools',
    brand: 'Zhanlida',
    shortDesc: 'Professional clear waterproof adhesive for mobile phone display, frame & back glass bonding.',
    description: 'The industry-standard repair glue with fine needle-point applicator cap for precision dispensing along delicate phone bezels. Dries transparent, remains flexible, and can be reheated for future repairs.',
    pricePaise: 14900, // ₹149
    mrpPaise: 29900, // ₹299 (50% off)
    rating: 4.6,
    ratingCount: 210,
    inStock: true,
    stockCount: 30,
    badge: 'Essential',
    features: [
      'Precision needle-point metal tip nozzle for thin borders',
      'High elasticity & waterproof seal without damaging display flex',
      'Cures clear: non-corrosive to phone paints or plastics',
      'Reusable cap prevents nozzle clogging',
    ],
    specs: {
      'Volume': '50ml Tube',
      'Curing Time': '6 Minutes Surface / 24 Hours Full Cure',
      'Color': 'Crystal Clear Transparent',
    },
    warranty: '100% Fresh Chemical Batch Guarantee',
    returnPolicy: 'Counter exchange if dried or damaged',
    flipkartAssured: true,
  },
];

export interface PriceRangePreset {
  id: string;
  label: string;
  min?: number;
  max?: number;
}

export const PRICE_RANGES: PriceRangePreset[] = [
  { id: 'all', label: 'All Prices' },
  { id: 'under_299', label: 'Under ₹299', max: 29900 },
  { id: '300_799', label: '₹300 - ₹799', min: 30000, max: 79900 },
  { id: '800_1499', label: '₹800 - ₹1,499', min: 80000, max: 149900 },
  { id: '1500_plus', label: '₹1,500 and Above', min: 150000 },
];

export const SORT_OPTIONS = [
  { id: 'popular', label: 'Popularity' },
  { id: 'price_asc', label: 'Price -- Low to High' },
  { id: 'price_desc', label: 'Price -- High to Low' },
  { id: 'rating', label: 'Customer Rating' },
  { id: 'discount', label: 'Discount' },
];

export function getAllBrands(): string[] {
  const set = new Set<string>();
  STORE_PRODUCTS.forEach((p) => {
    if (p.brand) set.add(p.brand);
  });
  return Array.from(set).sort();
}

export interface StoreFilters {
  category?: string;
  search?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  assuredOnly?: boolean;
  inStockOnly?: boolean;
  minRating?: number;
  sortBy?: 'popular' | 'price_asc' | 'price_desc' | 'rating' | 'discount';
}

export function getStoreProducts(filters?: StoreFilters): StoreProduct[] {
  let list = [...STORE_PRODUCTS];

  if (filters?.category && filters.category !== 'all') {
    const cat = filters.category === 'audio' ? 'earphones' : filters.category;
    list = list.filter((p) => p.category === cat);
  }

  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.shortDesc.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q)
    );
  }

  if (filters?.brand && filters.brand !== 'all') {
    list = list.filter((p) => p.brand.toLowerCase() === filters.brand?.toLowerCase());
  }

  if (filters?.minPrice !== undefined) {
    list = list.filter((p) => p.pricePaise >= (filters.minPrice as number));
  }

  if (filters?.maxPrice !== undefined) {
    list = list.filter((p) => p.pricePaise <= (filters.maxPrice as number));
  }

  if (filters?.assuredOnly) {
    list = list.filter((p) => p.flipkartAssured);
  }

  if (filters?.inStockOnly) {
    list = list.filter((p) => p.inStock);
  }

  if (filters?.minRating && filters.minRating > 0) {
    list = list.filter((p) => p.rating >= filters.minRating);
  }

  if (filters?.sortBy) {
    switch (filters.sortBy) {
      case 'price_asc':
        list.sort((a, b) => a.pricePaise - b.pricePaise);
        break;
      case 'price_desc':
        list.sort((a, b) => b.pricePaise - a.pricePaise);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount);
        break;
      case 'discount': {
        const getDisc = (p: StoreProduct) => (p.mrpPaise - p.pricePaise) / p.mrpPaise;
        list.sort((a, b) => getDisc(b) - getDisc(a));
        break;
      }
      case 'popular':
      default:
        list.sort((a, b) => b.ratingCount - a.ratingCount);
        break;
    }
  }

  return list;
}

export function getStoreProductById(id: string): StoreProduct | undefined {
  return STORE_PRODUCTS.find((p) => p.id === id);
}

export function getStoreProductBySlug(slug: string): StoreProduct | undefined {
  return STORE_PRODUCTS.find((p) => p.slug === slug);
}

