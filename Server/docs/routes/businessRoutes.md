# Business API Documentation

## Overview

The Business API provides endpoints for managing business profiles, including creation, updates, worker management, and approval processes. These endpoints support various business operations and integrations with the platform.

## Table of Contents

### Protected Endpoints

- [Create Business](#create-business)
- [Get All Businesses](#get-all-businesses)
- [Get Business by ID](#get-business-by-id)
- [Update Business](#update-business)
- [Delete Business](#delete-business)
- [Add Worker](#add-worker)
- [Remove Worker](#remove-worker)
- [Get Business Workers](#get-business-workers)

### Admin Endpoints

- [Approve Business](#approve-business)
- [Deny Business](#deny-business)
- [Get Pending Businesses](#get-pending-businesses)

## Endpoints

### Create Business

Creates a new business profile.

```
POST /api/businesses
```

#### Headers

- `Authorization`: Bearer token (required)

#### Request Body

```json
{
  "name": "City Cafe",
  "address": "123 Main St, City Center",
  "phone": "+972501234567",
  "email": "contact@citycafe.com",
  "description": "Cozy cafe offering discounts to soldiers",
  "category": "Food & Beverage",
  "openingHours": [
    {
      "day": "Sunday",
      "open": "08:00",
      "close": "22:00"
    }
  ],
  "city": "507f1f77bcf86cd799439014"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "business": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "City Cafe",
      "owner": "507f1f77bcf86cd799439012",
      "approvalStatus": "in process",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Get All Businesses

Retrieves a list of approved businesses with optional filtering.

```
GET /api/businesses
```

#### Query Parameters

- `city`: Filter by city ID
- `category`: Filter by business category
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

#### Success Response

```json
{
  "success": true,
  "data": {
    "businesses": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "City Cafe",
        "category": "Food & Beverage",
        "rating": 4.5,
        "reviewCount": 28
      }
    ],
    "total": 100,
    "page": 1,
    "totalPages": 5
  }
}
```

### Get Business by ID

Retrieves detailed information about a specific business.

```
GET /api/businesses/:businessId
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "business": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "City Cafe",
      "owner": {
        "_id": "507f1f77bcf86cd799439012",
        "firstName": "John",
        "lastName": "Doe"
      },
      "workers": [],
      "category": "Food & Beverage",
      "rating": 4.5,
      "reviewCount": 28
    }
  }
}
```

### Update Business

Updates business information (owner only).

```
PUT /api/businesses/:businessId
```

#### Headers

- `Authorization`: Bearer token (required)

#### Request Body

```json
{
  "name": "Updated Cafe Name",
  "description": "Updated description",
  "openingHours": [
    {
      "day": "Sunday",
      "open": "09:00",
      "close": "23:00"
    }
  ]
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "business": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Updated Cafe Name",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Add Worker

Adds a worker to the business (owner only).

```
POST /api/businesses/:businessId/workers
```

#### Headers

- `Authorization`: Bearer token (required)

#### Request Body

```json
{
  "userId": "507f1f77bcf86cd799439013"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Worker added successfully"
  }
}
```

### Remove Worker

Removes a worker from the business (owner only).

```
DELETE /api/businesses/:businessId/workers/:userId
```

#### Headers

- `Authorization`: Bearer token (required)

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Worker removed successfully"
  }
}
```

### Approve Business

Approves a pending business (admin only).

```
POST /api/businesses/:businessId/approve
```

#### Headers

- `Authorization`: Bearer token (required)

#### Success Response

```json
{
  "success": true,
  "data": {
    "business": {
      "_id": "507f1f77bcf86cd799439011",
      "approvalStatus": "approved",
      "approvalDate": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Deny Business

Denies a pending business (admin only).

```
POST /api/businesses/:businessId/deny
```

#### Headers

- `Authorization`: Bearer token (required)

#### Request Body

```json
{
  "denialReason": "Invalid business documentation"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "business": {
      "_id": "507f1f77bcf86cd799439011",
      "approvalStatus": "deny",
      "denialReason": "Invalid business documentation"
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
  "error": "Unauthorized - Only business owner can perform this action"
}
```

### Not Found Error

```json
{
  "success": false,
  "error": "Business not found"
}
```

### Validation Error

```json
{
  "success": false,
  "error": "Invalid business data provided"
}
```

### Server Error

```json
{
  "success": false,
  "error": "Internal server error"
}
```
