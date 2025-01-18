# Audit Log API Documentation

## Overview

The Audit Log API provides endpoints for retrieving and managing system audit logs. These endpoints are primarily used by administrators to monitor system activity and investigate potential security issues.

## Table of Contents

### Protected Endpoints (Admin Only)

- [Get All Audit Logs](#get-all-audit-logs)
- [Get Audit Logs by Entity](#get-audit-logs-by-entity)
- [Get User Activity Logs](#get-user-activity-logs)
- [Get Recent Actions](#get-recent-actions)

## Endpoints

### Get All Audit Logs

Retrieves a paginated list of all audit logs in the system.

```
GET /api/audit-logs
```

#### Headers

- `Authorization`: Bearer token (required)

#### Query Parameters

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)
- `action`: Filter by action type
- `startDate`: Filter logs after this date
- `endDate`: Filter logs before this date

#### Success Response

```json
{
  "success": true,
  "data": {
    "logs": [
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
          }
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "totalPages": 2
  }
}
```

#### Error Responses

```json
{
  "success": false,
  "error": "Unauthorized - Admin access required"
}
```

### Get Audit Logs by Entity

Retrieves all audit logs for a specific entity.

```
GET /api/audit-logs/entity/:entityType/:entityId
```

#### Headers

- `Authorization`: Bearer token (required)

#### URL Parameters

- `entityType`: Type of entity (e.g., "User", "Post")
- `entityId`: ID of the entity

#### Success Response

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "userId": "507f1f77bcf86cd799439012",
        "action": "create",
        "entityType": "User",
        "entityId": "507f1f77bcf86cd799439013",
        "details": {},
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Get User Activity Logs

Retrieves all audit logs for a specific user.

```
GET /api/audit-logs/user/:userId
```

#### Headers

- `Authorization`: Bearer token (required)

#### URL Parameters

- `userId`: ID of the user

#### Success Response

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "action": "login",
        "entityType": "User",
        "details": {
          "ipAddress": "192.168.1.1"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Get Recent Actions

Retrieves the most recent audit logs for a specific action type.

```
GET /api/audit-logs/actions/:action
```

#### Headers

- `Authorization`: Bearer token (required)

#### URL Parameters

- `action`: Type of action (e.g., "create", "update")

#### Query Parameters

- `limit`: Number of logs to retrieve (default: 10)

#### Success Response

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "userId": "507f1f77bcf86cd799439012",
        "action": "update",
        "entityType": "User",
        "details": {},
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

## Common Error Responses

All endpoints may return the following errors:

### Authentication Error

```json
{
  "success": false,
  "error": "No token provided"
}
```

### Authorization Error

```json
{
  "success": false,
  "error": "Unauthorized - Admin access required"
}
```

### Not Found Error

```json
{
  "success": false,
  "error": "Audit log not found"
}
```

### Validation Error

```json
{
  "success": false,
  "error": "Invalid date format for startDate"
}
```

### Server Error

```json
{
  "success": false,
  "error": "Internal server error"
}
```
