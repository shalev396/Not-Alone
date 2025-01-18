# Donation API Documentation

## Overview

The Donation API provides endpoints for managing donations from users to soldiers. These endpoints support creating, retrieving, updating, and managing donations, with specific access controls for donors, soldiers, and administrators.

## Table of Contents

### Protected Endpoints

- [Create Donation](#create-donation)
- [Get All Donations](#get-all-donations)
- [Get Donation by ID](#get-donation-by-id)
- [Update Donation](#update-donation)
- [Delete Donation](#delete-donation)
- [Get City Donations](#get-city-donations)
- [Get My Donations](#get-my-donations)
- [Assign Donation](#assign-donation)
- [Mark Donation as Collected](#mark-donation-as-collected)

## Endpoints

### Create Donation

Creates a new donation offer (Donor only).

```
POST /api/donations
```

#### Headers

- `Authorization`: Bearer token (required)

#### Request Body

```json
{
  "city": "507f1f77bcf86cd799439011",
  "address": "123 Main St, Tel Aviv",
  "category": "Furniture",
  "title": "Living Room Sofa",
  "description": "3-seater sofa in excellent condition",
  "media": ["image1.jpg", "image2.jpg"]
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "donation": {
      "_id": "507f1f77bcf86cd799439012",
      "city": "507f1f77bcf86cd799439011",
      "address": "123 Main St, Tel Aviv",
      "category": "Furniture",
      "donorId": "507f1f77bcf86cd799439013",
      "title": "Living Room Sofa",
      "description": "3-seater sofa in excellent condition",
      "media": ["image1.jpg", "image2.jpg"],
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Get All Donations

Retrieves all donations with optional filtering.

```
GET /api/donations
```

#### Query Parameters

- `status`: Filter by status (optional)
- `category`: Filter by category (optional)
- `city`: Filter by city ID (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

#### Success Response

```json
{
  "success": true,
  "data": {
    "donations": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Living Room Sofa",
        "category": "Furniture",
        "city": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Tel Aviv"
        },
        "donor": {
          "_id": "507f1f77bcf86cd799439013",
          "firstName": "John",
          "lastName": "Doe"
        },
        "status": "pending",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "totalPages": 3
  }
}
```

### Get Donation by ID

Retrieves detailed information about a specific donation.

```
GET /api/donations/:donationId
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "donation": {
      "_id": "507f1f77bcf86cd799439012",
      "city": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Tel Aviv"
      },
      "address": "123 Main St, Tel Aviv",
      "category": "Furniture",
      "donorId": "507f1f77bcf86cd799439013",
      "title": "Living Room Sofa",
      "description": "3-seater sofa in excellent condition",
      "media": ["image1.jpg", "image2.jpg"],
      "status": "pending",
      "assignedTo": null,
      "donor": {
        "firstName": "John",
        "lastName": "Doe",
        "phone": "1234567890"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Update Donation

Updates an existing donation (Donor or Admin only).

```
PUT /api/donations/:donationId
```

#### Headers

- `Authorization`: Bearer token (required)

#### Request Body

```json
{
  "title": "Updated Sofa Title",
  "description": "Updated description",
  "media": ["newimage1.jpg"]
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Donation updated successfully",
    "donation": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Updated Sofa Title",
      "description": "Updated description",
      "media": ["newimage1.jpg"]
    }
  }
}
```

### Delete Donation

Deletes a donation (Donor or Admin only).

```
DELETE /api/donations/:donationId
```

#### Headers

- `Authorization`: Bearer token (required)

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Donation deleted successfully"
  }
}
```

### Get City Donations

Retrieves all donations in a specific city.

```
GET /api/donations/city/:cityId
```

#### Query Parameters

- `status`: Filter by status (optional)
- `category`: Filter by category (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

#### Success Response

```json
{
  "success": true,
  "data": {
    "donations": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Living Room Sofa",
        "category": "Furniture",
        "status": "pending",
        "donor": {
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

### Get My Donations

Retrieves all donations for the authenticated user (as donor or assigned soldier).

```
GET /api/donations/my
```

#### Query Parameters

- `status`: Filter by status (optional)
- `type`: Filter by type ("donated" or "assigned", optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

#### Success Response

```json
{
  "success": true,
  "data": {
    "donations": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Living Room Sofa",
        "category": "Furniture",
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

### Assign Donation

Assigns a donation to a soldier (Soldier or Admin only).

```
POST /api/donations/:donationId/assign
```

#### Headers

- `Authorization`: Bearer token (required)

#### Request Body

```json
{
  "soldierId": "507f1f77bcf86cd799439014"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Donation assigned successfully",
    "donation": {
      "_id": "507f1f77bcf86cd799439012",
      "status": "assigned",
      "assignedTo": "507f1f77bcf86cd799439014"
    }
  }
}
```

### Mark Donation as Collected

Marks a donation as collected (Assigned soldier or Admin only).

```
POST /api/donations/:donationId/collect
```

#### Headers

- `Authorization`: Bearer token (required)

#### Success Response

```json
{
  "success": true,
  "data": {
    "message": "Donation marked as collected",
    "donation": {
      "_id": "507f1f77bcf86cd799439012",
      "status": "collected"
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
  "error": "Unauthorized - Must be donation donor"
}
```

### Not Found Error

```json
{
  "success": false,
  "error": "Donation not found"
}
```

### Validation Error

```json
{
  "success": false,
  "error": "Invalid donation data provided"
}
```

### Server Error

```json
{
  "success": false,
  "error": "Internal server error"
}
```
