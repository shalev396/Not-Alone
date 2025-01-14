# Eatup API Documentation

## Eatup Management Process

The system implements a secure eatup management process with role-based access control. Here's the complete flow:

### 1. Eatup Creation

1. Authenticated users (Admin, Municipality, Organization, Donor) can create eatups
   - Provides eatup details (city, title, date, etc.)
   - Media can be added (up to 10 items)
   - Guest limit must be specified
   - Hosting type must be specified (organization, donators, or city)

### 2. Eatup Access

1. All authenticated users can:
   - View all eatups
   - View individual eatup details
2. Soldiers can additionally:
   - Subscribe to eatups
   - Unsubscribe from eatups
3. Creators (and admins) can:
   - Update their eatups
   - Delete their eatups

### 3. Guest Management

1. Soldiers can join eatups if:
   - The eatup hasn't started yet
   - The guest limit hasn't been reached
2. Soldiers can leave eatups if:
   - The eatup hasn't started yet

### Status Codes Summary

- 200: Successful operation
- 201: Successful creation
- 400: Invalid input
- 401: Authentication failed
- 403: Not authorized
- 404: Resource not found
- 500: Server error

## Table of Contents

- [Protected Endpoints](#protected-endpoints)
  - [Get All Eatups](#get-all-eatups)
  - [Get My Eatups](#get-my-eatups)
  - [Get Eatup by ID](#get-eatup-by-id)
  - [Create Eatup](#create-eatup)
  - [Subscribe to Eatup](#subscribe-to-eatup)
  - [Unsubscribe from Eatup](#unsubscribe-from-eatup)
  - [Update Eatup](#update-eatup)
  - [Delete Eatup](#delete-eatup)

## Protected Endpoints

All protected endpoints require a valid JWT token in the Authorization header:  
`Authorization: Bearer <token>`

### Get All Eatups

Get a list of all eatups with filtering and pagination.

**URL**: `/api/eatups`  
**Method**: `GET`  
**Auth required**: Yes  
**Permitted roles**: Admin, Municipality, Organization, Donor, Soldier

**Query Parameters**:

- `city`: Filter by city ID
- `hosting`: Filter by hosting type (organization, donators, city)
- `date`: Filter by date (YYYY-MM-DD)
- `kosher`: Filter by kosher status (true/false)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Sort field (-date for descending, date for ascending)

**Success Response**:

- **Code**: 200
- **Content**:

```json
{
  "eatups": [
    {
      "_id": "eatup_id",
      "city": "city_id",
      "title": "Shabbat Dinner",
      "authorId": "user_id",
      "media": ["url1", "url2"],
      "date": "2024-01-20T18:00:00.000Z",
      "kosher": true,
      "description": "Join us for a lovely Shabbat dinner",
      "languages": ["Hebrew", "English"],
      "hosting": "organization",
      "limit": 20,
      "guests": ["user_id1", "user_id2"],
      "author": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "cityDetails": {
        "name": "Tel Aviv",
        "zone": "center"
      },
      "guestDetails": [
        {
          "firstName": "Guest",
          "lastName": "One",
          "email": "guest1@example.com",
          "phone": "+1234567891"
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "pages": 5,
    "hasMore": true
  }
}
```

### Get My Eatups

Get all eatups created by the authenticated user.

**URL**: `/api/eatups/my`  
**Method**: `GET`  
**Auth required**: Yes  
**Permitted roles**: Admin, Municipality, Organization, Donor

**Query Parameters**:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Sort field (-date for descending, date for ascending)

**Success Response**:

- **Code**: 200
- **Content**: Same as Get All Eatups response

### Get Eatup by ID

Get details of a specific eatup.

**URL**: `/api/eatups/:eatupId`  
**Method**: `GET`  
**Auth required**: Yes  
**Permitted roles**: Admin, Municipality, Organization, Donor, Soldier

**URL Parameters**:

- `eatupId`: Eatup ID

**Success Response**:

- **Code**: 200
- **Content**: Same as single eatup object from Get All Eatups response

### Create Eatup

Create a new eatup.

**URL**: `/api/eatups`  
**Method**: `POST`  
**Auth required**: Yes  
**Permitted roles**: Admin, Municipality, Organization, Donor

**Request Body**:

```json
{
  "city": "city_id",
  "title": "string",
  "media": ["string"],
  "date": "2024-01-20T18:00:00.000Z",
  "kosher": boolean,
  "description": "string",
  "languages": ["string"],
  "hosting": "organization|donators|city",
  "limit": number
}
```

**Success Response**:

- **Code**: 201
- **Content**: Created eatup object

### Subscribe to Eatup

Subscribe to an eatup as a guest.

**URL**: `/api/eatups/:eatupId/subscribe`  
**Method**: `POST`  
**Auth required**: Yes  
**Permitted roles**: Admin, Soldier

**URL Parameters**:

- `eatupId`: Eatup ID

**Success Response**:

- **Code**: 200
- **Content**: Updated eatup object

### Unsubscribe from Eatup

Unsubscribe from an eatup.

**URL**: `/api/eatups/:eatupId/unsubscribe`  
**Method**: `POST`  
**Auth required**: Yes  
**Permitted roles**: Admin, Soldier

**URL Parameters**:

- `eatupId`: Eatup ID

**Success Response**:

- **Code**: 200
- **Content**: Updated eatup object

### Update Eatup

Update an existing eatup.

**URL**: `/api/eatups/:eatupId`  
**Method**: `PUT`  
**Auth required**: Yes  
**Permitted roles**: Admin, Municipality, Organization, Donor (must be author or admin)

**URL Parameters**:

- `eatupId`: Eatup ID

**Request Body** (all fields optional):

```json
{
  "city": "city_id",
  "title": "string",
  "media": ["string"],
  "date": "2024-01-20T18:00:00.000Z",
  "kosher": boolean,
  "description": "string",
  "languages": ["string"],
  "hosting": "organization|donators|city",
  "limit": number
}
```

**Success Response**:

- **Code**: 200
- **Content**: Updated eatup object

### Delete Eatup

Delete an existing eatup.

**URL**: `/api/eatups/:eatupId`  
**Method**: `DELETE`  
**Auth required**: Yes  
**Permitted roles**: Admin, Municipality, Organization, Donor (must be author or admin)

**URL Parameters**:

- `eatupId`: Eatup ID

**Success Response**:

- **Code**: 200
- **Content**:

```json
{
  "message": "Eatup deleted successfully"
}
```

## Common Error Responses

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
  "message": "This route requires one of these roles: Admin, Municipality, Organization, Donor"
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
