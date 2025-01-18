# Message API Documentation

## Overview

The Message API provides functionality for sending, receiving, and managing messages within channels. Messages support real-time updates through WebSocket connections.

## Table of Contents

- [Protected Endpoints](#protected-endpoints)
  - [Create Message](#create-message)
  - [Get Channel Messages](#get-channel-messages)
  - [Update Message](#update-message)
  - [Delete Message](#delete-message)

## Protected Endpoints

All protected endpoints require a valid JWT token in the Authorization header:  
`Authorization: Bearer <token>`

### Create Message

Create a new message in a channel.

**URL**: `/api/messages`  
**Method**: `POST`  
**Auth required**: Yes  
**Allowed Types**: Admin, Soldier, Municipality, Organization, Donor

**Request Body**:

```json
{
  "channelId": "string",
  "content": "string"
}
```

**Body Parameters**:

- `channelId` (required): ID of the channel to send message to
- `content` (required): Message content (1-5000 characters)

**Success Response**:

- **Code**: 201
- **Content**:

```json
{
  "_id": "messageId",
  "channelId": "channelId",
  "content": "Message content",
  "sender": {
    "_id": "userId",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "profileImage": "image_url"
  },
  "readBy": [
    {
      "_id": "userId",
      "firstName": "John",
      "lastName": "Doe"
    }
  ],
  "isEdited": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:

- **Code**: 400
  - Invalid channel ID format
  - Content too long/short
  - Missing required fields
- **Code**: 401
  - Authentication failed
- **Code**: 403
  - Not a member of channel
- **Code**: 500
  - Server error

### Get Channel Messages

Get messages from a specific channel with pagination.

**URL**: `/api/messages/channel/:channelId`  
**Method**: `GET`  
**Auth required**: Yes  
**Allowed Types**: Admin, Soldier, Municipality, Organization, Donor

**URL Parameters**:

- `channelId`: Channel ID

**Query Parameters**:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Messages per page (default: 50)

**Success Response**:

- **Code**: 200
- **Content**:

```json
{
  "messages": [
    {
      "_id": "messageId",
      "channelId": "channelId",
      "content": "Message content",
      "sender": {
        "_id": "userId",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "profileImage": "image_url"
      },
      "readBy": [
        {
          "_id": "userId",
          "firstName": "John",
          "lastName": "Doe"
        }
      ],
      "isEdited": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "hasMore": false
  }
}
```

**Error Responses**:

- **Code**: 400
  - Invalid channel ID format
- **Code**: 401
  - Authentication failed
- **Code**: 403
  - Not a member of channel
- **Code**: 500
  - Server error

### Update Message

Update an existing message.

**URL**: `/api/messages/:messageId`  
**Method**: `PUT`  
**Auth required**: Yes  
**Allowed Types**: Admin, Soldier, Municipality, Organization, Donor

**URL Parameters**:

- `messageId`: Message ID

**Request Body**:

```json
{
  "content": "string"
}
```

**Success Response**:

- **Code**: 200
- **Content**: Updated message object (same format as Create Message response)

**Error Responses**:

- **Code**: 400
  - Invalid message ID format
  - Content too long/short
- **Code**: 401
  - Authentication failed
- **Code**: 403
  - Not message author or admin
- **Code**: 404
  - Message not found
- **Code**: 500
  - Server error

### Delete Message

Delete an existing message.

**URL**: `/api/messages/:messageId`  
**Method**: `DELETE`  
**Auth required**: Yes  
**Allowed Types**: Admin, Soldier, Municipality, Organization, Donor

**URL Parameters**:

- `messageId`: Message ID

**Success Response**:

- **Code**: 200
- **Content**:

```json
{
  "message": "Message deleted successfully"
}
```

**Error Responses**:

- **Code**: 400
  - Invalid message ID format
- **Code**: 401
  - Authentication failed
- **Code**: 403
  - Not message author or admin
- **Code**: 404
  - Message not found
- **Code**: 500
  - Server error

## Real-time Events

Messages support real-time updates through WebSocket connections. The following events are available:

### Client Events (Emit)

1. `authenticate`

   - Payload: JWT token string
   - Response: "authenticated" event or "auth_error"

2. `join_channel`

   - Payload: channelId string
   - Effect: Joins the socket to the channel room

3. `leave_channel`
   - Payload: channelId string
   - Effect: Removes the socket from the channel room

### Server Events (Listen)

1. `new_message`

   - Payload: New message object
   - Triggered when: A new message is created in a channel

2. `message_update`

   - Payload: `{ messageId: string, update: object }`
   - Triggered when: A message is edited

3. `message_delete`

   - Payload: messageId string
   - Triggered when: A message is deleted

4. `typing_status`
   - Payload: `{ userId: string, isTyping: boolean }`
   - Triggered when: A user starts/stops typing

## Common Error Responses

All endpoints may return these errors:

**Authentication Error**:

```json
{
  "error": "Authentication required"
}
```

**Authorization Error**:

```json
{
  "error": "Access denied",
  "message": "This route requires one of these roles: Admin, Soldier, Municipality, Organization, Donor"
}
```

**Validation Error**:

```json
{
  "errors": [
    {
      "field": "content",
      "message": "Message content is required"
    }
  ]
}
```

**Server Error**:

```json
{
  "message": "Error message"
}
```
