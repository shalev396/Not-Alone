# Request Model

## Overview

The Request model represents assistance requests made by soldiers. Each request specifies items or services needed, includes location information, and tracks the status of fulfillment. The model supports both regular service and reserves requests.

## Schema

```typescript
interface IRequest {
  authorId: mongoose.Types.ObjectId;
  service: "Regular" | "Reserves";
  item: string;
  itemDescription: string;
  quantity: number;
  zone: "north" | "center" | "south";
  city: mongoose.Types.ObjectId;
  agreeToShareDetails: boolean;
  status: "approved" | "deny" | "in process";
  paid: boolean;
  paidBy?: mongoose.Types.ObjectId;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Fields

| Field                 | Type     | Required | Description                                 |
| --------------------- | -------- | -------- | ------------------------------------------- |
| `authorId`            | ObjectId | Yes      | Reference to the soldier making the request |
| `service`             | string   | Yes      | Type of military service                    |
| `item`                | string   | Yes      | Title/name of the requested item            |
| `itemDescription`     | string   | Yes      | Detailed description of what is needed      |
| `quantity`            | number   | Yes      | Number of items requested                   |
| `zone`                | string   | Yes      | Geographic zone where item is needed        |
| `city`                | ObjectId | Yes      | Reference to the specific city              |
| `agreeToShareDetails` | boolean  | Yes      | Consent to share request details            |
| `status`              | string   | Yes      | Current status of the request               |
| `paid`                | boolean  | No       | Whether the request has been paid for       |
| `paidBy`              | ObjectId | No       | Reference to user who paid                  |
| `paidAt`              | Date     | No       | Timestamp when payment was made             |
| `createdAt`           | Date     | Yes      | Timestamp when the request was created      |
| `updatedAt`           | Date     | Yes      | Timestamp when the request was last updated |

### Validation Rules

- `item`: 2-100 characters
- `itemDescription`: 10-1000 characters
- `quantity`: Positive integer
- `zone`: Must be one of: north, center, south
- `city`: Must exist in the database
- `agreeToShareDetails`: Must be true
- `status`: Must be one of: approved, deny, in process

### Indexes

- `authorId`: For finding requests by author
- `zone`: For finding requests in a zone
- `city`: For finding requests in a city
- `status`: For filtering by status
- Compound indexes:
  - `[authorId, status]`: For finding user's requests by status
  - `[zone, status]`: For finding active requests in a zone
  - `[city, status]`: For finding active requests in a city
  - `[createdAt]`: For chronological sorting

### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "authorId": "507f1f77bcf86cd799439012",
  "service": "Regular",
  "item": "Tactical Backpack",
  "itemDescription": "Need a durable tactical backpack for field operations",
  "quantity": 1,
  "zone": "north",
  "city": "507f1f77bcf86cd799439013",
  "agreeToShareDetails": true,
  "status": "in process",
  "paid": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Usage

```typescript
// Creating a new request
const request = await RequestModel.create({
  authorId: userId,
  service: "Regular",
  item: "Tactical Backpack",
  itemDescription: "Need a durable backpack",
  quantity: 1,
  zone: "north",
  city: cityId,
  agreeToShareDetails: true,
});

// Finding requests in a city
const cityRequests = await RequestModel.find({
  city: cityId,
  status: "in process",
}).populate("author");

// Updating request status
await RequestModel.findByIdAndUpdate(requestId, {
  status: "approved",
  paid: true,
  paidBy: donorId,
  paidAt: new Date(),
});

// Finding user's requests
const userRequests = await RequestModel.find({
  authorId: userId,
}).sort({ createdAt: -1 });
```

## Pre-save Middleware

The model includes middleware to:

1. Validate that the city exists
2. Ensure city zone matches request zone
3. Perform any necessary cleanup or formatting

## Security Considerations

1. Only soldiers can create requests
2. Users can only modify their own requests
3. Status changes should be properly authorized
4. City and zone consistency must be maintained
5. Payment information should be protected
6. Request visibility should respect user preferences
7. Rate limiting should be implemented for request creation
