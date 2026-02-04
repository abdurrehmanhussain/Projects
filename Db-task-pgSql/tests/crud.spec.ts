import { test, expect } from '@playwright/test';
import { db } from '../src/db/connection';
import { userCRUD } from '../src/crud/user-crud';
import { User } from '../src/models/user.model';

/**
 * CRUD Operations Test Suite
 *
 * These tests demonstrate and verify the CRUD operations
 * for the PostgreSQL database integration.
 */

test.describe('Database CRUD Operations', () => {
  // Connect to database before all tests
  test.beforeAll(async () => {
    await db.connect();

    // Ensure users table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  });

  // Clean up after all tests
  test.afterAll(async () => {
    await db.disconnect();
  });

  // Clean test data before each test
  test.beforeEach(async () => {
    // Delete test users (those with emails ending in @test.com)
    await db.query("DELETE FROM users WHERE email LIKE '%@test.com'");
  });

  test.describe('CREATE Operations', () => {
    test('should create a new user', async () => {
      const newUser = {
        email: 'abdur-rehman-hussain@test.com',
        name: 'Abdur Rehman Hussain',
      };

      const createdUser = await userCRUD.createUser(newUser);

      expect(createdUser).toBeDefined();
      expect(createdUser.id).toBeDefined();
      expect(createdUser.email).toBe(newUser.email);
      expect(createdUser.name).toBe(newUser.name);
      expect(createdUser.created_at).toBeDefined();
    });

    test('should fail when creating user with duplicate email', async () => {
      const userData = {
        email: 'duplicate-ar@test.com',
        name: 'First AR',
      };

      // Create first user
      await userCRUD.createUser(userData);

      // Try to create duplicate (same email should fail)
      await expect(userCRUD.createUser({
        email: 'duplicate-ar@test.com',
        name: 'Second AR',
      })).rejects.toThrow();
    });
  });

  test.describe('READ Operations', () => {
    let testUser: User;

    test.beforeEach(async () => {
      // Create a test user for read operations
      testUser = await userCRUD.createUser({
        email: 'read-ar@test.com',
        name: 'Read AR',
      });
    });

    test('should find user by ID', async () => {
      const foundUser = await userCRUD.findById(testUser.id!);

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(testUser.id);
      expect(foundUser?.email).toBe(testUser.email);
    });

    test('should find user by email', async () => {
      const foundUser = await userCRUD.findByEmail('read-ar@test.com');

      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe('read-ar@test.com');
    });

    test('should return null for non-existent ID', async () => {
      const foundUser = await userCRUD.findById(999999);
      expect(foundUser).toBeNull();
    });

    test('should find all users', async () => {
      // Create additional users
      await userCRUD.createUser({ email: 'ar-user1@test.com', name: 'AR User 1' });
      await userCRUD.createUser({ email: 'ar-user2@test.com', name: 'AR User 2' });

      const allUsers = await userCRUD.findAll();

      expect(allUsers).toBeDefined();
      expect(Array.isArray(allUsers)).toBe(true);
      expect(allUsers.length).toBeGreaterThanOrEqual(3);
    });

    test('should search users by name', async () => {
      await userCRUD.createUser({ email: 'search-ar1@test.com', name: 'Ali Rehman' });
      await userCRUD.createUser({ email: 'search-ar2@test.com', name: 'Ahmed Rehman' });

      const results = await userCRUD.searchByName('Rehman');

      expect(results.length).toBeGreaterThanOrEqual(2);
      results.forEach(user => {
        expect(user.name.toLowerCase()).toContain('rehman');
      });
    });
  });

  test.describe('UPDATE Operations', () => {
    let testUser: User;

    test.beforeEach(async () => {
      testUser = await userCRUD.createUser({
        email: 'update-ar@test.com',
        name: 'Update AR',
      });
    });

    test('should update user name', async () => {
      const updatedUser = await userCRUD.updateUser(testUser.id!, {
        name: 'Updated AR Name',
      });

      expect(updatedUser).toBeDefined();
      expect(updatedUser?.name).toBe('Updated AR Name');
      expect(updatedUser?.email).toBe(testUser.email); // Email unchanged
    });

    test('should update user email', async () => {
      const updatedUser = await userCRUD.updateUser(testUser.id!, {
        email: 'new-ar-email@test.com',
      });

      expect(updatedUser).toBeDefined();
      expect(updatedUser?.email).toBe('new-ar-email@test.com');
    });

    test('should update multiple fields', async () => {
      const updatedUser = await userCRUD.updateUser(testUser.id!, {
        email: 'multi-ar-update@test.com',
        name: 'Multi AR Update',
      });

      expect(updatedUser).toBeDefined();
      expect(updatedUser?.email).toBe('multi-ar-update@test.com');
      expect(updatedUser?.name).toBe('Multi AR Update');
    });

    test('should return null when updating non-existent user', async () => {
      const result = await userCRUD.updateUser(999999, { name: 'Ghost AR' });
      expect(result).toBeNull();
    });
  });

  test.describe('DELETE Operations', () => {
    test('should delete user by ID', async () => {
      const user = await userCRUD.createUser({
        email: 'delete-ar@test.com',
        name: 'Delete AR',
      });

      const deleted = await userCRUD.delete(user.id!);
      expect(deleted).toBe(true);

      // Verify user is deleted
      const foundUser = await userCRUD.findById(user.id!);
      expect(foundUser).toBeNull();
    });

    test('should return false when deleting non-existent user', async () => {
      const deleted = await userCRUD.delete(999999);
      expect(deleted).toBe(false);
    });

    test('should check if email exists', async () => {
      await userCRUD.createUser({
        email: 'exists-ar@test.com',
        name: 'Exists AR',
      });

      const exists = await userCRUD.emailExists('exists-ar@test.com');
      const notExists = await userCRUD.emailExists('notexists-ar@test.com');

      expect(exists).toBe(true);
      expect(notExists).toBe(false);
    });
  });

  test.describe('COUNT Operations', () => {
    test('should count users', async () => {
      const initialCount = await userCRUD.count();

      await userCRUD.createUser({ email: 'count-ar1@test.com', name: 'Count AR 1' });
      await userCRUD.createUser({ email: 'count-ar2@test.com', name: 'Count AR 2' });

      const newCount = await userCRUD.count();

      expect(newCount).toBe(initialCount + 2);
    });
  });
});
