# City Tests Documentation

## Test Setup Requirements

Before running the tests, ensure:

1. MongoDB is running locally (default: mongodb://localhost:27017)
2. Environment variables are set up (use `.env.test`):
   - `MONGODB_URI_TEST`: Test database URI
   - `JWT_SECRET`: Secret key for JWT tokens
   - `PASSWORD_KEY`: Key for password encryption

## Test Files Structure

The city tests are located in:

- `tests/citys/city.test.ts`: All city-related functionality tests

## Test Categories

### Public City Access

#### Get All Cities

1. **List Approved Cities**

   - Tests: Retrieving all approved cities
   - Expected: 200 status, array of cities with basic info
   - Common Failures: Filter issues, sensitive data exposure
   - Required Setup: Cities with various approval statuses

2. **Empty Cities List**
   - Tests: Response when no cities exist
   - Expected: 200 status, empty array
   - Common Failures: Null handling

### City Creation (`POST /api/cities`)

1. **Admin Creates City**

   - Tests: Admin creating a new city
   - Expected: 201 status, city object in response
   - Common Failures: Validation errors, permission issues
   - Required Setup: Admin user and token

2. **Municipality Creates City**

   - Tests: Municipality user creating a city
   - Expected: 201 status, city object in response
   - Common Failures: Permission issues
   - Required Setup: Municipality user and token

3. **Invalid Zone**

   - Tests: Creating city with invalid zone
   - Expected: 400 status, validation error
   - Common Failures: Enum validation bypass

4. **Duplicate City Name**
   - Tests: Creating city with existing name
   - Expected: 400 status, duplicate error
   - Common Failures: Unique index issues

### City Joining

#### Municipality Join (`POST /api/cities/:cityId/join/municipality`)

1. **Successful Join**

   - Tests: Municipality user joining a city
   - Expected: 200 status, updated city data
   - Common Failures: Array update issues
   - Required Setup: Approved city, municipality user

2. **Already Joined**

   - Tests: Municipality user joining when already in a city
   - Expected: 400 status, error message
   - Common Failures: Duplicate check issues

3. **Invalid User Type**
   - Tests: Non-municipality user attempting to join
   - Expected: 403 status
   - Common Failures: Permission bypass

#### Soldier Join (`POST /api/cities/:cityId/join/soldier`)

1. **Successful Join**

   - Tests: Soldier joining a city
   - Expected: 200 status, updated city data
   - Common Failures: Array update issues
   - Required Setup: Approved city, soldier user

2. **Unapproved City**

   - Tests: Joining an unapproved city
   - Expected: 400 status, error message
   - Common Failures: Status check bypass

3. **Invalid User Type**
   - Tests: Non-soldier user attempting to join
   - Expected: 403 status
   - Common Failures: Permission bypass

### City Management

#### Update City (`PATCH /api/cities/:cityId`)

1. **Admin Update**

   - Tests: Admin updating city details
   - Expected: 200 status, updated city data
   - Common Failures: Validation errors
   - Required Setup: Admin user and city

2. **Municipality Update**

   - Tests: Municipality user updating their city
   - Expected: 200 status, updated city data
   - Common Failures: Permission issues
   - Required Setup: Municipality user in city

3. **Invalid Updates**
   - Tests: Invalid zone or empty required fields
   - Expected: 400 status, validation errors
   - Common Failures: Validation bypass

#### City Approval Management

1. **Admin Approves City**

   - Tests: Admin approving a pending city
   - Expected: 200 status, updated approval status
   - Common Failures: Status transition issues
   - Required Setup: Pending city

2. **Admin Denies City**

   - Tests: Admin denying a city with reason
   - Expected: 200 status, updated status and reason
   - Common Failures: Missing denial reason
   - Required Setup: Pending city

3. **Non-admin Approval Attempt**
   - Tests: Non-admin attempting to approve/deny
   - Expected: 403 status
   - Common Failures: Permission bypass

#### City Deletion

1. **Admin Delete**

   - Tests: Admin deleting a city
   - Expected: 200 status, success message
   - Common Failures: Cascade deletion issues
   - Required Setup: City to delete

2. **Unauthorized Delete**
   - Tests: Non-admin attempting deletion
   - Expected: 403 status
   - Common Failures: Permission bypass

## Common Test Issues

1. **Database State**

   - Issue: Tests failing due to leftover data
   - Solution: Ensure proper cleanup in `beforeEach` and `afterAll`

2. **User Permissions**

   - Issue: Incorrect access based on user type
   - Solution: Verify user types and permissions

3. **City Status Transitions**

   - Issue: Invalid status changes
   - Solution: Verify status flow and validation

4. **Array Operations**
   - Issue: Issues with adding/removing users from arrays
   - Solution: Check array update operations and duplicates

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test tests/citys/city.test.ts
```

## Debugging Failed Tests

1. Check database connection and state
2. Verify user permissions and types
3. Ensure proper city setup in `beforeEach`
4. Check array operations for user lists
5. Verify status transitions and validation rules
