const { pool } = require('./db.cjs');

const DEFAULT_BUSINESS_SETTINGS = {
  businessName: 'Mobile Repairing House',
  ownerContactName: 'Debasish',
  phone: '+91 97327 89938',
  whatsapp: '+91 97327 89938',
  fullAddress: 'Bhajan Complex, 139, Barrackpore Trunk Road, Dunlop, Saket Nagar, Bonhooghly, Baranagar, Kolkata, West Bengal 700108, India',
  plusCode: 'M92H+Q4, Kolkata, West Bengal',
  googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=M92H%2BQ4%20Kolkata%2C%20West%20Bengal',
  openingHours: 'Contact Debasish for current daily shop hours and visit timing',
  noticeBarText: 'Expert Android & iPhone Repairs at Bhajan Complex, Dunlop, Kolkata. Call or WhatsApp for diagnostic enquiries.',
  noticeBarActive: true,
  serviceCategories: [
    'Display Replacement',
    'Battery Replacement',
    'Charging Port Repair',
    'Motherboard Diagnostics',
    'Camera Repair',
    'Audio & Mic Repair',
    'Connectivity & Network',
    'Software Issues',
    'Back Glass Repair',
    'Water Damage Assessment',
  ],
  supportedBrands: {
    android: ['Samsung', 'Xiaomi / Redmi / POCO', 'Vivo', 'Oppo', 'Realme', 'OnePlus', 'Motorola', 'Google Pixel', 'Nothing', 'Infinix', 'Tecno'],
    iphone: ['iPhone 15 Series', 'iPhone 14 Series', 'iPhone 13 Series', 'iPhone 12 Series', 'iPhone 11 Series', 'iPhone XR / XS / X', 'iPhone SE (2nd/3rd Gen)', 'iPhone 8 / 7'],
  },
  termsAndConditions: '1. Diagnostic assessment is required before confirming final repair costs.\n2. Repair work will only commence after customer approval of the provided estimate.\n3. Devices left unclaimed for more than 60 days following completion notification may be subject to storage handling policies.\n4. Replaced parts can be returned to customer upon request during collection.',
  warrantyPolicyDefault: 'Warranty is provided on specific eligible repairs and parts as noted on your invoice. Physical damage, liquid contact after service, and unauthorized tampering void any repair warranty.',
  taxRatePercent: 0,
  taxEnabled: false,
  currencySymbol: '₹',
};

const INITIAL_SERVICES = [
  {
    id: 'display-replacement',
    slug: 'display-touchscreen-replacement',
    title: 'Display and Touchscreen Replacement',
    category: 'Hardware Replacement',
    iconName: 'Smartphone',
    shortDescription: 'Replacement for cracked screens, unresponsive touch, black screens, or display flicker on Android phones and iPhones.',
    fullDescription: 'Accidental drops frequently cause cracked glass, broken digitizers, or damaged OLED/LCD panels. At Mobile Repairing House in Dunlop, we perform careful disassembly, remove broken panels, test replacement screens thoroughly for touch responsiveness and color fidelity, and seal your device securely.',
    symptoms: [
      'Cracked or shattered outer glass',
      'Unresponsive or erratic touch response (ghost touch)',
      'Black screen while phone still vibrates or rings',
      'Vertical or horizontal colored lines across the screen',
      'Ink spots or black bleeding patches on display',
    ],
    diagnosticConsiderations: [
      'Inspection of internal frame alignment to ensure flush screen seating',
      'Verification of display connector integrity on the motherboard',
      'Testing touch accuracy across all screen zones before final sealing',
    ],
    supportedDevices: ['Android Smartphones (Samsung, Redmi, Vivo, Oppo, Realme, OnePlus, etc.)', 'Supported iPhone Models'],
    assessmentProcess: [
      'Physical inspection of glass, frame, and display panel',
      'Testing whether the touch controller or internal board has sustained impact damage',
      'Presentation of available replacement display options and estimate for customer approval',
      'Precision installation and multi-point post-repair testing',
    ],
    estimateApprovalExplanation: 'Screen replacement pricing varies depending on device brand, model, and display technology (OLED, AMOLED, or LCD). We provide a clear estimate upfront before starting repair work.',
    faqs: [
      {
        question: 'Will my phone data be erased during a screen replacement?',
        answer: 'Screen replacement does not affect your internal storage. However, we always recommend regular device backups as best practice.',
      },
      {
        question: 'How long does a screen replacement take?',
        answer: 'Turnaround depends on model part availability. Common models are often completed within the same day once parts are verified.',
      },
    ],
    enabled: true,
    order: 1,
  },
  {
    id: 'battery-replacement',
    slug: 'battery-replacement',
    title: 'Battery Replacement',
    category: 'Power & Battery',
    iconName: 'BatteryCharging',
    shortDescription: 'Restore battery life and device reliability for phones suffering from rapid drain, overheating, or sudden shutdowns.',
    fullDescription: 'Lithium-ion smartphone batteries naturally degrade over cycles of use. If your phone discharges rapidly, shuts down unexpectedly under load, or exhibits signs of swelling, our shop provides professional battery testing and safe replacement.',
    symptoms: [
      'Battery percentage drops rapidly within a few hours of light use',
      'Phone powers off suddenly while showing 20% to 30% battery remaining',
      'Device back panel is lifting or bulging due to swollen battery',
      'Phone operates only when connected to the wall charger',
      'Excessive heat generated during standard daily usage',
    ],
    diagnosticConsiderations: [
      'Check for dangerous battery swelling requiring immediate careful handling',
      'Assess charging circuit and current draw to differentiate motherboard leakage from battery degradation',
      'Test battery health metrics and charging cycles',
    ],
    supportedDevices: ['Android Phones', 'Supported iPhone Models'],
    assessmentProcess: [
      'Visual and physical inspection of battery housing',
      'Current draw and charging voltage assessment',
      'Safe extraction using heating and adhesive release tools',
      'Installation of high-grade cell and multi-cycle charge testing',
    ],
    estimateApprovalExplanation: 'Battery replacement costs reflect part grade and phone model. Estimates are confirmed before replacement.',
    faqs: [
      {
        question: 'Is battery swelling dangerous?',
        answer: 'Yes, swollen batteries present puncture and combustion hazards. If your back glass is lifting, avoid charging the device and bring it in for prompt safe replacement.',
      },
    ],
    enabled: true,
    order: 2,
  },
  {
    id: 'charging-port-repair',
    slug: 'charging-port-repair',
    title: 'Charging Port & Connector Repair',
    category: 'Power & Ports',
    iconName: 'Zap',
    shortDescription: 'Fix loose cables, slow charging, moisture detected warnings, or broken Type-C and Lightning connectors.',
    fullDescription: 'Frequent plugging, pocket lint, and accidental drops while plugged in can damage charging sub-boards, break internal connector pins, or weaken solder joints. We offer precision micro-soldering and port assembly replacements.',
    symptoms: [
      'Cable must be held at an angle to charge',
      'Persistent "Moisture detected in charging port" errors on dry devices',
      'Slow or intermittent charging speeds',
      'Device does not establish USB connection with computers',
    ],
    diagnosticConsiderations: [
      'Microscopic inspection for debris vs physically bent/broken pins',
      'Micro-USB vs Type-C daughterboard vs integrated motherboard solder joints',
      'Thermal test of charging IC under load',
    ],
    supportedDevices: ['Type-C Android Phones', 'Micro-USB Devices', 'Lightning Port iPhones'],
    assessmentProcess: [
      'Deep lint cleaning under magnification (often resolves the issue without part replacement)',
      'Pin continuity and resistance checking',
      'Sub-board or connector port replacement',
      'Charging current measurement using inline USB power meters',
    ],
    estimateApprovalExplanation: 'Cleaning and minor re-soldering have minimal cost; connector or daughterboard replacements are quoted prior to disassembly.',
    faqs: [
      {
        question: 'Can lint buildup ruin my charging port?',
        answer: 'Compacted lint prevents the cable plug from seating completely, causing pins to arc and burn. Routine gentle cleaning prevents permanent damage.',
      },
    ],
    enabled: true,
    order: 3,
  },
];

async function seedDefaults() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Settings
    await client.query(`
      INSERT INTO mrh_settings (id, data, updated_at)
      VALUES ('main', $1, NOW())
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
    `, [JSON.stringify(DEFAULT_BUSINESS_SETTINGS)]);

    // 2. Services
    for (const s of INITIAL_SERVICES) {
      await client.query(`
        INSERT INTO mrh_services (id, slug, category, title, data, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, category = EXCLUDED.category, title = EXCLUDED.title, data = EXCLUDED.data, updated_at = NOW();
      `, [s.id, s.slug, s.category, s.title, JSON.stringify(s)]);
    }

    await client.query('COMMIT');
    console.log('Default settings and initial services seeded into Neon successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error seeding defaults:', err);
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seedDefaults().then(() => pool.end());
}

module.exports = { seedDefaults };
