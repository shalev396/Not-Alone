# Discount API Documentation

## Overview

The Discount API provides endpoints for managing promotional offers and discounts provided by businesses to soldiers. These endpoints support creating, retrieving, updating, and managing discounts, with specific access controls for businesses and administrators.

## Table of Contents

### Protected Endpoints

- [Create Discount](#create-discount)
- [Get All Discounts](#get-all-discounts)
- [Get Discount by ID](#get-discount-by-id)
- [Update Discount](#update-discount)
- [Delete Discount](#delete-discount)
- [Get Business Discounts](#get-business-discounts)
- [Get City Discounts](#get-city-discounts)

## Endpoints

### Create Discount

Creates a new discount offer (Business or Admin only).

```
POST /api/discounts
```

#### Headers

- `Authorization`: Bearer token (required)

#### Request Body

```json
{
  "businessId": "507f1f77bcf86cd799439011",
  "cityId": "507f1f77bcf86cd799439012",
  "title": "Summer Sale",
  "description": "20% off on all items",
  "terms": "Valid for all soldiers with ID",
  "discountType": "percentage",
  "discountValue": 20,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.999Z",
  "maxUses": 100,
  "media": ["image1.jpg", "image2.jpg"]
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "discount": {
      "_id": "507f1f77bcf86cd799439013",
      "businessId": "507f1f77bcf86cd799439011",
      "cityId": "507f1f77bcf86cd799439012",
      "title": "Summer Sale",
      "description": "20% off on all items",
      "terms": "Valid for all soldiers with ID",
      "discountType": "percentage",
      "discountValue": 20,
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T23:59:59.999Z",
      "maxUses": 100,
      "currentUses": 0,
      "isActive": true,
      "media": ["image1.jpg", "image2.jpg"],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Get All Discounts

Retrieves all active discounts with optional filtering.

```
GET /api/discounts
```

#### Query Parameters

- `active`: Filter by active status (boolean, optional)
- `type`: Filter by discount type (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

#### Success Response

```json
{
  "success": true,
  "data": {
    "discounts": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "title": "Summer Sale",
        "description": "20% off on all items",
        "discountType": "percentage",
        "discountValue": 20,
        "business": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Sample Business"
        },
        "city": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Tel Aviv"
        },
        "isActive": true,
        "endDate": "2024-12-31T23:59:59.999Z"
      }
    ],
    "total": 50,
    "page": 1,
    "totalPages": 3
  }
}
```

### Get Discount by ID

Retrieves detailed information about a specific discount.

```
GET /api/discounts/:discountId
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "discount": {
      "_id": "507f1f77bcf86cd799439013",
      "businessId": "507f1f77bcf86cd799439011",
      "cityId": "507f1f77bcf86cd799439012",
      "title": "Summer Sale",
      "description": "20% off on all items",
      "terms": "Valid for all soldiers with ID",
      "discountType": "percentage",
      "discountValue": 20,
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T23:59:59.999Z",
      "maxUses": 100,
      "currentUses": 5,
      "isActive": true,
      "media": ["image1.jpg", "image2.jpg"],
      "business": {
        "name": "Sample Business",
        "address": "123 Main St"
      },
      "city": {
        "name": "Tel Aviv"
      }
    }
  }
}
```

### Update Discount

Updates an existing discount (Business owner or Admin only).

```
PUT /api/discounts/:discountId
```

#### Headers

- `Authorization`: Bearer token (required)

#### Request Body

```json
{
  "title": "Updated Summer Sale",
  "description": "Now 30% off on all items",
  "discountValue": 30,
  "endDate": "2024-12-31T23:59:59.999Z",
  "media": ["newimage1.jpg"]
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Discount updated successfully",
    "discount": {
      "_id": "507f1f77bcf86cd799439013",
      "title": "Updated Summer Sale",
      "description": "Now 30% off on all items",
      "discountValue": 30,
      "endDate": "2024-12-31T23:59:59.999Z",
      "media": ["newimage1.jpg"]
    }
  }
}
```

### Delete Discount

Deletes a discount (Business owner or Admin only).

```
DELETE /api/discounts/:discountId
```

#### Headers

- `Authorization`: Bearer token (required)

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Discount deleted successfully"
  }
}
```

### Get Business Discounts

Retrieves all discounts for a specific business.

```
GET /api/discounts/business/:businessId
```

#### Query Parameters

- `active`: Filter by active status (boolean, optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

#### Success Response

```json
{
  "success": true,
  "data": {
    "discounts": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "title": "Summer Sale",
        "description": "20% off on all items",
        "discountType": "percentage",
        "discountValue": 20,
        "isActive": true,
        "endDate": "2024-12-31T23:59:59.999Z"
      }
    ],
    "total": 10,
    "page": 1,
    "totalPages": 1
  }
}
```

### Get City Discounts

Retrieves all active discounts in a specific city.

```
GET /api/discounts/city/:cityId
```

#### Query Parameters

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

#### Success Response

```json
{
  "success": true,
  "data": {
    "discounts": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "title": "Summer Sale",
        "description": "20% off on all items",
        "business": {
          "name": "Sample Business",
          "address": "123 Main St"
        },
        "discountType": "percentage",
        "discountValue": 20,
        "isActive": true,
        "endDate": "2024-12-31T23:59:59.999Z"
      }
    ],
    "total": 15,
    "page": 1,
    "totalPages": 1
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
  "error": "Unauthorized - Must be business owner"
}
```

### Not Found Error

```json
{
  "success": false,
  "error": "Discount not found"
}
```

### Validation Error

```json
{
  "success": false,
  "error": "Invalid discount data provided"
}
```

### Server Error

```json
{
  "success": false,
  "error": "Internal server error"
}
```
