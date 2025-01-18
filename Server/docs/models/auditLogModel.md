# AuditLog Model

## Overview

The AuditLog model tracks important system events and user actions for security, debugging, and compliance purposes. It records details about the action performed, the user who performed it, and relevant metadata about the event.

## Schema

```typescript
interface IAuditLog {
  userId: mongoose.Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: mongoose.Types.ObjectId;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
```

### Fields

| Field        | Type     | Required | Description                                         |
| ------------ | -------- | -------- | --------------------------------------------------- |
| `userId`     | ObjectId | Yes      | Reference to the user who performed the action      |
| `action`     | string   | Yes      | Type of action performed (e.g., "create", "update") |
| `entityType` | string   | Yes      | Type of entity affected (e.g., "User", "Post")      |
| `entityId`   | ObjectId | No       | Reference to the affected entity                    |
| `details`    | Object   | Yes      | Additional information about the action             |
| `ipAddress`  | string   | No       | IP address where the action originated              |
| `userAgent`  | string   | No       | User agent string from the client                   |
| `createdAt`  | Date     | Yes      | Timestamp when the log was created                  |

### Validation Rules

- `action`: Must be a recognized action type
- `entityType`: Must be a valid model name
- `details`: Must be a valid JSON object
- `ipAddress`: Must be a valid IP address format
- `userAgent`: String with maximum length of 500 characters

### Indexes

- `userId`: For finding logs by user
- `action`: For finding specific types of actions
- `entityType`: For finding logs related to specific entities
- `entityId`: For finding logs about a specific entity
- Compound indexes:
  - `[userId, action]`: For finding specific actions by user
  - `[entityType, entityId]`: For finding all logs for an entity
  - `[createdAt]`: For chronological queries
  - `[action, createdAt]`: For finding recent actions of a type

### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "action": "update",
  "entityType": "User",
  "entityId": "507f1f77bcf86cd799439013",
  "details": {
    "changes": {
      "approvalStatus": {
        "from": "in process",
        "to": "approved"
      }
    },
    "reason": "User verification complete"
  },
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Usage

```typescript
// Creating a new audit log
const log = await AuditLogModel.create({
  userId: adminId,
  action: "approve",
  entityType: "User",
  entityId: userId,
  details: {
    changes: { approvalStatus: { from: "in process", to: "approved" } },
    reason: "User verification complete",
  },
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"],
});

// Finding logs for a specific entity
const entityLogs = await AuditLogModel.find({
  entityType: "User",
  entityId: userId,
}).sort({ createdAt: -1 });

// Finding recent actions by type
const recentApprovals = await AuditLogModel.find({
  action: "approve",
})
  .sort({ createdAt: -1 })
  .limit(10);

// Finding user activity
const userActivity = await AuditLogModel.find({
  userId: userId,
})
  .select("action entityType createdAt")
  .sort({ createdAt: -1 });
```

## Common Actions

- `create`: Entity creation
- `update`: Entity modification
- `delete`: Entity removal
- `approve`: Approval status change
- `login`: User authentication
- `register`: User registration
- `upload`: File upload
- `download`: File download

## Security Considerations

1. Sensitive data in details should be redacted
2. IP addresses should be stored securely
3. User agent strings should be sanitized
4. Access to logs should be restricted
5. Regular archiving of old logs
6. Rate limiting for log creation
7. Validation of all input fields
8. Protection against log injection
9. Proper error handling
10. Regular log analysis for security events
