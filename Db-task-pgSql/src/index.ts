/**
 * DB-Task Module Entry Point
 *
 * Exports all database-related functionality for easy imports.
 */

// Database connection
export { db, default as DatabaseConnection } from './db/connection';

// Configuration
export { getDatabaseConfig, DatabaseConfig } from './config/database.config';

// CRUD operations
export { BaseCRUD } from './crud/base-crud';
export { UserCRUD, userCRUD } from './crud/user-crud';

// Models
export { User, CreateUserInput, UpdateUserInput } from './models/user.model';
