const crypto = require('crypto');
const { pool } = require('./db.cjs');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Beginning database migration for Mobile Repairing House...');

    await client.query('BEGIN');

    // 1. Settings Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS mrh_settings (
        id VARCHAR PRIMARY KEY DEFAULT 'main',
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Customers Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS mrh_customers (
        id VARCHAR PRIMARY KEY,
        ledger_code VARCHAR UNIQUE,
        full_name VARCHAR NOT NULL,
        phone VARCHAR NOT NULL,
        normalized_phone VARCHAR NOT NULL,
        secondary_phone VARCHAR,
        email VARCHAR,
        address TEXT,
        notes TEXT,
        tags TEXT,
        status VARCHAR DEFAULT 'Active',
        opening_balance NUMERIC(12,2) DEFAULT 0.00,
        outstanding_balance NUMERIC(12,2) DEFAULT 0.00,
        loyalty_points INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        created_by VARCHAR
      );
      CREATE INDEX IF NOT EXISTS idx_mrh_customers_phone ON mrh_customers(normalized_phone);
      CREATE INDEX IF NOT EXISTS idx_mrh_customers_ledger_code ON mrh_customers(ledger_code);
    `);

    // 3. Repairs Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS mrh_repairs (
        id VARCHAR PRIMARY KEY,
        job_number VARCHAR UNIQUE NOT NULL,
        customer_id VARCHAR REFERENCES mrh_customers(id) ON DELETE SET NULL,
        customer_name VARCHAR NOT NULL,
        customer_phone VARCHAR NOT NULL,
        customer_email VARCHAR,
        device_type VARCHAR NOT NULL,
        brand VARCHAR NOT NULL,
        model VARCHAR NOT NULL,
        imei_or_serial VARCHAR,
        reported_problem TEXT NOT NULL,
        diagnosis TEXT,
        inspection_notes TEXT,
        condition_at_intake TEXT,
        accessories_received TEXT,
        device_passcode_or_pattern TEXT,
        status VARCHAR NOT NULL DEFAULT 'received',
        priority VARCHAR NOT NULL DEFAULT 'normal',
        assigned_technician_id VARCHAR,
        assigned_technician_name VARCHAR,
        received_at TIMESTAMPTZ DEFAULT NOW(),
        expected_completion_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        estimate_id VARCHAR,
        invoice_id VARCHAR,
        warranty_id VARCHAR,
        internal_notes TEXT,
        tracking_token VARCHAR UNIQUE NOT NULL,
        approval_status VARCHAR,
        approval_timestamp TIMESTAMPTZ,
        approval_method VARCHAR,
        approval_recorded_by VARCHAR,
        created_by VARCHAR,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_mrh_repairs_job_number ON mrh_repairs(job_number);
      CREATE INDEX IF NOT EXISTS idx_mrh_repairs_tracking_token ON mrh_repairs(tracking_token);
      CREATE INDEX IF NOT EXISTS idx_mrh_repairs_status ON mrh_repairs(status);
    `);

    // 4. Repair Events (Timeline)
    await client.query(`
      CREATE TABLE IF NOT EXISTS mrh_repair_events (
        id VARCHAR PRIMARY KEY,
        repair_job_id VARCHAR REFERENCES mrh_repairs(id) ON DELETE CASCADE,
        status VARCHAR NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        actor_id VARCHAR,
        actor_name VARCHAR,
        note TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_mrh_repair_events_job ON mrh_repair_events(repair_job_id);
    `);

    // 5. Estimates Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS mrh_estimates (
        id VARCHAR PRIMARY KEY,
        estimate_number VARCHAR UNIQUE NOT NULL,
        repair_job_id VARCHAR,
        job_number VARCHAR,
        customer_id VARCHAR,
        customer_name VARCHAR,
        customer_phone VARCHAR,
        items JSONB NOT NULL DEFAULT '[]'::jsonb,
        subtotal_paise BIGINT NOT NULL DEFAULT 0,
        discount_paise BIGINT NOT NULL DEFAULT 0,
        tax_paise BIGINT NOT NULL DEFAULT 0,
        total_paise BIGINT NOT NULL DEFAULT 0,
        status VARCHAR NOT NULL DEFAULT 'draft',
        revision INT NOT NULL DEFAULT 1,
        approval_token VARCHAR UNIQUE NOT NULL,
        notes TEXT,
        issued_at TIMESTAMPTZ,
        approved_at TIMESTAMPTZ,
        rejected_at TIMESTAMPTZ,
        rejection_reason TEXT,
        approval_method VARCHAR,
        approval_recorded_by VARCHAR,
        valid_until_days INT DEFAULT 7,
        created_by VARCHAR,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 6. Invoices Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS mrh_invoices (
        id VARCHAR PRIMARY KEY,
        invoice_number VARCHAR UNIQUE NOT NULL,
        repair_job_id VARCHAR,
        job_number VARCHAR,
        customer_id VARCHAR,
        customer_name VARCHAR,
        customer_phone VARCHAR,
        items JSONB NOT NULL DEFAULT '[]'::jsonb,
        subtotal_paise BIGINT NOT NULL DEFAULT 0,
        discount_paise BIGINT NOT NULL DEFAULT 0,
        tax_paise BIGINT NOT NULL DEFAULT 0,
        total_paise BIGINT NOT NULL DEFAULT 0,
        amount_paid_paise BIGINT NOT NULL DEFAULT 0,
        balance_due_paise BIGINT NOT NULL DEFAULT 0,
        status VARCHAR NOT NULL DEFAULT 'draft',
        bill_type VARCHAR DEFAULT 'counter_bill',
        payment_method VARCHAR DEFAULT 'cash',
        issued_at TIMESTAMPTZ DEFAULT NOW(),
        due_date TIMESTAMPTZ,
        notes TEXT,
        created_by VARCHAR,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 7. Payments Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS mrh_payments (
        id VARCHAR PRIMARY KEY,
        payment_reference VARCHAR UNIQUE NOT NULL,
        invoice_id VARCHAR,
        repair_job_id VARCHAR,
        customer_id VARCHAR,
        customer_name VARCHAR,
        amount_paise BIGINT NOT NULL,
        method VARCHAR NOT NULL,
        external_reference VARCHAR,
        notes TEXT,
        recorded_by VARCHAR,
        recorded_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 8. Inventory Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS mrh_inventory (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        sku VARCHAR UNIQUE NOT NULL,
        category VARCHAR NOT NULL,
        brand VARCHAR,
        description TEXT,
        quantity_available INT NOT NULL DEFAULT 0,
        low_stock_threshold INT NOT NULL DEFAULT 5,
        purchase_cost_paise BIGINT NOT NULL DEFAULT 0,
        selling_price_paise BIGINT NOT NULL DEFAULT 0,
        active BOOLEAN DEFAULT TRUE,
        serial_number VARCHAR,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE mrh_inventory ADD COLUMN IF NOT EXISTS serial_number VARCHAR;
    `);

    // Seed production inventory catalog if not already present
    const defaultInventory = [
      { id: 'inv_prod_chg_sam_25w', name: '25W USB-C PD Super Fast Wall Charger Adapter', sku: 'CHG-SAM-25W-PD', category: 'chargers', brand: 'Samsung', desc: 'Type-C PD fast charger adapter', qty: 15, cost: 22000, price: 44900 },
      { id: 'inv_prod_chg_apl_20w', name: '20W USB-C Power Adapter for iPhone', sku: 'CHG-APL-20W-PD', category: 'chargers', brand: 'Apple', desc: 'USB-C fast charging adapter for iPhone', qty: 12, cost: 29000, price: 59900 },
      { id: 'inv_prod_chg_gan_65w', name: '65W GaN Dual Port (Type-C + USB-A) Ultra-Fast Charger', sku: 'CHG-GAN-65W-PORT', category: 'chargers', brand: 'Portronics', desc: 'High-speed GaN laptop & mobile charger', qty: 8, cost: 65000, price: 119900 },
      { id: 'inv_prod_cbl_typc_braid', name: 'Heavy Duty Braided USB Type-C to Type-C Cable (1m)', sku: 'CBL-TYPC-BRAID-1M', category: 'cables', brand: 'Generic OEM', desc: 'High durability nylon braided fast cable', qty: 25, cost: 6000, price: 19900 },
      { id: 'inv_prod_cbl_lgt_typc', name: 'Fast Charging Lightning to Type-C Cable for iPhone (1m)', sku: 'CBL-LGT-TYPEC-1M', category: 'cables', brand: 'Apple Compatible', desc: 'Braided Lightning to Type-C cable', qty: 20, cost: 8000, price: 24900 },
      { id: 'inv_prod_cbl_micro_fast', name: 'Micro-USB Fast Charging & Data Cable (1.2m)', sku: 'CBL-MICRO-FAST-1M', category: 'cables', brand: 'Generic OEM', desc: 'Standard micro USB sync cable', qty: 20, cost: 4500, price: 12900 },
      { id: 'inv_prod_ear_35mm_mic', name: 'In-Ear Wired Earphones with Mic (3.5mm Jack)', sku: 'EAR-35MM-INLINE-MIC', category: 'earphones', brand: 'Audio Essentials', desc: 'Clear audio wired hands-free 3.5mm earphones', qty: 20, cost: 8000, price: 24900 },
      { id: 'inv_prod_pb_10k_dual', name: '10,000 mAh Dual Output Slim Power Bank', sku: 'PB-10K-DUAL-FAST', category: 'power_banks', brand: 'Portronics', desc: 'Pocket sized dual USB fast power bank', qty: 6, cost: 45000, price: 89900 },
      { id: 'inv_prod_tmp_9h_edge', name: 'Edge-to-Edge 9H Tempered Glass Screen Protector', sku: 'TMP-9H-EDGE-UNI', category: 'other', brand: 'Universal', desc: 'High transparency shatterproof 9H glass', qty: 50, cost: 3000, price: 14900 },
      { id: 'inv_prod_cse_sil_bump', name: 'Premium Shockproof Silicone Bumper Back Case', sku: 'CSE-SIL-BUMP-UNI', category: 'other', brand: 'Universal', desc: 'Anti-fall TPU silicone case', qty: 35, cost: 4500, price: 19900 },
      { id: 'inv_prod_disp_apl_ip13', name: 'iPhone 13 / 13 Pro AMOLED Display Assembly', sku: 'DISP-APL-IP13-OLED', category: 'displays', brand: 'Apple', desc: 'Premium quality replacement OLED screen', qty: 4, cost: 450000, price: 680000 },
      { id: 'inv_prod_disp_sam_m31', name: 'Samsung Galaxy M31 / M30s Super AMOLED Display Combo', sku: 'DISP-SAM-M31-OLED', category: 'displays', brand: 'Samsung', desc: 'High brightness AMOLED combo replacement', qty: 4, cost: 210000, price: 340000 },
      { id: 'inv_prod_disp_rdm_n12', name: 'Redmi Note 12 5G OLED Display Folder Combo', sku: 'DISP-RDM-N12-5G', category: 'displays', brand: 'Xiaomi / Redmi', desc: 'Smooth touch high refresh rate replacement screen', qty: 8, cost: 185000, price: 295000 },
      { id: 'inv_prod_disp_rlm_8pro', name: 'Realme 8 / 8 Pro AMOLED Display Combo', sku: 'DISP-RLM-8PRO-OLED', category: 'displays', brand: 'Realme', desc: 'Vibrant punchy OLED panel replacement', qty: 5, cost: 210000, price: 320000 },
      { id: 'inv_prod_bat_apl_ip11', name: 'iPhone 11 High Capacity Replacement Battery 3110mAh', sku: 'BAT-APL-IP11-STD', category: 'batteries', brand: 'Apple Compatible', desc: 'Zero cycle grade-A battery pack', qty: 6, cost: 120000, price: 220000 },
      { id: 'inv_prod_bat_sam_a51', name: 'Samsung Galaxy A51 Battery 4000mAh (EB-BA515ABY)', sku: 'BAT-SAM-A51-4000', category: 'batteries', brand: 'Samsung Compatible', desc: 'Original spec polymer lithium battery', qty: 5, cost: 65000, price: 140000 },
      { id: 'inv_prod_sub_usb_typec', name: 'Universal Type-C Charging Sub-Board Assembly (Multi-brand)', sku: 'SUB-USB-TYPEC-UNI', category: 'charging_ports', brand: 'Universal', desc: 'Fast charge supporting sub-board PCB', qty: 15, cost: 25000, price: 65000 },
    ];

    for (const item of defaultInventory) {
      await client.query(`
        INSERT INTO mrh_inventory (id, name, sku, category, brand, description, quantity_available, low_stock_threshold, purchase_cost_paise, selling_price_paise, active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 3, $8, $9, TRUE)
        ON CONFLICT (sku) DO NOTHING
      `, [item.id, item.name, item.sku, item.category, item.brand, item.desc, item.qty, item.cost, item.price]);
    }

    // 9. Inventory Movements Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS mrh_inventory_movements (
        id VARCHAR PRIMARY KEY,
        product_id VARCHAR REFERENCES mrh_inventory(id) ON DELETE CASCADE,
        product_name VARCHAR,
        sku VARCHAR,
        type VARCHAR NOT NULL,
        quantity_delta INT NOT NULL,
        previous_quantity INT NOT NULL,
        new_quantity INT NOT NULL,
        reference_id VARCHAR,
        notes TEXT,
        performed_by VARCHAR,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 10. Warranties Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS mrh_warranties (
        id VARCHAR PRIMARY KEY,
        warranty_reference VARCHAR UNIQUE NOT NULL,
        repair_job_id VARCHAR,
        job_number VARCHAR,
        customer_id VARCHAR,
        customer_name VARCHAR,
        customer_phone VARCHAR,
        device_info TEXT,
        covered_work TEXT,
        duration_days INT NOT NULL DEFAULT 30,
        start_date DATE NOT NULL,
        expiry_date DATE NOT NULL,
        terms TEXT,
        status VARCHAR DEFAULT 'active',
        void_reason TEXT,
        created_by VARCHAR,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 11. Services Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS mrh_services (
        id VARCHAR PRIMARY KEY,
        slug VARCHAR UNIQUE NOT NULL,
        category VARCHAR NOT NULL,
        title VARCHAR NOT NULL,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 12. Accessories Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS mrh_accessories (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        category VARCHAR NOT NULL,
        brand VARCHAR,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 13. Enquiries Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS mrh_enquiries (
        id VARCHAR PRIMARY KEY,
        public_reference VARCHAR UNIQUE NOT NULL,
        customer_name VARCHAR NOT NULL,
        phone VARCHAR NOT NULL,
        email VARCHAR,
        device_type VARCHAR NOT NULL,
        brand VARCHAR NOT NULL,
        model VARCHAR NOT NULL,
        imei_or_serial VARCHAR,
        problem_category VARCHAR NOT NULL,
        description TEXT NOT NULL,
        preferred_visit_date VARCHAR,
        preferred_contact_method VARCHAR DEFAULT 'whatsapp',
        status VARCHAR DEFAULT 'new',
        notes TEXT,
        customer_id VARCHAR,
        converted_job_id VARCHAR,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 14. Users / Staff Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS mrh_users (
        uid VARCHAR PRIMARY KEY,
        email VARCHAR UNIQUE NOT NULL,
        display_name VARCHAR NOT NULL,
        password_hash VARCHAR,
        role VARCHAR NOT NULL DEFAULT 'owner',
        phone VARCHAR,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        last_login_at TIMESTAMPTZ
      );
    `);

    // Seed Owner if not exists
    const ownerHash = crypto.createHash('sha256').update('Debasish@2026').digest('hex');
    await client.query(`
      INSERT INTO mrh_users (uid, email, display_name, role, phone, active, password_hash)
      VALUES ('owner_debasish', 'debasish@mobilerepairinghouse.com', 'Debasish (Owner)', 'owner', '+91 97327 89938', TRUE, $1)
      ON CONFLICT (uid) DO UPDATE
      SET email = EXCLUDED.email,
          password_hash = EXCLUDED.password_hash;
    `, [ownerHash]);

    await client.query('COMMIT');
    console.log('Migration completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  migrate().then(() => pool.end());
}

module.exports = { migrate };
