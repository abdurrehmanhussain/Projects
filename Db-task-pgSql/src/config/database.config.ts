import * as dotenv from 'dotenv';
import { PoolConfig } from 'pg';

// Load environment variables
dotenv.config();

/**
 * Database Configuration
 *
 * Supports two methods of configuration:
 * 1. Using a connection string (DATABASE_URL)
 * 2. Using individual parameters (DB_HOST, DB_PORT, etc.)
 */
export interface DatabaseConfig extends PoolConfig {
  connectionString?: string;
}

export const getDatabaseConfig = (): DatabaseConfig => {
  // Prefer connection string if available
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    };
  }

  // Fall back to individual parameters
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'mypassword',
    database: process.env.DB_NAME || 'mydatabase',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };
};

export default getDatabaseConfig;
