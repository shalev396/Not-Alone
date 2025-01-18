# Message API Documentation

## Overview

The Message API provides endpoints for managing messages within channels. These endpoints support creating, retrieving, updating, and deleting messages, with real-time updates through WebSocket connections. Messages are tied to specific channels and can only be accessed by channel members.

## Table of Contents

### Protected Endpoints

- [Create Message](#create-message)
- [Get Channel Messages](#get-channel-messages)
- [Update Message](#update-message)
- [Delete Message](#delete-message)
- [Mark Messages as Read](#mark-messages-as-read)

## Endpoints

### Create Message

Creates a new message in a channel.

```
POST /api/messages
```

#### Headers

- `Authorization`: Bearer token (required)

#### Request Body

```json
{
  "channelId": "507f1f77bcf86cd799439011",
  "content": "Hello everyone!"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": {
      "_id": "507f1f77bcf86cd799439012",
      "channelId": "507f1f77bcf86cd799439011",
      "sender": "507f1f77bcf86cd799439013",
      "content": "Hello everyone!",
      "isEdited": false,
      "readBy": ["507f1f77bcf86cd799439013"],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Get Channel Messages

Retrieves messages from a specific channel with pagination.

```
GET /api/messages/channel/:channelId
```

#### Headers

- `Authorization`: Bearer token (required)

#### Query Parameters

- `before`: Get messages before this timestamp (optional)
- `after`: Get messages after this timestamp (optional)
- `limit`: Number of messages to retrieve (default: 50)

#### Success Response

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "channelId": "507f1f77bcf86cd799439011",
        "sender": {
          "_id": "507f1f77bcf86cd799439013",
          "firstName": "John",
          "lastName": "Doe"
        },
        "content": "Hello everyone!",
        "isEdited": false,
        "readBy": [
          {
            "_id": "507f1f77bcf86cd799439013",
            "firstName": "John",
            "lastName": "Doe"
          }
        ],
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "hasMore": true,
    "nextCursor": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update Message

Updates an existing message (sender only).

```
PUT /api/messages/:messageId
```

#### Headers

- `Authorization`: Bearer token (required)

#### Request Body

```json
{
  "content": "Updated message content"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": {
      "_id": "507f1f77bcf86cd799439012",
      "content": "Updated message content",
      "isEdited": true,
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Delete Message

Deletes a message (sender or admin only).

```
DELETE /api/messages/:messageId
```

#### Headers

- `Authorization`: Bearer token (required)

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Message deleted successfully"
  }
}
```

### Mark Messages as Read

Marks multiple messages as read by the current user.

```
POST /api/messages/read
```

#### Headers

- `Authorization`: Bearer token (required)

#### Request Body

```json
{
  "messageIds": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Messages marked as read",
    "updatedCount": 2
  }
}
```

## WebSocket Events

Messages support real-time updates through WebSocket connections:

### Emitted Events

- `message:created`: When a new message is created in a channel
- `message:updated`: When a message is edited
- `message:deleted`: When a message is deleted
- `message:read`: When a message is marked as read by a user

### Listening Events

- `typing:start`: User started typing in a channel
- `typing:stop`: User stopped typing in a channel

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
  "error": "Message not found"
}
```

### Validation Error

```json
{
  "success": false,
  "error": "Invalid message data provided"
}
```

### Channel Error

```json
{
  "success": false,
  "error": "Channel not found or access denied"
}
```

### Server Error

```json
{
  "success": false,
  "error": "Internal server error"
}
```
