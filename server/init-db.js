import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new pg.Pool({
  connectionString: "postgresql://postgres:postgres@localhost:5433/nexus_crm"
});

async function init() {
  try {
    console.log('Reading schema.sql...');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    console.log('Executing schema...');
    await client.query(schema);
    
    console.log('Database initialized successfully!');
    client.release();
  } catch (err) {
    if (err instanceof Error) {
      console.error('Initialization failed:', err.message);
    } else {
      console.error('Initialization failed:', err);
    }
  } finally {
    await pool.end();
  }
}

init();
