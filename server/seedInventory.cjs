const { pool } = require('./db.cjs');

const SAMPLE_INVENTORY = [
  {
    id: 'inv-disp-redmi-note12',
    name: 'Redmi Note 12 5G OLED Display Folder Combo',
    sku: 'DISP-RDM-N12-5G',
    category: 'displays',
    brand: 'Xiaomi / Redmi',
    description: 'High refresh rate original grade OLED panel assembly for Redmi Note 12 5G.',
    quantity_available: 8,
    low_stock_threshold: 3,
    purchase_cost_paise: 185000,
    selling_price_paise: 295000,
  },
  {
    id: 'inv-disp-samsung-m31',
    name: 'Samsung Galaxy M31 / M30s Super AMOLED Display Combo',
    sku: 'DISP-SAM-M31-OLED',
    category: 'displays',
    brand: 'Samsung',
    description: 'Super AMOLED vibrant display folder with touch digitizer glass.',
    quantity_available: 4,
    low_stock_threshold: 2,
    purchase_cost_paise: 210000,
    selling_price_paise: 340000,
  },
  {
    id: 'inv-bat-ip11',
    name: 'iPhone 11 High Capacity Replacement Battery 3110mAh',
    sku: 'BAT-APL-IP11-STD',
    category: 'batteries',
    brand: 'Apple Compatible',
    description: 'Zero-cycle TI-based battery cell for iPhone 11 with original connector ribbon.',
    quantity_available: 6,
    low_stock_threshold: 2,
    purchase_cost_paise: 120000,
    selling_price_paise: 220000,
  },
  {
    id: 'inv-bat-samsung-a51',
    name: 'Samsung Galaxy A51 Battery 4000mAh (EB-BA515ABY)',
    sku: 'BAT-SAM-A51-4000',
    category: 'batteries',
    brand: 'Samsung Compatible',
    description: 'Grade-A lithium-ion replacement battery for Galaxy A51.',
    quantity_available: 5,
    low_stock_threshold: 2,
    purchase_cost_paise: 65000,
    selling_price_paise: 140000,
  },
  {
    id: 'inv-port-typec-sub',
    name: 'Universal Type-C Charging Sub-Board Assembly (Multi-brand)',
    sku: 'SUB-USB-TYPEC-UNI',
    category: 'charging_ports',
    brand: 'Universal',
    description: 'Lower microphone & Type-C charging port board module.',
    quantity_available: 15,
    low_stock_threshold: 5,
    purchase_cost_paise: 25000,
    selling_price_paise: 65000,
  },
];

async function seedInventory() {
  const client = await pool.connect();
  try {
    for (const item of SAMPLE_INVENTORY) {
      await client.query(`
        INSERT INTO mrh_inventory (
          id, name, sku, category, brand, description,
          quantity_available, low_stock_threshold,
          purchase_cost_paise, selling_price_paise, active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE)
        ON CONFLICT (id) DO NOTHING;
      `, [
        item.id, item.name, item.sku, item.category, item.brand, item.description,
        item.quantity_available, item.low_stock_threshold,
        item.purchase_cost_paise, item.selling_price_paise
      ]);
    }
    console.log('Sample inventory seeded successfully!');
  } catch (err) {
    console.error('Error seeding inventory:', err);
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seedInventory().then(() => pool.end());
}

module.exports = { seedInventory };
