# User Model

## Overview

The User model represents user accounts in the system. It supports multiple user types (Admin, Soldier, Municipality, Organization, Business, Donor) with different roles and permissions. The model handles authentication, stores basic user information, and manages approval status for certain user types.

## Schema

```typescript
interface IUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  type:
    | "Admin"
    | "Soldier"
    | "Municipality"
    | "Organization"
    | "Business"
    | "Donor";
  approvalStatus: "approved" | "deny" | "in process";
  approvalDate?: Date;
  denialReason?: string;
  lastActive?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Fields

| Field            | Type    | Required | Description                       |
| ---------------- | ------- | -------- | --------------------------------- |
| `email`          | string  | Yes      | User's email address (unique)     |
| `password`       | string  | Yes      | Hashed password                   |
| `firstName`      | string  | Yes      | User's first name                 |
| `lastName`       | string  | Yes      | User's last name                  |
| `phone`          | string  | Yes      | Contact phone number              |
| `type`           | string  | Yes      | User type/role in the system      |
| `approvalStatus` | string  | Yes      | Current approval status           |
| `approvalDate`   | Date    | No       | When the user was approved        |
| `denialReason`   | string  | No       | Reason if approval was denied     |
| `lastActive`     | Date    | No       | Last activity timestamp           |
| `isActive`       | boolean | Yes      | Whether the account is active     |
| `createdAt`      | Date    | Yes      | When the account was created      |
| `updatedAt`      | Date    | Yes      | When the account was last updated |

### Validation Rules

- `email`: Valid email format, unique in the system
- `password`: Minimum 8 characters, includes numbers and special characters
- `firstName`: 2-50 characters
- `lastName`: 2-50 characters
- `phone`: Valid phone number format
- `type`: Must be one of the defined user types
- `approvalStatus`: Must be one of: approved, deny, in process

### Indexes

- `email`: Unique index for login
- `type`: For finding users by type
- `approvalStatus`: For filtering by status
- Compound indexes:
  - `[type, approvalStatus]`: For finding users by type and status
  - `[isActive, type]`: For finding active users of a type
  - `[lastActive]`: For activity tracking

### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "john.doe@example.com",
  "password": "$2b$10$...", // Hashed password
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+972501234567",
  "type": "Soldier",
  "approvalStatus": "approved",
  "approvalDate": "2024-01-01T00:00:00.000Z",
  "lastActive": "2024-01-02T12:00:00.000Z",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Methods

### Instance Methods

```typescript
// Check if password matches
user.comparePassword(candidatePassword: string): Promise<boolean>

// Generate JWT token
user.generateAuthToken(): string

// Update last active timestamp
user.updateLastActive(): Promise<void>
```

### Static Methods

```typescript
// Find user by email
UserModel.findByEmail(email: string): Promise<IUser>

// Find users by type and status
UserModel.findByTypeAndStatus(type: string, status: string): Promise<IUser[]>
```

## Pre-save Middleware

The model includes middleware to:

1. Hash passwords before saving
2. Validate email uniqueness
3. Set default values for new users
4. Format phone numbers
5. Perform data sanitization

## Security Considerations

1. Passwords are hashed using bcrypt
2. Sensitive fields are excluded from JSON responses
3. Email verification is required for registration
4. Approval is required for certain user types
5. Password reset tokens are time-limited
6. Rate limiting is implemented for authentication attempts
7. Session management includes token expiration
8. Phone numbers are validated and formatted
9. Input sanitization prevents XSS attacks
10. Activity tracking helps detect suspicious behavior
