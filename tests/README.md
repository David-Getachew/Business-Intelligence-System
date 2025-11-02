# Integration Tests

This directory contains integration tests that verify the complete data flow from frontend to Supabase backend.

## Setup

### 1. Install Test Dependencies

```bash
npm install --save-dev @jest/globals jest ts-jest @types/jest
```

### 2. Configure Jest

Create `jest.config.js` in project root:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

### 3. Create Test Environment

Create `.env.test` with test Supabase credentials:

```env
VITE_PUBLIC_SUPABASE_URL=https://your-test-project.supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=your-test-anon-key
```

### 4. Set Up Test Data

Before running tests, ensure your test database has:

- At least one test user (email: test@example.com, password: testpassword123)
- Test ingredients in `ingredients` table
- Test menu items in `menu_items` table
- Initial inventory records in `inventory_on_hand` table

You can use the following SQL to create test data:

```sql
-- Create test user profile (after creating auth user via dashboard)
INSERT INTO profiles (id, email, full_name, role)
VALUES ('test-user-uuid', 'test@example.com', 'Test User', 'owner');

-- Create test ingredients
INSERT INTO ingredients (id, name, unit, reorder_point, supplier)
VALUES
  ('ing-1', 'Beef Patty', 'kg', 5, 'Local Supplier'),
  ('ing-2', 'Burger Bun', 'pcs', 20, 'Bakery Co');

-- Initialize inventory
INSERT INTO inventory_on_hand (ingredient_id, current_qty)
VALUES
  ('ing-1', 50),
  ('ing-2', 100);

-- Create test menu item
INSERT INTO menu_items (id, name, price, category, active)
VALUES ('menu-1', 'Test Burger', 9.99, 'Burgers', true);

-- Create recipe
INSERT INTO recipe_ingredients (menu_item_id, ingredient_id, qty_per_item)
VALUES
  ('menu-1', 'ing-1', 0.15),
  ('menu-1', 'ing-2', 1);
```

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- tests/integration.test.ts

# Run in watch mode
npm test -- --watch
```

## Test Coverage

The integration tests cover:

1. **Authentication**
   - Sign in with credentials
   - Profile fetching
   - Session management

2. **Sales Processing**
   - Sale submission via RPC
   - Inventory deduction
   - COGS calculation
   - Insufficient stock handling

3. **Purchase Management**
   - Purchase insertion
   - Automatic inventory updates via triggers

4. **Expense Tracking**
   - Expense record creation
   - Category validation

5. **Menu Item Management**
   - Menu item creation/update
   - Recipe ingredients management

6. **Inventory Operations**
   - Inventory fetching with joins
   - Manual adjustments
   - Movement tracking

7. **Reporting**
   - Daily summaries queries
   - Date range filtering

8. **Security (RLS)**
   - Unauthenticated access blocking
   - Role-based access control

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
        env:
          VITE_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          VITE_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
```

## Notes

- Always use a separate test database/project
- Clean up test data after test runs if needed
- Mock external services (n8n, Google Drive) in tests
- Tests assume RLS policies and triggers are deployed

