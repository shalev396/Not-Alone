# City API Documentation

## Overview

The City API provides endpoints for managing cities in the system. These endpoints support creating and managing cities, handling municipality and soldier assignments, and managing city-specific content. Cities must be approved by administrators before becoming active in the system.

## Table of Contents

### Protected Endpoints

- [Create City](#create-city)
- [Get All Cities](#get-all-cities)
- [Get City by ID](#get-city-by-id)
- [Update City](#update-city)
- [Join City as Municipality](#join-city-as-municipality)
- [Join City as Soldier](#join-city-as-soldier)
- [Handle Join Request](#handle-join-request)
- [Get Pending Join Requests](#get-pending-join-requests)
- [Delete City](#delete-city)

### Admin Endpoints

- [Approve City](#approve-city)
- [Deny City](#deny-city)

## Endpoints

### Create City

Creates a new city entry.

```
POST /api/cities
```

#### Headers

- `Authorization`: Bearer token (required)

#### Request Body

```json
{
  "name": "Tel Aviv",
  "zone": "center",
  "bio": "A vibrant coastal city with rich culture",
  "media": ["image1.jpg", "image2.jpg"]
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "city": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Tel Aviv",
      "zone": "center",
      "bio": "A vibrant coastal city with rich culture",
      "media": ["image1.jpg", "image2.jpg"],
      "approvalStatus": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Get All Cities

Retrieves a list of cities with optional filtering.

```
GET /api/cities
```

#### Query Parameters

- `zone`: Filter by geographic zone (optional)
- `status`: Filter by approval status (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

#### Success Response

```json
{
  "success": true,
  "data": {
    "cities": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Tel Aviv",
        "zone": "center",
        "bio": "A vibrant coastal city with rich culture",
        "approvalStatus": "approved",
        "soldierCount": 25,
        "municipalityCount": 3
      }
    ],
    "total": 50,
    "page": 1,
    "totalPages": 3
  }
}
```

### Get City by ID

Retrieves detailed information about a specific city.

```
GET /api/cities/:cityId
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "city": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Tel Aviv",
      "zone": "center",
      "bio": "A vibrant coastal city with rich culture",
      "media": ["image1.jpg", "image2.jpg"],
      "approvalStatus": "approved",
      "soldiers": [
        {
          "_id": "507f1f77bcf86cd799439012",
          "firstName": "John",
          "lastName": "Doe"
        }
      ],
      "municipalityUsers": [
        {
          "_id": "507f1f77bcf86cd799439013",
          "firstName": "Jane",
          "lastName": "Smith"
        }
      ]
    }
  }
}
```

### Update City

Updates city information (Municipality or Admin only).

```
PUT /api/cities/:cityId
```

#### Headers

- `Authorization`: Bearer token (required)

#### Request Body

```json
{
  "bio": "Updated city description",
  "media": ["newimage1.jpg", "newimage2.jpg"]
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "City updated successfully",
    "city": {
      "_id": "507f1f77bcf86cd799439011",
      "bio": "Updated city description",
      "media": ["newimage1.jpg", "newimage2.jpg"]
    }
  }
}
```

### Join City as Municipality

Requests to join a city as a municipality user.

```
POST /api/cities/:cityId/join/municipality
```

#### Headers

- `Authorization`: Bearer token (required)

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Join request submitted successfully"
  }
}
```

### Join City as Soldier

Requests to join a city as a soldier.

```
POST /api/cities/:cityId/join/soldier
```

#### Headers

- `Authorization`: Bearer token (required)

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Join request submitted successfully"
  }
}
```

### Handle Join Request

Approves or denies a join request (Municipality or Admin only).

```
POST /api/cities/:cityId/join/:userId/handle
```

#### Headers

- `Authorization`: Bearer token (required)

#### Request Body

```json
{
  "action": "approve",
  "denialReason": "Optional reason if denied"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Join request approved successfully"
  }
}
```

### Get Pending Join Requests

Retrieves pending join requests for a city (Municipality or Admin only).

```
GET /api/cities/:cityId/join/pending
```

#### Headers

- `Authorization`: Bearer token (required)

#### Success Response

```json
{
  "success": true,
  "data": {
    "pendingJoins": [
      {
        "userId": "507f1f77bcf86cd799439014",
        "type": "soldier",
        "requestDate": "2024-01-01T00:00:00.000Z",
        "user": {
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ]
  }
}
```

### Delete City

Deletes a city (Admin only).

```
DELETE /api/cities/:cityId
```

#### Headers

- `Authorization`: Bearer token (required)

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "City deleted successfully"
  }
}
```

### Approve City

Approves a pending city (Admin only).

```
POST /api/cities/:cityId/approve
```

#### Headers

- `Authorization`: Bearer token (required)

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "City approved successfully"
  }
}
```

### Deny City

Denies a pending city (Admin only).

```
POST /api/cities/:cityId/deny
```

#### Headers

- `Authorization`: Bearer token (required)

#### Request Body

```json
{
  "denialReason": "Reason for denial"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "City denied successfully"
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
  "error": "Unauthorized - Admin access required"
}
```

### Not Found Error

```json
{
  "success": false,
  "error": "City not found"
}
```

### Validation Error

```json
{
  "success": false,
  "error": "Invalid city data provided"
}
```

### Server Error

```json
{
  "success": false,
  "error": "Internal server error"
}
```
