/**
 * User Model - Represents the user entity in the database
 *
 * This is an example model that demonstrates the structure
 * for database entities. Modify or create new models as needed.
 */

export interface User {
  id?: number;
  email: string;
  name: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateUserInput {
  email: string;
  name: string;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
}
