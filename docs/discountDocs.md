# Discount API Documentation

## Discount Management Process

The system implements a discount management system tied to businesses. Here's how it works:

### 1. Discount Creation

1. Business owner creates discounts for their business
   - Must be authenticated as the business owner or admin
   - Discounts are automatically linked to the business
   - Each discount has an expiration date

### 2. Discount Lifecycle

1. Active discounts:
   - Appear in business details
   - Can be viewed by all authenticated users
   - Automatically filtered by expiration date
2. Expired discounts:
   - Remain in the system but marked as expired
   - Not shown in public business listings

## Table of Contents

- [Public Endpoints](#public-endpoints)
  - [Get Business Discounts](#get-business-discounts)
  - [Get Discount by ID](#get-discount-by-id)
- [Business Owner Endpoints](#business-owner-endpoints)
  - [Create Discount](#create-discount)
  - [Update Discount](#update-discount)
  - [Delete Discount](#delete-discount)

## Public Endpoints

### Get Business Discounts

Get all discounts for a specific business.

**URL**: `/api/discounts/business/:businessId`  
**Method**: `GET`  
**Auth required**: Yes

**URL Parameters**:

- `businessId`: Business ID

**Success Response**:

- **Code**: 200
- **Content**:

```json
[
  {
    "_id": "discount_id",
    "name": "Summer Sale",
    "discount": "20% off",
    "expireDate": "2024-12-31T23:59:59.999Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Discount by ID

Get details of a specific discount.

**URL**: `/api/discounts/:discountId`  
**Method**: `GET`  
**Auth required**: Yes

**URL Parameters**:

- `discountId`: Discount ID

**Success Response**:

- **Code**: 200
- **Content**: Single discount object (same format as above)

**Error Responses**:

- **Code**: 400
  - Invalid discount ID format
- **Code**: 404
  - Discount not found

## Business Owner Endpoints

### Create Discount

Create a new discount for a business.

**URL**: `/api/discounts/business/:businessId`  
**Method**: `POST`  
**Auth required**: Yes (Business Owner or Admin)

**URL Parameters**:

- `businessId`: Business ID

**Request Body**:

```json
{
  "name": "string",
  "discount": "string",
  "expireDate": "date"
}
```

**Body Parameters**:

- `name` (required): Discount name (2-100 characters)
- `discount` (required): Discount description (1-50 characters)
- `expireDate` (required): Expiration date (must be future date)

**Success Response**:

- **Code**: 201
- **Content**: Created discount object

**Error Responses**:

- **Code**: 400
  - Validation errors
  - Invalid business ID
- **Code**: 401
  - Authentication required
- **Code**: 403
  - Not authorized (not business owner or admin)
- **Code**: 404
  - Business not found

### Update Discount

Update an existing discount.

**URL**: `/api/discounts/business/:businessId/:discountId`  
**Method**: `PUT`  
**Auth required**: Yes (Business Owner or Admin)

**URL Parameters**:

- `businessId`: Business ID
- `discountId`: Discount ID

**Request Body**:

```json
{
  "name": "string",
  "discount": "string",
  "expireDate": "date"
}
```

**Success Response**:

- **Code**: 200
- **Content**: Updated discount object

**Error Responses**:

- **Code**: 400
  - Invalid ID format
  - Validation errors
- **Code**: 403
  - Not authorized
- **Code**: 404
  - Business or discount not found

### Delete Discount

Delete an existing discount.

**URL**: `/api/discounts/business/:businessId/:discountId`  
**Method**: `DELETE`  
**Auth required**: Yes (Business Owner or Admin)

**URL Parameters**:

- `businessId`: Business ID
- `discountId`: Discount ID

**Success Response**:

- **Code**: 200
- **Content**:

```json
{
  "message": "Discount deleted successfully"
}
```

**Error Responses**:

- **Code**: 400
  - Invalid ID format
- **Code**: 403
  - Not authorized
- **Code**: 404
  - Business or discount not found

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
  "error": "Not authorized to manage discounts for this business"
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
