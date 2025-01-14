# Request API Documentation

## Request Creation and Management Process

The system implements a secure request management process with role-based access control. Here's the complete flow:

### 1. Request Creation

1. Soldier submits request details to `/api/requests`
   - Provides request information (service, item, description, etc.)
   - Request is created with `status: "in process"`
   - Soldier receives their `request_id`

### 2. Request Processing

1. Municipality/Admin reviews requests
2. Can approve or deny requests
3. If approved:
   - Status changes to "approved"
   - Request becomes available for payment
4. If denied:
   - Status changes to "deny"
   - Denial reason is recorded

### 3. Payment Process

1. Donors, Organizations, or Municipality can pay for approved requests
2. Once paid:
   - Payment details are recorded
   - Payment timestamp is saved
   - Payer information is linked

### 4. Access Control

- Soldiers: Can create and view their own requests
- Municipality: Can view, approve, and deny requests from their city
- Admin: Full access to all requests
- Donors/Organizations: Can view approved requests and make payments

## Table of Contents

- [Protected Endpoints](#protected-endpoints)
  - [Create Request](#create-request)
  - [Get All Requests](#get-all-requests)
  - [Get Request by ID](#get-request-by-id)
  - [Get My Requests](#get-my-requests)
  - [Update Request](#update-request)
  - [Delete Request](#delete-request)
  - [Approve Request](#approve-request)
  - [Deny Request](#deny-request)
  - [Pay Request](#pay-request)

## Protected Endpoints

All endpoints require authentication via JWT token in the Authorization header:  
`Authorization: Bearer <token>`

### Create Request

Create a new request (Soldiers and Admin only).

**URL**: `/api/requests`  
**Method**: `POST`  
**Auth required**: Yes  
**Permissions**: Soldier, Admin

**Request Body**:

```json
{
  "service": "Regular" | "Reserves",
  "item": "string",
  "itemDescription": "string",
  "quantity": "number",
  "zone": "north" | "center" | "south",
  "city": "ObjectId",
  "agreeToShareDetails": true
}
```

**Success Response**:

- **Code**: 201
- **Content**:

```json
{
  "_id": "request_id",
  "authorId": "user_id",
  "service": "Regular",
  "item": "Item name",
  "itemDescription": "Description",
  "quantity": 1,
  "zone": "north",
  "city": "city_id",
  "agreeToShareDetails": true,
  "status": "in process",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:

- **Code**: 400
  - Invalid input data
  - City not found
  - City zone mismatch
- **Code**: 401
  - Authentication required
- **Code**: 403
  - Not authorized to create requests
- **Code**: 500
  - Server error

### Get All Requests

Get a list of all requests (filtered by user role).

**URL**: `/api/requests`  
**Method**: `GET`  
**Auth required**: Yes  
**Permissions**: Admin, Municipality

**Query Parameters**:

- `status`: Filter by status
- `zone`: Filter by zone
- `service`: Filter by service type
- `city`: Filter by city
- `paid`: Filter by payment status
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Sort field and direction (default: -createdAt)

**Success Response**:

- **Code**: 200
- **Content**:

```json
{
  "requests": [
    {
      "_id": "request_id",
      "author": {
        "_id": "user_id",
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "phone": "string"
      },
      "service": "Regular",
      "item": "string",
      "itemDescription": "string",
      "quantity": 1,
      "zone": "north",
      "cityDetails": {
        "_id": "city_id",
        "name": "string",
        "zone": "string"
      },
      "status": "in process",
      "paid": false,
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

### Get Request by ID

Get details of a specific request.

**URL**: `/api/requests/:requestId`  
**Method**: `GET`  
**Auth required**: Yes  
**Permissions**: Admin, Municipality, Author

**Success Response**:

- **Code**: 200
- **Content**: Single request object (same format as in Get All Requests)

**Error Responses**:

- **Code**: 400
  - Invalid request ID format
- **Code**: 401
  - Authentication required
- **Code**: 403
  - Not authorized to view this request
- **Code**: 404
  - Request not found
- **Code**: 500
  - Server error

### Get My Requests

Get all requests created by the authenticated user.

**URL**: `/api/requests/my`  
**Method**: `GET`  
**Auth required**: Yes  
**Permissions**: Any authenticated user

**Success Response**:

- **Code**: 200
- **Content**: Array of request objects (same format as Get All Requests)

### Update Request

Update an existing request (only if status is "in process").

**URL**: `/api/requests/:requestId`  
**Method**: `PUT`  
**Auth required**: Yes  
**Permissions**: Admin, Author

**Request Body**: Same as Create Request (all fields optional)

**Success Response**:

- **Code**: 200
- **Content**: Updated request object

**Error Responses**:

- **Code**: 400
  - Invalid request ID format
  - Cannot update non-pending request
- **Code**: 401
  - Authentication required
- **Code**: 403
  - Not authorized to update this request
- **Code**: 404
  - Request not found
- **Code**: 500
  - Server error

### Delete Request

Delete a request (only if status is "in process").

**URL**: `/api/requests/:requestId`  
**Method**: `DELETE`  
**Auth required**: Yes  
**Permissions**: Admin, Author

**Success Response**:

- **Code**: 200
- **Content**:

```json
{
  "message": "Request deleted successfully"
}
```

### Approve Request

Approve a pending request.

**URL**: `/api/requests/:requestId/approve`  
**Method**: `POST`  
**Auth required**: Yes  
**Permissions**: Admin, Municipality

**Success Response**:

- **Code**: 200
- **Content**: Updated request object with status: "approved"

### Deny Request

Deny a pending request.

**URL**: `/api/requests/:requestId/deny`  
**Method**: `POST`  
**Auth required**: Yes  
**Permissions**: Admin, Municipality

**Request Body**:

```json
{
  "reason": "string"
}
```

**Success Response**:

- **Code**: 200
- **Content**: Updated request object with status: "deny"

### Pay Request

Pay for an approved request.

**URL**: `/api/requests/:requestId/pay`  
**Method**: `POST`  
**Auth required**: Yes  
**Permissions**: Admin, Donor, Organization, Municipality

**Success Response**:

- **Code**: 200
- **Content**: Updated request object with payment details

**Error Responses**:

- **Code**: 400
  - Request not approved
  - Already paid
- **Code**: 401
  - Authentication required
- **Code**: 403
  - Not authorized to pay for requests
- **Code**: 404
  - Request not found
- **Code**: 500
  - Server error

## Status Flow

1. "in process" (Initial state)
   - Can be updated or deleted by author
   - Can be approved or denied by Admin/Municipality
2. "approved"
   - Can be paid by Donor/Organization/Municipality
   - Cannot be updated or deleted
3. "deny"
   - Cannot be updated, deleted, or paid
   - Includes denial reason

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
