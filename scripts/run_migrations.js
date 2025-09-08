/*
  Executes Supabase SQL migrations directly using DATABASE_URL (Postgres connection).
  Safe to run multiple times; scripts use IF EXISTS/IF NOT EXISTS where needed.
*/
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function loadDotEnvIfNeeded() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
      for (const line of lines) {
        if (!line || line.trim().startsWith('#')) continue;
        const idx = line.indexOf('=');
        if (idx === -1) continue;
        const key = line.slice(0, idx).trim();
        let val = line.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = val;
      }
    }
  } catch (_) {}
}

async function run() {
  loadDotEnvIfNeeded();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL not found. Add it to .env or env and retry.');
    process.exit(1);
  }

  const files = [
    path.resolve('supabase/migrations/20250908_programacoes_designacoes.sql'),
    path.resolve('supabase/migrations/20250908_programacoes_minimal_patch.sql'),
  ];

  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.error(`Migration file not found: ${file}`);
      process.exit(1);
    }
  }

  // Enforce SSL for Supabase
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    for (const file of files) {
      const sql = fs.readFileSync(file, 'utf8');
      console.log(`\n--- Executing: ${path.basename(file)} ---`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('COMMIT');
        console.log(`Success: ${path.basename(file)}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`Failed: ${path.basename(file)}\n`, err.message);
        process.exitCode = 1;
        break;
      }
    }
  } finally {
    try { await client.end(); } catch (_) {}
  }
}

run().catch((e) => {
  console.error('Migration runner fatal error:', e.message);
  process.exit(1);
});

