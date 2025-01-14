# Donation API Documentation

## Donation Creation and Management Process

The system implements a secure donation management process with role-based access control. Here's the complete flow:

### 1. Donation Creation

1. Donor submits donation details to `/api/donations`
   - Provides donation information (category, title, description, etc.)
   - Donation is created with `status: "pending"`
   - Donor receives their `donation_id`

### 2. Donation Assignment

1. Municipality reviews donations in their city
2. Municipality assigns donations to soldiers
3. When assigned:
   - Status changes to "assigned"
   - Soldier information is linked
   - Both donor and soldier are notified

### 3. Delivery Process

1. After assignment, the donation goes through delivery stages:
   - "assigned": Initial assignment state
   - "delivery": Donor/Municipality marks as in delivery
   - "arrived": Soldier confirms receipt

### 4. Access Control

- Donors: Can create and manage their donations
- Municipality: Can view and assign donations in their city
- Soldiers: Can view assigned donations and confirm receipt
- Admin: Full access to all donations

## Table of Contents

- [Protected Endpoints](#protected-endpoints)
  - [Create Donation](#create-donation)
  - [Get All Donations](#get-all-donations)
  - [Get Donation by ID](#get-donation-by-id)
  - [Get My Donations](#get-my-donations)
  - [Update Donation](#update-donation)
  - [Delete Donation](#delete-donation)
  - [Get City Donations and Soldiers](#get-city-donations-and-soldiers)
  - [Assign Donation](#assign-donation)
  - [Update Donation Status](#update-donation-status)

## Protected Endpoints

All endpoints require authentication via JWT token in the Authorization header:  
`Authorization: Bearer <token>`

### Create Donation

Create a new donation (Donors and Admin only).

**URL**: `/api/donations`  
**Method**: `POST`  
**Auth required**: Yes  
**Permissions**: Donor, Admin

**Request Body**:

```json
{
  "city": "ObjectId",
  "address": "string",
  "category": "Furniture" | "Clothes" | "Electricity" | "Army Equipments",
  "title": "string",
  "description": "string",
  "media": ["string"]
}
```

**Body Parameters**:

- `city` (required): City ID where donation is available
- `address` (required): Pickup address (5-200 characters)
- `category` (required): Type of donation
- `title` (required): Donation title (3-100 characters)
- `description` (optional): Detailed description (max 1000 characters)
- `media` (optional): Array of media URLs (max 10 items)

**Success Response**:

- **Code**: 201
- **Content**:

```json
{
  "_id": "donation_id",
  "donorId": "user_id",
  "city": "city_id",
  "address": "123 Main St",
  "category": "Furniture",
  "title": "Office Chair",
  "description": "Ergonomic office chair in good condition",
  "media": ["url1", "url2"],
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:

- **Code**: 400
  - Invalid input data
  - City not found
  - Media items exceed limit
- **Code**: 401
  - Authentication required
- **Code**: 403
  - Not authorized to create donations
- **Code**: 500
  - Server error

### Get All Donations

Get a list of all donations (filtered by user role and city).

**URL**: `/api/donations`  
**Method**: `GET`  
**Auth required**: Yes  
**Permissions**: Admin, Municipality

**Query Parameters**:

- `status`: Filter by status
- `category`: Filter by category
- `city`: Filter by city
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Sort field and direction (default: -createdAt)

**Success Response**:

- **Code**: 200
- **Content**:

```json
{
  "donations": [
    {
      "_id": "donation_id",
      "donor": {
        "_id": "user_id",
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "phone": "string"
      },
      "cityDetails": {
        "_id": "city_id",
        "name": "string",
        "zone": "string"
      },
      "address": "string",
      "category": "Furniture",
      "title": "string",
      "description": "string",
      "media": ["string"],
      "status": "pending",
      "assignedSoldier": {
        "_id": "user_id",
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "phone": "string"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "pages": 10,
    "hasMore": true
  }
}
```

### Get Donation by ID

Get details of a specific donation.

**URL**: `/api/donations/:donationId`  
**Method**: `GET`  
**Auth required**: Yes  
**Permissions**: Admin, Municipality, Donor (own), Assigned Soldier

**Success Response**:

- **Code**: 200
- **Content**: Single donation object (same format as in Get All Donations)

**Error Responses**:

- **Code**: 400
  - Invalid donation ID format
- **Code**: 401
  - Authentication required
- **Code**: 403
  - Not authorized to view this donation
- **Code**: 404
  - Donation not found
- **Code**: 500
  - Server error

### Get My Donations

Get all donations created by the authenticated donor.

**URL**: `/api/donations/my`  
**Method**: `GET`  
**Auth required**: Yes  
**Permissions**: Donor, Admin

**Success Response**:

- **Code**: 200
- **Content**: Array of donation objects (same format as Get All Donations)

### Update Donation

Update an existing donation (only if status is "pending").

**URL**: `/api/donations/:donationId`  
**Method**: `PUT`  
**Auth required**: Yes  
**Permissions**: Admin, Donor (own)

**Request Body**: Same as Create Donation (all fields optional)

**Success Response**:

- **Code**: 200
- **Content**: Updated donation object

**Error Responses**:

- **Code**: 400
  - Invalid donation ID format
  - Cannot update non-pending donation
- **Code**: 401
  - Authentication required
- **Code**: 403
  - Not authorized to update this donation
- **Code**: 404
  - Donation not found
- **Code**: 500
  - Server error

### Delete Donation

Delete a donation (only if status is "pending").

**URL**: `/api/donations/:donationId`  
**Method**: `DELETE`  
**Auth required**: Yes  
**Permissions**: Admin, Donor (own)

**Success Response**:

- **Code**: 200
- **Content**:

```json
{
  "message": "Donation deleted successfully"
}
```

### Get City Donations and Soldiers

Get all pending donations and available soldiers in a municipality's city.

**URL**: `/api/donations/city-matching`  
**Method**: `GET`  
**Auth required**: Yes  
**Permissions**: Admin, Municipality

**Success Response**:

- **Code**: 200
- **Content**:

```json
{
  "donations": [
    {
      "_id": "donation_id",
      "donor": {},
      "category": "string",
      "title": "string",
      "status": "pending"
    }
  ],
  "soldiers": [
    {
      "_id": "user_id",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phone": "string"
    }
  ],
  "city": {
    "id": "city_id",
    "name": "string",
    "zone": "string"
  }
}
```

### Assign Donation

Assign a donation to a soldier.

**URL**: `/api/donations/:donationId/assign/:soldierId`  
**Method**: `POST`  
**Auth required**: Yes  
**Permissions**: Admin, Municipality

**Success Response**:

- **Code**: 200
- **Content**: Updated donation object with status: "assigned"

### Update Donation Status

Update the status of a donation.

**URL**: `/api/donations/:donationId/status`  
**Method**: `PUT`  
**Auth required**: Yes  
**Permissions**: Varies by status transition

**Request Body**:

```json
{
  "status": "assigned" | "delivery" | "arrived"
}
```

**Status Transitions**:

- "pending" → "assigned" (Municipality)
- "assigned" → "delivery" (Donor, Municipality)
- "delivery" → "arrived" (Assigned Soldier)

**Success Response**:

- **Code**: 200
- **Content**: Updated donation object

**Error Responses**:

- **Code**: 400
  - Invalid status transition
  - Invalid donation ID format
- **Code**: 401
  - Authentication required
- **Code**: 403
  - Not authorized for this status update
- **Code**: 404
  - Donation not found
- **Code**: 500
  - Server error

## Status Flow

1. "pending" (Initial state)
   - Can be updated or deleted by donor
   - Can be assigned by Municipality
2. "assigned"
   - Linked to a specific soldier
   - Can be marked for delivery
3. "delivery"
   - In transit to soldier
   - Can be marked as arrived
4. "arrived"
   - Final state
   - Cannot be modified further

## General Error Responses

All endpoints may return these errors:

**Authentication Error**:

```json
{
  "message": "Authentication required"
}
```

**Authorization Error**:

```json
{
  "message": "Not authorized to perform this action"
}
```

**Validation Error**:

```json
{
  "errors": [
    {
      "field": "field_name",
      "message": "Error message"
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
