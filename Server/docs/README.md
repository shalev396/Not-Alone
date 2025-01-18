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

- [Authentication Routes](./routes/authRoutes.md)
- [User Routes](./routes/userRoutes.md)
- [Business Routes](./routes/businessRoutes.md)
- [Channel Routes](./routes/channelRoutes.md)
- [City Routes](./routes/cityRoutes.md)
- [Comment Routes](./routes/commentRoutes.md)
- [Discount Routes](./routes/discountRoutes.md)
- [Donation Routes](./routes/donationRoutes.md)
- [Eatup Routes](./routes/eatupRoutes.md)
- [Message Routes](./routes/messageRoutes.md)
- [Post Routes](./routes/postRoutes.md)
- [Profile Routes](./routes/profileRoutes.md)
- [Request Routes](./routes/requestRoutes.md)

## Services

- [Socket Service](./services/socketService.md)

## Tests

- [Authentication Testing](./tests/authTestDoc.md)

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

### Error Responses

All error responses follow this format:

```json
{
  "error": "Error message description",
  "details": {} // Optional additional error details
}
```

### Request Headers

Common headers required for API requests:

```
Content-Type: application/json
Authorization: Bearer <token>  // For protected routes
```

### Response Format

Successful responses typically follow this format:

```json
{
  "data": {}, // Response data
  "message": "", // Optional success message
  "metadata": {} // Optional metadata (pagination, etc.)
}
```
