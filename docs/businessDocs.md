# Business API Documentation

## Business Registration and Approval Process

The system implements a secure business registration process with admin approval. Here's the complete flow:

### 1. Initial Business Registration

1. Business user submits registration details to `/api/businesses`
   - Must be authenticated as a "Business" type user
   - Business is created with `status: "pending"`
   - Owner is automatically added as a worker

### 2. Admin Approval

1. Admin reviews pending businesses at `/api/businesses/admin/all`
2. Admin can:
   - Approve the business (`POST /api/businesses/:id/status` with `{"status": "approved"}`)
   - Deny the business (`POST /api/businesses/:id/status` with `{"status": "denied"}`)

### 3. Worker Application Process

1. Other business users can apply to join an approved business
2. Application flow:
   - Business user applies (`POST /api/businesses/:id/apply`)
   - Owner reviews applications
   - Owner approves/denies workers (`POST /api/businesses/:id/workers/:workerId/handle`)

## Table of Contents

- [Public Endpoints](#public-endpoints)
  - [Get All Businesses](#get-all-businesses)
  - [Get Business by ID](#get-business-by-id)
- [Business Owner Endpoints](#business-owner-endpoints)
  - [Create Business](#create-business)
  - [Update Business](#update-business)
  - [Delete Business](#delete-business)
  - [Handle Worker Application](#handle-worker-application)
- [Worker Endpoints](#worker-endpoints)
  - [Apply to Join Business](#apply-to-join-business)
- [Admin Endpoints](#admin-endpoints)
  - [Get All Businesses (Admin)](#get-all-businesses-admin)
  - [Update Business Status](#update-business-status)

## Public Endpoints

### Get All Businesses

Get a list of all approved businesses.

**URL**: `/api/businesses`  
**Method**: `GET`  
**Auth required**: Yes

**Success Response**:

- **Code**: 200
- **Content**:

```json
[
  {
    "_id": "business_id",
    "name": "Business Name",
    "slogan": "Business Slogan",
    "media": ["url1", "url2"],
    "owner": {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe"
    },
    "workers": [
      {
        "_id": "user_id",
        "firstName": "John",
        "lastName": "Doe"
      }
    ],
    "status": "approved",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Business by ID

Get details of a specific business.

**URL**: `/api/businesses/:businessId`  
**Method**: `GET`  
**Auth required**: Yes

**URL Parameters**:

- `businessId`: Business ID

**Success Response**:

- **Code**: 200
- **Content**: Single business object (same format as above)

**Error Responses**:

- **Code**: 400
  - Invalid business ID format
- **Code**: 404
  - Business not found or not approved

## Business Owner Endpoints

### Create Business

Create a new business (Business type users only).

**URL**: `/api/businesses`  
**Method**: `POST`  
**Auth required**: Yes (Business type only)

**Request Body**:

```json
{
  "name": "string",
  "slogan": "string",
  "media": ["string"]
}
```

**Body Parameters**:

- `name` (required): Business name (2-100 characters)
- `slogan` (required): Business slogan (5-200 characters)
- `media`: Array of media URLs (max 10)

**Success Response**:

- **Code**: 201
- **Content**: Created business object

**Error Responses**:

- **Code**: 400
  - Validation errors
  - Name already exists
- **Code**: 401
  - Authentication required
- **Code**: 403
  - Not a business type user

### Update Business

Update an existing business.

**URL**: `/api/businesses/:businessId`  
**Method**: `PUT`  
**Auth required**: Yes (Owner or Admin)

**Request Body**:

```json
{
  "name": "string",
  "slogan": "string",
  "media": ["string"]
}
```

**Success Response**:

- **Code**: 200
- **Content**: Updated business object

**Error Responses**:

- **Code**: 400
  - Invalid business ID
  - Validation errors
- **Code**: 403
  - Not authorized
- **Code**: 404
  - Business not found

### Delete Business

Delete an existing business.

**URL**: `/api/businesses/:businessId`  
**Method**: `DELETE`  
**Auth required**: Yes (Owner or Admin)

**Success Response**:

- **Code**: 200
- **Content**: `{"message": "Business deleted successfully"}`

## Worker Endpoints

### Apply to Join Business

Apply to join a business as a worker.

**URL**: `/api/businesses/:businessId/apply`  
**Method**: `POST`  
**Auth required**: Yes (Business type only)

**Success Response**:

- **Code**: 200
- **Content**: Updated business object

**Error Responses**:

- **Code**: 400
  - Already applied or working
  - Business not approved
- **Code**: 403
  - Not a business type user
- **Code**: 404
  - Business not found

### Handle Worker Application

Approve or deny a worker's application.

**URL**: `/api/businesses/:businessId/workers/:workerId/handle`  
**Method**: `POST`  
**Auth required**: Yes (Owner only)

**Request Body**:

```json
{
  "action": "approve" | "deny"
}
```

**Success Response**:

- **Code**: 200
- **Content**: Updated business object

**Error Responses**:

- **Code**: 400
  - Invalid action
  - Worker not pending
- **Code**: 403
  - Not the owner
- **Code**: 404
  - Business not found

## Admin Endpoints

### Get All Businesses (Admin)

Get all businesses including pending and denied.

**URL**: `/api/businesses/admin/all`  
**Method**: `GET`  
**Auth required**: Yes (Admin only)

**Success Response**:

- **Code**: 200
- **Content**: Array of all businesses

### Update Business Status

Approve or deny a business.

**URL**: `/api/businesses/:businessId/status`  
**Method**: `POST`  
**Auth required**: Yes (Admin only)

**Request Body**:

```json
{
  "status": "approved" | "denied"
}
```

**Success Response**:

- **Code**: 200
- **Content**: Updated business object

**Error Responses**:

- **Code**: 400
  - Invalid status
  - Business not pending
- **Code**: 403
  - Not an admin
- **Code**: 404
  - Business not found

## General Error Responses

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
  "error": "Not authorized"
}
```

**Validation Error**:

```json
{
  "errors": [
    {
      "field": "name",
      "message": "Name is required"
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
