/**
 * Database Seed Script
 *
 * Creates the necessary tables and optionally seeds them with sample data.
 * Run with: npm run db:seed
 */

import { db } from './db/connection';

async function createTables(): Promise<void> {
  console.log('Creating tables...');

  // Create users table
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Tables created successfully');
}

async function seedData(): Promise<void> {
  console.log('Seeding sample data...');

  // Check if data already exists
  const result = await db.query('SELECT COUNT(*) as count FROM users');
  const count = parseInt(result.rows[0].count, 10);

  if (count > 0) {
    console.log(`Users table already has ${count} records. Skipping seed.`);
    return;
  }

  // Insert sample users
  const sampleUsers = [
    { email: 'john.doe@example.com', name: 'John Doe' },
    { email: 'jane.smith@example.com', name: 'Jane Smith' },
    { email: 'bob.wilson@example.com', name: 'Bob Wilson' },
  ];

  for (const user of sampleUsers) {
    await db.query(
      'INSERT INTO users (email, name) VALUES ($1, $2)',
      [user.email, user.name]
    );
  }

  console.log(`Seeded ${sampleUsers.length} sample users`);
}

async function main(): Promise<void> {
  try {
    await db.connect();
    await createTables();
    await seedData();
    console.log('Database setup complete!');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await db.disconnect();
  }
}

main();
