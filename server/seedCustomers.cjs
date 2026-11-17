const fs = require('fs');
const path = require('path');
const { pool } = require('./db.cjs');

async function seedCustomers() {
  const jsonPath = path.resolve(__dirname, '../scratch/customers_extracted.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('Customer data file not found:', jsonPath);
    return;
  }

  const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const customerList = Object.values(rawData);

  console.log(`Feeding ${customerList.length} customers into Neon database...`);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let inserted = 0;
    for (const c of customerList) {
      const id = `cust_${c.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const ledgerCode = c.code;
      const fullName = (c.name || 'Customer').trim();
      const phone = (c.phone || '').trim();
      const normalizedPhone = phone.replace(/\D/g, '');
      const secondaryPhone = c.secondary_phone || null;
      const email = `cus-${c.num}@mobitez.customer`;
      const address = (c.address || 'India').trim();
      const notes = `Imported from Mobitez customer register (${c.date || ''})`;
      const tags = `Mobitez, ${c.code}`;
      const status = c.status || 'Active';
      const openingBalance = 0.00;
      const outstandingBalance = 0.00;
      const loyaltyPoints = 0;

      // Parse date or use fallback
      let createdAt = new Date().toISOString();
      if (c.date) {
        try {
          const parsed = new Date(c.date.replace(/^[^\w\d]+/, ''));
          if (!isNaN(parsed.getTime())) {
            createdAt = parsed.toISOString();
          }
        } catch {}
      }

      await client.query(`
        INSERT INTO mrh_customers (
          id, ledger_code, full_name, phone, normalized_phone, secondary_phone,
          email, address, notes, tags, status, opening_balance, outstanding_balance,
          loyalty_points, created_at, updated_at, created_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), 'system_import'
        )
        ON CONFLICT (id) DO UPDATE SET
          ledger_code = EXCLUDED.ledger_code,
          full_name = EXCLUDED.full_name,
          phone = EXCLUDED.phone,
          normalized_phone = EXCLUDED.normalized_phone,
          secondary_phone = EXCLUDED.secondary_phone,
          address = EXCLUDED.address,
          status = EXCLUDED.status,
          updated_at = NOW();
      `, [
        id, ledgerCode, fullName, phone, normalizedPhone, secondaryPhone,
        email, address, notes, tags, status, openingBalance, outstandingBalance,
        loyaltyPoints, createdAt
      ]);

      inserted++;
    }

    await client.query('COMMIT');
    console.log(`Successfully fed ${inserted} customers into mrh_customers in Neon!`);

    const countRes = await client.query('SELECT count(*) FROM mrh_customers;');
    console.log(`Current total customers in mrh_customers: ${countRes.rows[0].count}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error feeding customers:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seedCustomers().then(() => pool.end());
}

module.exports = { seedCustomers };
