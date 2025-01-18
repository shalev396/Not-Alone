# Business Model

## Overview

The Business model represents businesses that offer services or discounts to soldiers. Each business has an owner, can have multiple workers, and must be approved before becoming active in the system. The model includes details about the business location, contact information, and operational status.

## Schema

```typescript
interface IBusiness {
  name: string;
  owner: mongoose.Types.ObjectId;
  workers: mongoose.Types.ObjectId[];
  city: mongoose.Types.ObjectId;
  address: string;
  phone: string;
  email: string;
  description: string;
  category: string;
  approvalStatus: "approved" | "deny" | "in process";
  denialReason?: string;
  openingHours: {
    day: string;
    open: string;
    close: string;
  }[];
  images: string[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Fields

| Field            | Type       | Required | Description                                     |
| ---------------- | ---------- | -------- | ----------------------------------------------- |
| `name`           | string     | Yes      | Business name                                   |
| `owner`          | ObjectId   | Yes      | Reference to the business owner user            |
| `workers`        | ObjectId[] | No       | Array of user IDs who work at the business      |
| `city`           | ObjectId   | Yes      | Reference to the city where business is located |
| `address`        | string     | Yes      | Physical address of the business                |
| `phone`          | string     | Yes      | Contact phone number                            |
| `email`          | string     | Yes      | Contact email address                           |
| `description`    | string     | Yes      | Business description                            |
| `category`       | string     | Yes      | Business category                               |
| `approvalStatus` | string     | Yes      | Current approval status                         |
| `denialReason`   | string     | No       | Reason if approval was denied                   |
| `openingHours`   | Object[]   | Yes      | Array of opening hours for each day             |
| `images`         | string[]   | No       | Array of business image URLs                    |
| `rating`         | number     | Yes      | Average rating (0-5)                            |
| `reviewCount`    | number     | Yes      | Number of reviews received                      |
| `isActive`       | boolean    | Yes      | Whether the business is currently active        |
| `createdAt`      | Date       | Yes      | When the business was created                   |
| `updatedAt`      | Date       | Yes      | When the business was last updated              |

### Validation Rules

- `name`: 2-100 characters
- `address`: 5-200 characters
- `phone`: Valid phone number format
- `email`: Valid email format
- `description`: 10-1000 characters
- `category`: Must be one of the predefined categories
- `openingHours`: Must include valid time formats
- `images`: Maximum 10 images
- `rating`: Number between 0 and 5
- `reviewCount`: Non-negative integer

### Indexes

- `owner`: For finding businesses by owner
- `city`: For finding businesses in a city
- `category`: For finding businesses by category
- `approvalStatus`: For filtering by status
- Compound indexes:
  - `[city, category]`: For finding businesses by city and category
  - `[rating, reviewCount]`: For sorting by popularity
  - `[isActive, approvalStatus]`: For finding active approved businesses

### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "City Cafe",
  "owner": "507f1f77bcf86cd799439012",
  "workers": ["507f1f77bcf86cd799439013"],
  "city": "507f1f77bcf86cd799439014",
  "address": "123 Main St, City Center",
  "phone": "+972501234567",
  "email": "contact@citycafe.com",
  "description": "Cozy cafe offering discounts to soldiers",
  "category": "Food & Beverage",
  "approvalStatus": "approved",
  "openingHours": [
    {
      "day": "Sunday",
      "open": "08:00",
      "close": "22:00"
    }
  ],
  "images": ["https://example.com/image1.jpg"],
  "rating": 4.5,
  "reviewCount": 28,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Common Categories

- Food & Beverage
- Retail
- Services
- Entertainment
- Health & Wellness
- Transportation
- Accommodation
- Education
- Professional Services

## Usage

```typescript
// Creating a new business
const business = await BusinessModel.create({
  name: "City Cafe",
  owner: userId,
  city: cityId,
  address: "123 Main St",
  phone: "+972501234567",
  email: "contact@citycafe.com",
  description: "Cozy cafe",
  category: "Food & Beverage",
  openingHours: [
    {
      day: "Sunday",
      open: "08:00",
      close: "22:00",
    },
  ],
});

// Finding businesses in a city
const cityBusinesses = await BusinessModel.find({
  city: cityId,
  isActive: true,
  approvalStatus: "approved",
}).populate("owner");

// Adding a worker
await BusinessModel.findByIdAndUpdate(businessId, {
  $addToSet: { workers: workerId },
});

// Updating business status
await BusinessModel.findByIdAndUpdate(businessId, {
  approvalStatus: "approved",
  isActive: true,
});
```

## Security Considerations

1. Only business owners can modify their business
2. Workers can only perform authorized actions
3. Images must be validated and sanitized
4. Contact information must be verified
5. Approval process must be secure
6. Rating manipulation must be prevented
7. Opening hours must be validated
8. Category changes must be authorized
9. Worker management must be restricted
10. Business visibility respects approval status
