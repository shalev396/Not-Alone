# Not Alone API Documentation

## Overview

This documentation provides detailed information about the Not Alone API, including all models, endpoints, and services.

## Models

- [AuditLog Model](./models/auditLogModel.md)
- [Business Model](./models/businessModel.md)
- [Channel Model](./models/channelModel.md)
- [City Model](./models/cityModel.md)
- [Comment Model](./models/commentModel.md)
- [Discount Model](./models/discountModel.md)
- [Donation Model](./models/donationModel.md)
- [Eatup Model](./models/eatupModel.md)
- [Message Model](./models/messageModel.md)
- [Post Model](./models/postModel.md)
- [Profile Model](./models/profileModel.md)
- [Request Model](./models/requestModel.md)
- [User Model](./models/userModel.md)

## API Routes

- [User Routes](./userDoc.md)
- [Business Routes](./businessDocs.md)
- [Channel Routes](./channelDoc.md)
- [City Routes](./cityDoc.md)
- [Comment Routes](./commentDoc.md)
- [Discount Routes](./discountDocs.md)
- [Donation Routes](./donationDoc.md)
- [Eatup Routes](./eatupDoc.md)
- [Message Routes](./messageDoc.md)
- [Post Routes](./postDoc.md)
- [Profile Routes](./profileDoc.md)
- [Request Routes](./requestDoc.md)

## Services

- [Socket Service](./socketDoc.md)

## Tests

- [Auth Tests](./tests/authTestDoc.md)

## Common Patterns

### Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

### User Types

- Admin
- Soldier
- Municipality
- Organization
- Donor
- Business

### Pagination

Many endpoints support pagination with these query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default varies by endpoint)

Example:

```
GET /api/users?page=2&limit=10
```
