# Channel API Documentation

## Overview

The Channel API provides endpoints for managing communication channels in the system. These endpoints support creating and managing direct messages, group chats, and eatup-specific channels, with real-time updates through WebSocket integration.

## Table of Contents

### Protected Endpoints

- [Create Channel](#create-channel)
- [Get User Channels](#get-user-channels)
- [Get Channel by ID](#get-channel-by-id)
- [Add Members](#add-members)
- [Remove Member](#remove-member)
- [Delete Channel](#delete-channel)

## Endpoints

### Create Channel

Creates a new communication channel.

```
POST /api/channels
```

#### Headers

- `Authorization`: Bearer token (required)

#### Request Body

```json
{
  "name": "Team Chat",
  "type": "group",
  "members": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"],
  "eatupId": "507f1f77bcf86cd799439014", // Required only for eatup type
  "isPublic": false
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "channel": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Team Chat",
      "type": "group",
      "members": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"],
      "isPublic": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Get User Channels

Retrieves all channels where the authenticated user is a member.

```
GET /api/channels
```

#### Headers

- `Authorization`: Bearer token (required)

#### Query Parameters

- `type`: Filter by channel type (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

#### Success Response

```json
{
  "success": true,
  "data": {
    "channels": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Team Chat",
        "type": "group",
        "members": [
          {
            "_id": "507f1f77bcf86cd799439012",
            "firstName": "John",
            "lastName": "Doe"
          }
        ],
        "lastMessage": {
          "content": "Hello team!",
          "createdAt": "2024-01-01T00:00:00.000Z"
        }
      }
    ],
    "total": 5,
    "page": 1,
    "totalPages": 1
  }
}
```

### Get Channel by ID

Retrieves detailed information about a specific channel.

```
GET /api/channels/:channelId
```

#### Headers

- `Authorization`: Bearer token (required)

#### Success Response

```json
{
  "success": true,
  "data": {
    "channel": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Team Chat",
      "type": "group",
      "members": [
        {
          "_id": "507f1f77bcf86cd799439012",
          "firstName": "John",
          "lastName": "Doe"
        }
      ],
      "isPublic": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Add Members

Adds new members to an existing channel.

```
PUT /api/channels/:channelId/members
```

#### Headers

- `Authorization`: Bearer token (required)

#### Request Body

```json
{
  "members": ["507f1f77bcf86cd799439014", "507f1f77bcf86cd799439015"]
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Members added successfully",
    "channel": {
      "_id": "507f1f77bcf86cd799439011",
      "members": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439014"]
    }
  }
}
```

### Remove Member

Removes a member from a channel.

```
DELETE /api/channels/:channelId/members/:userId
```

#### Headers

- `Authorization`: Bearer token (required)

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Member removed successfully"
  }
}
```

### Delete Channel

Deletes a channel (creator only).

```
DELETE /api/channels/:channelId
```

#### Headers

- `Authorization`: Bearer token (required)

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Channel deleted successfully"
  }
}
```

## Common Error Responses

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
  "error": "Unauthorized - Must be channel member"
}
```

### Not Found Error

```json
{
  "success": false,
  "error": "Channel not found"
}
```

### Validation Error

```json
{
  "success": false,
  "error": "Invalid channel data provided"
}
```

### Server Error

```json
{
  "success": false,
  "error": "Internal server error"
}
```

## WebSocket Events

Channels support real-time updates through WebSocket connections:

### Emitted Events

- `channel:created`: When a new channel is created
- `channel:updated`: When channel details are updated
- `channel:deleted`: When a channel is deleted
- `member:added`: When new members are added
- `member:removed`: When a member is removed

### Listening Events

- `join:channel`: Join a channel's room
- `leave:channel`: Leave a channel's room
- `typing:start`: User started typing
- `typing:stop`: User stopped typing
