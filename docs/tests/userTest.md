# User Tests Documentation

## Test Setup Requirements

Before running the tests, ensure:

1. MongoDB is running locally (default: mongodb://localhost:27017)
2. Environment variables are set up (use `.env.test`):
   - `MONGODB_URI_TEST`: Test database URI
   - `JWT_SECRET`: Secret key for JWT tokens
   - `PASSWORD_KEY`: Key for password encryption

## Test Files Structure

The user tests are split into three main files:

- `tests/users/auth.test.ts`: Authentication-related tests
- `tests/users/user.test.ts`: User profile and management tests
- `tests/users/admin.test.ts`: Admin-specific functionality tests

## Test Categories

### Authentication Tests (`auth.test.ts`)

#### Registration Tests

1. **Successful Registration**

   - Tests: Creating a new user with valid data
   - Expected: 201 status, user object in response
   - Common Failures: Database connection, validation errors

2. **Invalid Email Format**

   - Tests: Registration with malformed email
   - Expected: 400 status, validation error
   - Common Failures: Email validation not working

3. **Weak Password**

   - Tests: Registration with insufficient password
   - Expected: 400 status, password requirements error
   - Common Failures: Password validation bypass

4. **Duplicate Email**
   - Tests: Registration with existing email
   - Expected: 400 status, duplicate user error
   - Common Failures: Race conditions, unique index issues

#### Login Tests

1. **Successful Login**

   - Tests: Login with valid credentials
   - Expected: 200 status, JWT token and user data
   - Common Failures: Token generation, password comparison

2. **Invalid Credentials**

   - Tests: Login with wrong password
   - Expected: 403 status, error message
   - Common Failures: Error message leakage

3. **Non-existent User**
   - Tests: Login with unknown email
   - Expected: 403 status, error message
   - Common Failures: Different error codes for non-existent users

### User Profile Tests (`user.test.ts`)

#### Get Current User Profile

1. **Successful Profile Retrieval**

   - Tests: Getting authenticated user's profile
   - Expected: 200 status, user data
   - Common Failures: Token validation, user not found
   - Required Setup: Valid user and token in database

2. **Unauthorized Access**
   - Tests: Access without token
   - Expected: 401 status
   - Common Failures: Middleware bypass

#### Update Current User

1. **Successful Update**

   - Tests: Updating user's own profile
   - Expected: 200 status, updated user data
   - Common Failures: Validation errors, field restrictions
   - Required Setup: Valid user and token

2. **Invalid Phone Format**

   - Tests: Update with invalid phone number
   - Expected: 400 status, validation error
   - Common Failures: Phone validation bypass

3. **Unauthorized Update**
   - Tests: Update without token
   - Expected: 401 status
   - Common Failures: Authorization bypass

#### Get User by ID

1. **Admin Access**

   - Tests: Admin retrieving other user's profile
   - Expected: 200 status, user data
   - Common Failures: Permission issues, token validation
   - Required Setup: Admin user and token

2. **Invalid User ID**
   - Tests: Accessing non-existent user
   - Expected: 400 status for invalid format, 404 for not found
   - Common Failures: Error handling inconsistency

### Admin Tests (`admin.test.ts`)

#### Get All Users

1. **Admin List Access**

   - Tests: Admin retrieving all users
   - Expected: 200 status, users array
   - Common Failures: Permission issues
   - Required Setup: Admin user and token

2. **Non-admin Access**
   - Tests: Regular user attempting to list all users
   - Expected: 403 status
   - Common Failures: Permission bypass

#### Pending Users Management

1. **List Pending Users**

   - Tests: Admin viewing pending registrations
   - Expected: 200 status, pending users array
   - Common Failures: Filter issues
   - Required Setup: Users with pending status

2. **Approve User**

   - Tests: Admin approving registration
   - Expected: 200 status, updated user status
   - Common Failures: Status update issues
   - Required Setup: Pending user in database

3. **Deny User**
   - Tests: Admin denying registration
   - Expected: 200 status, updated user status
   - Common Failures: Missing denial reason
   - Required Setup: Pending user in database

#### User Deletion

1. **Admin Delete**

   - Tests: Admin deleting user
   - Expected: 200 status, success message
   - Common Failures: Cascade deletion issues
   - Required Setup: User to delete

2. **Unauthorized Delete**
   - Tests: Non-admin attempting deletion
   - Expected: 403 status
   - Common Failures: Permission bypass

## Common Test Issues

1. **Database State**

   - Issue: Tests failing due to leftover data
   - Solution: Ensure proper cleanup in `beforeEach` and `afterAll`

2. **Token Generation**

   - Issue: Invalid or expired tokens
   - Solution: Check JWT secret and expiration settings

3. **User Types**

   - Issue: Permission issues due to wrong user type
   - Solution: Verify user type matches token claims

4. **Validation Rules**
   - Issue: Inconsistent validation between tests and implementation
   - Solution: Sync validation rules across codebase

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test tests/users/auth.test.ts
```

## Debugging Failed Tests

1. Check database connection and state
2. Verify environment variables
3. Ensure proper user setup in `beforeEach`
4. Check token generation and validation
5. Compare expected vs actual response formats
