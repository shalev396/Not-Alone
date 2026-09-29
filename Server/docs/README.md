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

## MongoDB Atlas IAM authentication

The API authenticates to Atlas (`atlas-mongodb-cluster`, project `mongodb-projects`) with its AWS identity instead of a password (`MONGODB-AWS`). `DATABASE_URL` (and `DATABASE_URL_TEST`) carry no credentials:

```
mongodb+srv://atlas-mongodb-cluster.9gmhoze.mongodb.net/<database>?authSource=%24external&authMechanism=MONGODB-AWS&retryWrites=true&w=majority&appName=notalonesoldier-<stage>
```

| Stage | Database        | Used by                                      |
| ----- | --------------- | -------------------------------------------- |
| prod  | `NotAlone-Prod` | Lambda (`DATABASE_URL`)                      |
| qa    | `NotAlone-Qa`   | Jest / E2E, locally and in CI (`DATABASE_URL_TEST`) |

The driver (with its optional `aws4` and `@aws-sdk/credential-providers` dependencies, both required: without `aws4` it fails with "Optional module `aws4` not found") signs an STS request with whatever AWS credentials the process has, and Atlas matches the caller's role ARN to a database user. No IAM policy is involved, so the same URL works locally and on Lambda. Each identity needs an Atlas database user of type **AWS IAM → IAM Role**:

| Identity                                   | Atlas roles                                              |
| ------------------------------------------ | -------------------------------------------------------- |
| `notalonesoldier-<stage>-api` (Lambda)     | `readWrite` + `dbAdmin` on that stage's database only    |
| `my-github-actions-role` (CI OIDC)         | `readWriteAnyDatabase` + `dbAdminAnyDatabase`            |
| Local SSO role (`AWSReservedSSO_…`)        | `readWriteAnyDatabase` + `dbAdminAnyDatabase`            |

- The Lambda execution role name is pinned in [`serverless.yml`](../serverless.yml) (`provider.iam.role.name`), so its ARN survives stack updates; the stack output `ApiRoleArn` shows it. Changing the name or the app name means a new Atlas user.
- Register an assumed role by its ARN **without the IAM path**: `arn:aws:iam::<account>:role/aws-reserved/sso.amazonaws.com/<region>/AWSReservedSSO_…` becomes `arn:aws:iam::<account>:role/AWSReservedSSO_…`.
- Locally, run `aws sso login` when the session expires. CI test jobs get credentials through `aws-actions/configure-aws-credentials` (OIDC).
- The Atlas IP access list stays `0.0.0.0/0`: Lambda has no fixed IP.
- The Socket.IO server on Render has no AWS credentials (Render OIDC needs a Pro workspace), so it uses the Atlas **password** user `notalonesoldier-render` (`readWrite` + `dbAdmin` on `NotAlone-Prod` and `NotAlone-Qa`), set in the Render dashboard with a normal `mongodb+srv://user:password@…` URL.
