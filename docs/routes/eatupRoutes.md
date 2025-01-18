# Eatup API Documentation

## Overview

The Eatup API provides endpoints for managing social dining events organized for soldiers. These endpoints support creating, retrieving, updating, and managing eatups, with specific access controls for hosts, soldiers, and administrators.

## Table of Contents

### Protected Endpoints

- [Create Eatup](#create-eatup)
- [Get All Eatups](#get-all-eatups)
- [Get Eatup by ID](#get-eatup-by-id)
- [Update Eatup](#update-eatup)
- [Delete Eatup](#delete-eatup)
- [Get City Eatups](#get-city-eatups)
- [Get My Eatups](#get-my-eatups)
- [Join Eatup](#join-eatup)
- [Leave Eatup](#leave-eatup)
- [Cancel Eatup](#cancel-eatup)

## Endpoints

### Create Eatup

Creates a new eatup event.

```
POST /api/eatups
```

#### Headers

- `Authorization`: Bearer token (required)

#### Request Body

```json
{
  "city": "507f1f77bcf86cd799439011",
  "title": "Friday Night Dinner",
  "media": ["image1.jpg", "image2.jpg"],
  "date": "2024-01-01T18:00:00.000Z",
  "kosher": true,
  "description": "Join us for a traditional Shabbat dinner",
  "languages": ["Hebrew", "English"],
  "hosting": "organization",
  "limit": 10
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "eatup": {
      "_id": "507f1f77bcf86cd799439012",
      "city": "507f1f77bcf86cd799439011",
      "authorId": "507f1f77bcf86cd799439013",
      "title": "Friday Night Dinner",
      "media": ["image1.jpg", "image2.jpg"],
      "date": "2024-01-01T18:00:00.000Z",
      "kosher": true,
      "description": "Join us for a traditional Shabbat dinner",
      "languages": ["Hebrew", "English"],
      "hosting": "organization",
      "limit": 10,
      "guests": [],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Get All Eatups

Retrieves all eatups with optional filtering.

```
GET /api/eatups
```

#### Query Parameters

- `city`: Filter by city ID (optional)
- `date`: Filter by date range (optional)
- `kosher`: Filter by kosher status (optional)
- `hosting`: Filter by hosting type (optional)
- `language`: Filter by language (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

#### Success Response

```json
{
  "success": true,
  "data": {
    "eatups": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Friday Night Dinner",
        "city": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Tel Aviv"
        },
        "author": {
          "_id": "507f1f77bcf86cd799439013",
          "firstName": "John",
          "lastName": "Doe"
        },
        "date": "2024-01-01T18:00:00.000Z",
        "kosher": true,
        "hosting": "organization",
        "guestCount": 5,
        "limit": 10
      }
    ],
    "total": 50,
    "page": 1,
    "totalPages": 3
  }
}
```

### Get Eatup by ID

Retrieves detailed information about a specific eatup.

```
GET /api/eatups/:eatupId
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "eatup": {
      "_id": "507f1f77bcf86cd799439012",
      "city": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Tel Aviv"
      },
      "author": {
        "_id": "507f1f77bcf86cd799439013",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "1234567890"
      },
      "title": "Friday Night Dinner",
      "media": ["image1.jpg", "image2.jpg"],
      "date": "2024-01-01T18:00:00.000Z",
      "kosher": true,
      "description": "Join us for a traditional Shabbat dinner",
      "languages": ["Hebrew", "English"],
      "hosting": "organization",
      "limit": 10,
      "guests": [
        {
          "_id": "507f1f77bcf86cd799439014",
          "firstName": "Jane",
          "lastName": "Smith"
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Update Eatup

Updates an existing eatup (Author or Admin only).

```
PUT /api/eatups/:eatupId
```

#### Headers

- `Authorization`: Bearer token (required)

#### Request Body

```json
{
  "title": "Updated Dinner Title",
  "description": "Updated description",
  "media": ["newimage1.jpg"],
  "date": "2024-01-02T18:00:00.000Z"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Eatup updated successfully",
    "eatup": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Updated Dinner Title",
      "description": "Updated description",
      "media": ["newimage1.jpg"],
      "date": "2024-01-02T18:00:00.000Z"
    }
  }
}
```

### Delete Eatup

Deletes an eatup (Author or Admin only).

```
DELETE /api/eatups/:eatupId
```

#### Headers

- `Authorization`: Bearer token (required)

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Eatup deleted successfully"
  }
}
```

### Get City Eatups

Retrieves all eatups in a specific city.

```
GET /api/eatups/city/:cityId
```

#### Query Parameters

- `date`: Filter by date range (optional)
- `kosher`: Filter by kosher status (optional)
- `hosting`: Filter by hosting type (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

#### Success Response

```json
{
  "success": true,
  "data": {
    "eatups": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Friday Night Dinner",
        "date": "2024-01-01T18:00:00.000Z",
        "kosher": true,
        "hosting": "organization",
        "author": {
          "firstName": "John",
          "lastName": "Doe"
        },
        "guestCount": 5,
        "limit": 10
      }
    ],
    "total": 15,
    "page": 1,
    "totalPages": 1
  }
}
```

### Get My Eatups

Retrieves all eatups for the authenticated user (as host or guest).

```
GET /api/eatups/my
```

#### Query Parameters

- `type`: Filter by type ("hosting" or "attending", optional)
- `date`: Filter by date range (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

#### Success Response

```json
{
  "success": true,
  "data": {
    "eatups": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Friday Night Dinner",
        "date": "2024-01-01T18:00:00.000Z",
        "city": {
          "name": "Tel Aviv"
        },
        "guestCount": 5,
        "limit": 10
      }
    ],
    "total": 10,
    "page": 1,
    "totalPages": 1
  }
}
```

### Join Eatup

Joins an eatup as a guest.

```
POST /api/eatups/:eatupId/join
```

#### Headers

- `Authorization`: Bearer token (required)

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Successfully joined eatup",
    "eatup": {
      "_id": "507f1f77bcf86cd799439012",
      "guestCount": 6,
      "limit": 10
    }
  }
}
```

### Leave Eatup

Leaves an eatup as a guest.

```
POST /api/eatups/:eatupId/leave
```

#### Headers

- `Authorization`: Bearer token (required)

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Successfully left eatup",
    "eatup": {
      "_id": "507f1f77bcf86cd799439012",
      "guestCount": 4,
      "limit": 10
    }
  }
}
```

### Cancel Eatup

Cancels an eatup (Author or Admin only).

```
POST /api/eatups/:eatupId/cancel
```

#### Headers

- `Authorization`: Bearer token (required)

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Eatup cancelled successfully"
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
  "error": "Unauthorized - Must be eatup author"
}
```

### Not Found Error

```json
{
  "success": false,
  "error": "Eatup not found"
}
```

### Validation Error

```json
{
  "success": false,
  "error": "Invalid eatup data provided"
}
```

### Capacity Error

```json
{
  "success": false,
  "error": "Eatup is at full capacity"
}
```

### Server Error

```json
{
  "success": false,
  "error": "Internal server error"
}
```
