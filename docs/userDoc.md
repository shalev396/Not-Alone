# User API Documentation

## User Registration and Approval Process

The system implements a secure registration process with admin approval. Here's the complete flow:

### 1. Initial Registration

1. User submits registration details to `/api/users/register`
   - Provides personal information (name, email, password, etc.)
   - Account is created with `approvalStatus: "pending"`
   - User receives their `user_id`

### 2. Pending Status

1. User can check their registration status using `/api/users/pending/:id`
   - Uses the `user_id` received during registration
   - Shows current status and basic profile information
   - No authentication required for this endpoint

### 3. Admin Approval

1. Admin logs in using their credentials
2. Views all pending registrations at `/api/users/pending`
3. For each pending user, admin can:
   - Approve the user (`POST /api/users/approve/:id`)
   - Deny the user (`POST /api/users/deny/:id`) with a reason

### 4. User Access

1. Once approved:
   - User can log in using `/api/users/login`
   - Receives JWT token for authentication
   - Gets full access to protected endpoints
2. If denied:
   - User can see denial reason via pending status endpoint
   - May need to register again with corrected information

### 5. Protected Access

After successful login, user must:

1. Include JWT token in all requests: `Authorization: Bearer <token>`
2. Can now access all endpoints allowed for their user type
3. Token expires after 24 hours, requiring re-login

### Status Codes Summary

- 201: Successful registration
- 200: Successful operation
- 400: Invalid input
- 401: Authentication failed
- 403: Not approved/authorized
- 404: Resource not found
- 500: Server error

This document provides detailed information about the User API endpoints.

## Table of Contents

- [Public Endpoints](#public-endpoints)
  - [User Registration](#user-registration)
  - [User Login](#user-login)
  - [Get Pending User](#get-pending-user)
- [Protected Endpoints](#protected-endpoints)
  - [Get Current User](#get-current-user)
  - [Update Current User](#update-current-user)
  - [Get All Users](#get-all-users)
  - [Get User by ID](#get-user-by-id)
  - [Update User](#update-user)
  - [Delete User](#delete-user)
- [Admin Approval Endpoints](#admin-approval-endpoints)
  - [Get Pending Users](#get-pending-users)
  - [Approve User](#approve-user)
  - [Deny User](#deny-user)

## Public Endpoints

### User Registration

Register a new user account.

**URL**: `/api/users/register`  
**Method**: `POST`  
**Auth required**: No

**Request Body**:

```json
{
  "firstName": "string",
  "lastName": "string",
  "passport": "string",
  "email": "string",
  "password": "string",
  "phone": "string",
  "type": "string"
}
```

**Body Parameters**:

- `firstName` (required): User's first name
- `lastName` (required): User's last name
- `passport` (required): Unique passport number
- `email` (required): Valid email address
- `password` (required): Password (minimum 6 characters)
- `phone` (required): Valid phone number
- `type` (required): User type (one of: "Soldier", "Municipality", "Donor", "Organization", "Business", "Admin")

**Success Response**:

- **Code**: 201
- **Content**:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "type": "Soldier",
  "approvalStatus": "pending",
  "nickname": "",
  "bio": "",
  "profileImage": "",
  "receiveNotifications": false,
  "_id": "user_id",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:

- **Code**: 400
  - Invalid email format
  - Password too short
  - Invalid phone format
  - User already exists (email/phone/passport)
  - Invalid user type
  - Missing required fields
- **Code**: 500
  - Server error

### User Login

Authenticate a user and get access token.

**URL**: `/api/users/login`  
**Method**: `POST`  
**Auth required**: No

**Request Body**:

```json
{
  "email": "string",
  "password": "string"
}
```

**Success Response**:

- **Code**: 200
- **Content**:

```json
{
  "token": "jwt_token_string",
  "user": {
    "id": "user_id",
    "email": "john@example.com",
    "type": "Soldier",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "nickname": "Johnny",
    "receiveNotifications": false
  }
}
```

**Error Responses**:

- **Code**: 400
  - Invalid email format
  - Missing email or password
- **Code**: 401
  - Invalid credentials
- **Code**: 403
  - Invalid user type
- **Code**: 500
  - Server error

### Get Pending User

Get details of a pending user registration.

**URL**: `/api/users/pending/:id`  
**Method**: `GET`  
**Auth required**: No

**URL Parameters**:

- `id`: User ID

**Success Response**:

- **Code**: 200
- **Content**:

```json
{
  "_id": "user_id",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "type": "Soldier",
  "approvalStatus": "pending",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:

- **Code**: 400
  - Invalid user ID format
- **Code**: 404
  - Pending user not found
- **Code**: 500
  - Server error

## Protected Endpoints

All protected endpoints require a valid JWT token in the Authorization header:  
`Authorization: Bearer <token>`

### Get Current User

Get the currently authenticated user's profile.

**URL**: `/api/users/me`  
**Method**: `GET`  
**Auth required**: Yes

**Success Response**:

- **Code**: 200
- **Content**:

```json
{
  "_id": "user_id",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "type": "Soldier",
  "nickname": "Johnny",
  "bio": "About me",
  "profileImage": "image_url",
  "receiveNotifications": false,
  "approvalStatus": "approved",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:

- **Code**: 400
  - Invalid user ID format
- **Code**: 401
  - No token provided
  - Invalid token
  - User type mismatch
- **Code**: 403
  - Account not approved
- **Code**: 404
  - User not found
- **Code**: 500
  - Server error

### Update Current User

Update the currently authenticated user's profile.

**URL**: `/api/users/me`  
**Method**: `PUT`  
**Auth required**: Yes

**Request Body**:

```json
{
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "nickname": "string",
  "bio": "string",
  "profileImage": "string",
  "receiveNotifications": boolean
}
```

**Body Parameters** (all optional):

- `firstName`: New first name
- `lastName`: New last name
- `phone`: New phone number
- `nickname`: New nickname
- `bio`: New bio text
- `profileImage`: New profile image URL
- `receiveNotifications`: Notification preferences

**Success Response**:

- **Code**: 200
- **Content**: Updated user object (same format as Get Current User)

**Error Responses**:

- **Code**: 400
  - Invalid phone format
  - Phone number already in use
  - Validation errors
- **Code**: 401
  - Authentication errors
- **Code**: 403
  - Account not approved
- **Code**: 404
  - User not found
- **Code**: 500
  - Server error

### Get All Users

Get a paginated list of all users (Admin only).

**URL**: `/api/users/all`  
**Method**: `GET`  
**Auth required**: Yes (Admin only)

**Query Parameters**:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `type` (optional): Filter by user type
- `search` (optional): Search in firstName, lastName, email

**Success Response**:

- **Code**: 200
- **Content**:

```json
{
  "users": [
    {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "type": "Soldier",
      "approvalStatus": "approved"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "pages": 10,
    "hasMore": true
  }
}
```

**Error Responses**:

- **Code**: 401
  - Authentication errors
- **Code**: 403
  - Not an admin
- **Code**: 500
  - Server error

## Admin Approval Endpoints

These endpoints are only accessible to admin users.

### Get Pending Users

Get a list of all pending user registrations.

**URL**: `/api/users/pending`  
**Method**: `GET`  
**Auth required**: Yes (Admin only)

**Success Response**:

- **Code**: 200
- **Content**:

```json
[
  {
    "_id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "type": "Soldier",
    "approvalStatus": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Error Responses**:

- **Code**: 401
  - Authentication errors
- **Code**: 403
  - Not an admin
- **Code**: 500
  - Server error

### Approve User

Approve a pending user registration.

**URL**: `/api/users/approve/:id`  
**Method**: `POST`  
**Auth required**: Yes (Admin only)

**URL Parameters**:

- `id`: User ID to approve

**Success Response**:

- **Code**: 200
- **Content**: Updated user object with approvalStatus: "approved"

**Error Responses**:

- **Code**: 400
  - Invalid user ID format
- **Code**: 401
  - Authentication errors
- **Code**: 403
  - Not an admin
- **Code**: 404
  - Pending user not found
- **Code**: 500
  - Server error

### Deny User

Deny a pending user registration.

**URL**: `/api/users/deny/:id`  
**Method**: `POST`  
**Auth required**: Yes (Admin only)

**URL Parameters**:

- `id`: User ID to deny

**Request Body**:

```json
{
  "reason": "string"
}
```

**Body Parameters**:

- `reason` (required): Reason for denial

**Success Response**:

- **Code**: 200
- **Content**: Updated user object with approvalStatus: "denied"

**Error Responses**:

- **Code**: 400
  - Invalid user ID format
  - Denial reason is required
- **Code**: 401
  - Authentication errors
- **Code**: 403
  - Not an admin
- **Code**: 404
  - Pending user not found
- **Code**: 500
  - Server error

## General Error Responses

All endpoints may return these errors:

**Authentication Error**:

```json
{
  "error": "No token provided"
}
```

or

```json
{
  "error": "Invalid token"
}
```

**Authorization Error**:

```json
{
  "error": "Access denied",
  "message": "This route requires one of these roles: Admin"
}
```

**Validation Error**:

```json
{
  "message": "Validation error",
  "errors": ["Error message 1", "Error message 2"]
}
```

**Server Error**:

```json
{
  "message": "Error message",
  "error": "Detailed error in development mode"
}
```
