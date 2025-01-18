# Request API Documentation

## Overview

The Request API provides endpoints for managing assistance requests from soldiers. These endpoints support creating, retrieving, updating, and managing requests, with features for payment tracking and status updates.

## Table of Contents

### Protected Endpoints

- [Create Request](#create-request)
- [Get All Requests](#get-all-requests)
- [Get Request by ID](#get-request-by-id)
- [Update Request](#update-request)
- [Delete Request](#delete-request)
- [Get City Requests](#get-city-requests)
- [Get My Requests](#get-my-requests)
- [Mark Request as Paid](#mark-request-as-paid)
- [Mark Request as Fulfilled](#mark-request-as-fulfilled)

## Endpoints

### Create Request

Creates a new assistance request.

```
POST /api/requests
```

#### Headers

- `Authorization`: Bearer token (required)

#### Request Body

```json
{
  "service": "Housing",
  "item": "Apartment",
  "itemDescription": "Looking for a 2-bedroom apartment near base",
  "quantity": 1,
  "zone": "center",
  "city": "507f1f77bcf86cd799439011",
  "agreeToShareDetails": true
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "request": {
      "_id": "507f1f77bcf86cd799439012",
      "authorId": "507f1f77bcf86cd799439013",
      "service": "Housing",
      "item": "Apartment",
      "itemDescription": "Looking for a 2-bedroom apartment near base",
      "quantity": 1,
      "zone": "center",
      "city": "507f1f77bcf86cd799439011",
      "agreeToShareDetails": true,
      "status": "pending",
      "paid": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Get All Requests

Retrieves all requests with optional filtering.

```
GET /api/requests
```

#### Query Parameters

- `status`: Filter by status (optional)
- `service`: Filter by service type (optional)
- `zone`: Filter by zone (optional)
- `city`: Filter by city ID (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

#### Success Response

```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "author": {
          "_id": "507f1f77bcf86cd799439013",
          "firstName": "John",
          "lastName": "Doe"
        },
        "service": "Housing",
        "item": "Apartment",
        "city": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Tel Aviv"
        },
        "status": "pending",
        "paid": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "totalPages": 3
  }
}
```

### Get Request by ID

Retrieves detailed information about a specific request.

```
GET /api/requests/:requestId
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "request": {
      "_id": "507f1f77bcf86cd799439012",
      "author": {
        "_id": "507f1f77bcf86cd799439013",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "1234567890"
      },
      "service": "Housing",
      "item": "Apartment",
      "itemDescription": "Looking for a 2-bedroom apartment near base",
      "quantity": 1,
      "zone": "center",
      "city": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Tel Aviv"
      },
      "agreeToShareDetails": true,
      "status": "pending",
      "paid": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Update Request

Updates an existing request (author only).

```
PUT /api/requests/:requestId
```

#### Headers

- `Authorization`: Bearer token (required)

#### Request Body

```json
{
  "itemDescription": "Updated description",
  "quantity": 2
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Request updated successfully",
    "request": {
      "_id": "507f1f77bcf86cd799439012",
      "itemDescription": "Updated description",
      "quantity": 2
    }
  }
}
```

### Delete Request

Deletes a request (author or admin only).

```
DELETE /api/requests/:requestId
```

#### Headers

- `Authorization`: Bearer token (required)

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Request deleted successfully"
  }
}
```

### Get City Requests

Retrieves all requests in a specific city.

```
GET /api/requests/city/:cityId
```

#### Query Parameters

- `status`: Filter by status (optional)
- `service`: Filter by service type (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

#### Success Response

```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "service": "Housing",
        "item": "Apartment",
        "status": "pending",
        "author": {
          "firstName": "John",
          "lastName": "Doe"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 15,
    "page": 1,
    "totalPages": 1
  }
}
```

### Get My Requests

Retrieves all requests by the authenticated user.

```
GET /api/requests/my
```

#### Query Parameters

- `status`: Filter by status (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

#### Success Response

```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "service": "Housing",
        "item": "Apartment",
        "status": "pending",
        "city": {
          "name": "Tel Aviv"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 10,
    "page": 1,
    "totalPages": 1
  }
}
```

### Mark Request as Paid

Marks a request as paid (admin only).

```
POST /api/requests/:requestId/paid
```

#### Headers

- `Authorization`: Bearer token (required)

#### Request Body

```json
{
  "paidBy": "507f1f77bcf86cd799439014"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Request marked as paid",
    "request": {
      "_id": "507f1f77bcf86cd799439012",
      "paid": true,
      "paidBy": "507f1f77bcf86cd799439014",
      "paidAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Mark Request as Fulfilled

Marks a request as fulfilled.

```
POST /api/requests/:requestId/fulfill
```

#### Headers

- `Authorization`: Bearer token (required)

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Request marked as fulfilled",
    "request": {
      "_id": "507f1f77bcf86cd799439012",
      "status": "fulfilled"
    }
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
  "error": "Unauthorized - Must be request author"
}
```

### Not Found Error

```json
{
  "success": false,
  "error": "Request not found"
}
```

### Validation Error

```json
{
  "success": false,
  "error": "Invalid request data provided"
}
```

### Status Error

```json
{
  "success": false,
  "error": "Request already fulfilled"
}
```

### Server Error

```json
{
  "success": false,
  "error": "Internal server error"
}
```
