# Channel API Documentation

## Overview

The Channel API provides functionality for creating and managing communication channels between users. Channels can be of different types: "direct", "group", or "eatup".

## Table of Contents

- [Protected Endpoints](#protected-endpoints)
  - [Create Channel](#create-channel)
  - [Get User Channels](#get-user-channels)
  - [Add Members](#add-members)
  - [Remove Member](#remove-member)
  - [Delete Channel](#delete-channel)

## Protected Endpoints

All protected endpoints require a valid JWT token in the Authorization header:  
`Authorization: Bearer <token>`

### Create Channel

Create a new channel.

**URL**: `/api/channels`  
**Method**: `POST`  
**Auth required**: Yes  
**Allowed Types**: Admin, Soldier, Municipality, Organization

**Request Body**:

```json
{
  "name": "string",
  "type": "direct" | "group" | "eatup",
  "members": ["userId1", "userId2"],
  "eatupId": "string (optional)",
  "isPublic": boolean
}
```

**Body Parameters**:

- `name` (required): Channel name
- `type` (required): Channel type (one of: "direct", "group", "eatup")
- `members` (required): Array of user IDs
- `eatupId` (optional): ID of associated eatup (required for eatup type)
- `isPublic` (optional): Whether the channel is public (default: false)

**Success Response**:

- **Code**: 201
- **Content**:

```json
{
  "_id": "channelId",
  "name": "Channel Name",
  "type": "group",
  "members": ["userId1", "userId2"],
  "eatupId": "eatupId",
  "isPublic": false,
  "memberDetails": [
    {
      "_id": "userId1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "profileImage": "image_url"
    }
  ],
  "eatupDetails": {
    "_id": "eatupId",
    "title": "Eatup Title"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:

- **Code**: 400
  - Invalid channel type
  - Missing required fields
  - Invalid member IDs
- **Code**: 401
  - Authentication failed
- **Code**: 403
  - User type not allowed
- **Code**: 500
  - Server error

### Get User Channels

Get all channels for the authenticated user.

**URL**: `/api/channels`  
**Method**: `GET`  
**Auth required**: Yes  
**Allowed Types**: Admin, Soldier, Municipality, Organization, Donor

**Success Response**:

- **Code**: 200
- **Content**:

```json
[
  {
    "_id": "channelId",
    "name": "Channel Name",
    "type": "group",
    "members": ["userId1", "userId2"],
    "eatupId": "eatupId",
    "isPublic": false,
    "memberDetails": [
      {
        "_id": "userId1",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "profileImage": "image_url"
      }
    ],
    "eatupDetails": {
      "_id": "eatupId",
      "title": "Eatup Title"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Add Members

Add members to an existing channel.

**URL**: `/api/channels/:channelId/members`  
**Method**: `PUT`  
**Auth required**: Yes  
**Allowed Types**: Admin, Soldier, Municipality, Organization

**URL Parameters**:

- `channelId`: Channel ID

**Request Body**:

```json
{
  "members": ["userId1", "userId2"]
}
```

**Success Response**:

- **Code**: 200
- **Content**: Updated channel object (same format as Create Channel response)

**Error Responses**:

- **Code**: 400
  - Invalid channel ID format
  - Invalid member IDs
- **Code**: 401
  - Authentication failed
- **Code**: 403
  - Not a member of channel
- **Code**: 404
  - Channel not found
- **Code**: 500
  - Server error

### Remove Member

Remove a member from a channel.

**URL**: `/api/channels/:channelId/members/:userId`  
**Method**: `DELETE`  
**Auth required**: Yes  
**Allowed Types**: Admin, Soldier, Municipality, Organization

**URL Parameters**:

- `channelId`: Channel ID
- `userId`: User ID to remove

**Success Response**:

- **Code**: 200
- **Content**: Updated channel object (same format as Create Channel response)

**Error Responses**:

- **Code**: 400
  - Invalid ID format
- **Code**: 401
  - Authentication failed
- **Code**: 403
  - Not authorized to remove member
- **Code**: 404
  - Channel not found
- **Code**: 500
  - Server error

### Delete Channel

Delete an existing channel.

**URL**: `/api/channels/:channelId`  
**Method**: `DELETE`  
**Auth required**: Yes  
**Allowed Types**: Admin, Soldier, Municipality, Organization

**URL Parameters**:

- `channelId`: Channel ID

**Success Response**:

- **Code**: 200
- **Content**:

```json
{
  "message": "Channel deleted successfully"
}
```

**Error Responses**:

- **Code**: 400
  - Invalid channel ID format
- **Code**: 401
  - Authentication failed
- **Code**: 403
  - Not authorized to delete channel
- **Code**: 404
  - Channel not found
- **Code**: 500
  - Server error

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
  "message": "This route requires one of these roles: Admin, Soldier, Municipality, Organization"
}
```

**Validation Error**:

```json
{
  "errors": [
    {
      "field": "name",
      "message": "Channel name is required"
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
