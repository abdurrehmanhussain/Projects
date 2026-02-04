import { QueryResult } from 'pg';
import { db } from '../db/connection';

/**
 * BaseCRUD - Generic CRUD operations class
 *
 * Provides reusable Create, Read, Update, Delete operations
 * that can be extended for specific entities.
 *
 * @template T - The entity type
 */
export class BaseCRUD<T> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * CREATE - Insert a new record into the database
   * @param data - Object containing the fields to insert
   * @returns The created record
   */
  async create(data: Partial<T>): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const columns = keys.join(', ');

    const query = `
      INSERT INTO ${this.tableName} (${columns})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await db.query<T>(query, values);
    return result.rows[0];
  }

  /**
   * READ - Get all records from the table
   * @param limit - Maximum number of records to return (optional)
   * @param offset - Number of records to skip (optional)
   * @returns Array of records
   */
  async findAll(limit?: number, offset?: number): Promise<T[]> {
    let query = `SELECT * FROM ${this.tableName}`;
    const params: any[] = [];

    if (limit !== undefined) {
      params.push(limit);
      query += ` LIMIT $${params.length}`;
    }

    if (offset !== undefined) {
      params.push(offset);
      query += ` OFFSET $${params.length}`;
    }

    const result = await db.query<T>(query, params);
    return result.rows;
  }

  /**
   * READ - Find a single record by ID
   * @param id - The record ID
   * @returns The record or null if not found
   */
  async findById(id: number): Promise<T | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
    const result = await db.query<T>(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * READ - Find records by a specific field value
   * @param field - The field name to search by
   * @param value - The value to match
   * @returns Array of matching records
   */
  async findByField(field: string, value: any): Promise<T[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE ${field} = $1`;
    const result = await db.query<T>(query, [value]);
    return result.rows;
  }

  /**
   * UPDATE - Update a record by ID
   * @param id - The record ID
   * @param data - Object containing the fields to update
   * @returns The updated record or null if not found
   */
  async update(id: number, data: Partial<T>): Promise<T | null> {
    const keys = Object.keys(data);
    const values = Object.values(data);

    if (keys.length === 0) {
      return this.findById(id);
    }

    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const query = `
      UPDATE ${this.tableName}
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${keys.length + 1}
      RETURNING *
    `;

    const result = await db.query<T>(query, [...values, id]);
    return result.rows[0] || null;
  }

  /**
   * DELETE - Delete a record by ID
   * @param id - The record ID
   * @returns True if deleted, false if not found
   */
  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING id`;
    const result = await db.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * DELETE - Delete all records from the table
   * Use with caution!
   * @returns Number of deleted records
   */
  async deleteAll(): Promise<number> {
    const query = `DELETE FROM ${this.tableName}`;
    const result = await db.query(query);
    return result.rowCount || 0;
  }

  /**
   * COUNT - Get total number of records
   * @returns Total count
   */
  async count(): Promise<number> {
    const query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const result = await db.query<{ count: string }>(query);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Execute a custom query
   * @param query - SQL query string
   * @param params - Query parameters
   * @returns Query result
   */
  async executeQuery<R = T>(query: string, params?: any[]): Promise<QueryResult<R>> {
    return db.query<R>(query, params);
  }
}

export default BaseCRUD;
