# Authentication Testing Documentation

## Overview

The `auth.test.ts` file implements comprehensive testing of the API's authentication and authorization mechanisms. It verifies that different user types can only access their permitted routes and that unauthorized access is properly prevented.

## Table of Contents

- [Test Setup](#test-setup)
- [User Types](#user-types)
- [Test Scenarios](#test-scenarios)
- [Route Testing](#route-testing)
- [Authorization Testing](#authorization-testing)
- [Test Cleanup](#test-cleanup)

## Test Setup

### Database Connection

```typescript
beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI_TEST);
});
```

The test suite connects to a dedicated test database to avoid interfering with production data.

### User Creation

The test suite creates test users of various types:

- Admin
- Soldier
- Municipality
- Donor
- Organization
- Business

Each user is:

1. Registered via `/api/auth/register`
2. Approved by an admin (except admin who is auto-approved)
3. Logged in to obtain an authentication token
4. Stored in a users.json file for subsequent tests

## User Types

The system supports the following user types, each with different permissions:

- **Admin**: Full system access
- **Soldier**: Access to soldier-specific features
- **Municipality**: City management features
- **Donor**: Donation-related features
- **Organization**: Organization-specific features
- **Business**: Business-related features

## Test Scenarios

### Authentication Tests

The test suite verifies:

1. **Registration**

   - All user types can register
   - Required fields are validated
   - Duplicate emails are rejected

2. **Login**
   - Users can login with correct credentials
   - Invalid credentials are rejected
   - Tokens are properly generated

### Authorization Tests

For each API route, the test suite verifies:

1. **Allowed Access**

   - Permitted user types can access the route
   - Correct HTTP status codes are returned (200, 201, 202, 204)
   - Invalid requests return 400
   - Non-existent resources return 404

2. **Denied Access**
   - Non-permitted user types cannot access the route
   - Unauthorized access returns 401 or 403
   - Invalid tokens are rejected

## Route Testing

The test suite uses a route configuration system that defines:

```typescript
type route = {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: Record<string, any>;
  query?: string[];
  params?: string;
  auth: boolean;
  allowedTypes: types[];
};
```

### Example Route Configuration

```typescript
{
  path: "/api/auth/register",
  method: "POST",
  auth: false,
  allowedTypes: ["Admin", "Soldier", "Municipality", "Donor", "Organization", "Business"],
  body: {
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    password: "Test123!@#",
    type: "Soldier"
  }
}
```

## Authorization Testing

For each route, the test suite:

1. Tests allowed user types:

```typescript
test.each(route.allowedTypes)(
  "should allow access for %s",
  async (userType) => {
    // Verify successful access
    expect([200, 201, 202, 204, 400, 404]).toContain(response.status);
  }
);
```

2. Tests denied user types:

```typescript
test.each(nonAllowedTypes)("should deny access for %s", async (userType) => {
  // Verify access is denied
  expect([401, 403]).toContain(response.status);
});
```

## Test Cleanup

After all tests complete:

1. User data is cleared:

```typescript
afterAll(async () => {
  await clearUsers();
  await mongoose.connection.close();
});
```

2. The database connection is closed
3. Temporary test files are removed

## Common Test Patterns

### Token Verification

```typescript
if (route.auth) {
  req = req.set("Authorization", `Bearer ${user.token}`);
}
```

### Parameter Substitution

```typescript
if (route.params) {
  path = path.split(`:${route.params}`).join(actualId);
}
```

### Request Body Generation

```typescript
if (route.body) {
  const bodyData =
    typeof route.body === "function" ? route.body(userType) : { ...route.body };
  req = req.send(bodyData);
}
```
