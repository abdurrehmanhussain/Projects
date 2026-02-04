import { BaseCRUD } from './base-crud';
import { User, CreateUserInput, UpdateUserInput } from '../models/user.model';

/**
 * UserCRUD - CRUD operations specific to the User entity
 *
 * Extends BaseCRUD with user-specific functionality.
 * Use this as a template for creating CRUD classes for other entities.
 */
export class UserCRUD extends BaseCRUD<User> {
  constructor() {
    super('users');
  }

  /**
   * Create a new user
   * @param input - User creation data
   * @returns The created user
   */
  async createUser(input: CreateUserInput): Promise<User> {
    return this.create(input);
  }

  /**
   * Find a user by email
   * @param email - User's email address
   * @returns The user or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    const users = await this.findByField('email', email);
    return users[0] || null;
  }

  /**
   * Update a user
   * @param id - User ID
   * @param input - Fields to update
   * @returns The updated user or null if not found
   */
  async updateUser(id: number, input: UpdateUserInput): Promise<User | null> {
    return this.update(id, input);
  }

  /**
   * Check if an email already exists
   * @param email - Email to check
   * @returns True if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }

  /**
   * Search users by name (partial match)
   * @param searchTerm - Name to search for
   * @returns Array of matching users
   */
  async searchByName(searchTerm: string): Promise<User[]> {
    const query = `
      SELECT * FROM users
      WHERE name ILIKE $1
      ORDER BY name
    `;
    const result = await this.executeQuery<User>(query, [`%${searchTerm}%`]);
    return result.rows;
  }
}

// Export singleton instance for convenience
export const userCRUD = new UserCRUD();
export default userCRUD;
