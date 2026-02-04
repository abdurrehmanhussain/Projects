# DB-Task: PostgreSQL CRUD Operations

This module implements CRUD (Create, Read, Update, Delete) operations using PostgreSQL, integrated with a Playwright testing framework.

## Project Structure

```
db-task/
├── src/
│   ├── config/
│   │   └── database.config.ts    # Database configuration
│   ├── crud/
│   │   ├── base-crud.ts          # Generic CRUD operations
│   │   └── user-crud.ts          # User-specific CRUD operations
│   ├── db/
│   │   └── connection.ts         # Database connection manager
│   ├── models/
│   │   └── user.model.ts         # User entity model
│   ├── index.ts                  # Module exports
│   └── seed.ts                   # Database seeding script
├── tests/
│   └── crud.spec.ts              # Playwright tests for CRUD
├── .env.example                  # Environment variables template
├── package.json
├── playwright.config.ts
└── tsconfig.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd db-task
npm install
```

### 2. Configure Database Connection

Copy the example environment file and update with your PostgreSQL credentials:

```bash
cp .env.example .env
```

Edit `.env` with your database connection details:

```env
# Option 1: Connection String (recommended)
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/mydatabase

# Option 2: Individual Parameters
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=mypassword
DB_NAME=mydatabase
```

### 3. Create Database Tables

Run the seed script to create tables and optionally add sample data:

```bash
npm run db:seed
```

### 4. Run Tests

Execute the CRUD tests:

```bash
npm run test:crud
```

## CRUD Operations Reference

### BaseCRUD Class

The `BaseCRUD` class provides generic operations that work with any table:

| Method | Description |
|--------|-------------|
| `create(data)` | Insert a new record |
| `findAll(limit?, offset?)` | Get all records with optional pagination |
| `findById(id)` | Find a single record by ID |
| `findByField(field, value)` | Find records by field value |
| `update(id, data)` | Update a record |
| `delete(id)` | Delete a record |
| `deleteAll()` | Delete all records |
| `count()` | Count total records |
| `executeQuery(query, params)` | Execute custom SQL |

### UserCRUD Class

Extends `BaseCRUD` with user-specific methods:

| Method | Description |
|--------|-------------|
| `createUser(input)` | Create a new user |
| `findByEmail(email)` | Find user by email |
| `updateUser(id, input)` | Update user data |
| `emailExists(email)` | Check if email exists |
| `searchByName(term)` | Search users by name |

## Usage Examples

### Creating a New Entity CRUD Class

```typescript
import { BaseCRUD } from './src/crud/base-crud';

interface Product {
  id?: number;
  name: string;
  price: number;
  created_at?: Date;
}

class ProductCRUD extends BaseCRUD<Product> {
  constructor() {
    super('products'); // Table name
  }

  // Add product-specific methods
  async findByPriceRange(min: number, max: number): Promise<Product[]> {
    const query = 'SELECT * FROM products WHERE price BETWEEN $1 AND $2';
    const result = await this.executeQuery<Product>(query, [min, max]);
    return result.rows;
  }
}

export const productCRUD = new ProductCRUD();
```

### Using CRUD in Tests

```typescript
import { test, expect } from '@playwright/test';
import { db } from '../src/db/connection';
import { userCRUD } from '../src/crud/user-crud';

test('database integration example', async () => {
  await db.connect();

  // Create
  const user = await userCRUD.createUser({
    email: 'test@example.com',
    name: 'Test User'
  });

  // Read
  const found = await userCRUD.findById(user.id!);
  expect(found?.email).toBe('test@example.com');

  // Update
  const updated = await userCRUD.updateUser(user.id!, { name: 'Updated' });
  expect(updated?.name).toBe('Updated');

  // Delete
  const deleted = await userCRUD.delete(user.id!);
  expect(deleted).toBe(true);

  await db.disconnect();
});
```

## Connection String Format

```
postgresql://[user]:[password]@[host]:[port]/[database]
```

Example:
```
postgresql://postgres:mypassword@localhost:5432/mydatabase
```

## Notes

- The connection uses connection pooling for efficient resource management
- All queries use parameterized statements to prevent SQL injection
- The `updated_at` field is automatically updated on every update operation
- Tests run sequentially to avoid database conflicts
