import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { getDatabaseConfig } from '../config/database.config';

/**
 * DatabaseConnection - Singleton class for managing PostgreSQL connections
 *
 * Features:
 * - Connection pooling for efficient resource management
 * - Automatic reconnection handling
 * - Query execution with parameterized queries (SQL injection protection)
 */
class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: Pool | null = null;

  private constructor() {}

  /**
   * Get the singleton instance of DatabaseConnection
   */
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Initialize the connection pool
   */
  public async connect(): Promise<void> {
    if (this.pool) {
      return;
    }

    const config = getDatabaseConfig();
    this.pool = new Pool(config);

    // Test the connection
    try {
      const client = await this.pool.connect();
      console.log('Database connected successfully');
      client.release();
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }

  /**
   * Get the connection pool
   */
  public getPool(): Pool {
    if (!this.pool) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.pool;
  }

  /**
   * Execute a query with parameters
   * @param text - SQL query string
   * @param params - Query parameters (for parameterized queries)
   */
  public async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const pool = this.getPool();
    const start = Date.now();

    try {
      const result = await pool.query<T>(text, params);
      const duration = Date.now() - start;
      console.log('Query executed', { text: text.substring(0, 50), duration, rows: result.rowCount });
      return result;
    } catch (error) {
      console.error('Query error:', { text, error });
      throw error;
    }
  }

  /**
   * Get a client from the pool for transactions
   */
  public async getClient(): Promise<PoolClient> {
    const pool = this.getPool();
    return pool.connect();
  }

  /**
   * Close all connections in the pool
   */
  public async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('Database disconnected');
    }
  }
}

export const db = DatabaseConnection.getInstance();
export default db;
