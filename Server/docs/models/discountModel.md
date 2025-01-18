# Discount Model

## Overview

The Discount model represents promotional offers and discounts provided by businesses to soldiers. Each discount has specific terms, validity period, and can be associated with a particular business or city. The model tracks usage and ensures proper validation of discount terms.

## Schema

```typescript
interface IDiscount {
  businessId: mongoose.Types.ObjectId;
  cityId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  terms: string;
  discountType: "percentage" | "fixed" | "bogo" | "other";
  discountValue?: number;
  startDate: Date;
  endDate: Date;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
  media?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Fields

| Field           | Type     | Required | Description                                     |
| --------------- | -------- | -------- | ----------------------------------------------- |
| `businessId`    | ObjectId | Yes      | Reference to the business offering the discount |
| `cityId`        | ObjectId | Yes      | Reference to the city where discount is valid   |
| `title`         | string   | Yes      | Short title of the discount                     |
| `description`   | string   | Yes      | Detailed description of the offer               |
| `terms`         | string   | Yes      | Terms and conditions of the discount            |
| `discountType`  | string   | Yes      | Type of discount (percentage/fixed/bogo/other)  |
| `discountValue` | number   | No       | Value of the discount (if applicable)           |
| `startDate`     | Date     | Yes      | When the discount becomes valid                 |
| `endDate`       | Date     | Yes      | When the discount expires                       |
| `maxUses`       | number   | No       | Maximum number of times discount can be used    |
| `currentUses`   | number   | Yes      | Number of times discount has been used          |
| `isActive`      | boolean  | Yes      | Whether the discount is currently active        |
| `media`         | string[] | No       | Array of promotional media URLs                 |
| `createdAt`     | Date     | Yes      | When the discount was created                   |
| `updatedAt`     | Date     | Yes      | When the discount was last updated              |

### Validation Rules

- `title`: 5-100 characters
- `description`: 10-500 characters
- `terms`: 10-1000 characters
- `discountType`: Must be one of the defined types
- `discountValue`: Must be positive if provided
- `endDate`: Must be after startDate
- `maxUses`: Must be positive if provided
- `currentUses`: Non-negative integer
- `media`: Maximum 5 items

### Indexes

- `businessId`: For finding discounts by business
- `cityId`: For finding discounts in a city
- `isActive`: For filtering active discounts
- Compound indexes:
  - `[businessId, isActive]`: For finding active discounts by business
  - `[cityId, isActive]`: For finding active discounts in a city
  - `[startDate, endDate]`: For finding valid discounts
  - `[discountType, isActive]`: For finding specific types of active discounts

### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "businessId": "507f1f77bcf86cd799439012",
  "cityId": "507f1f77bcf86cd799439013",
  "title": "50% Off for Soldiers",
  "description": "Half price on all menu items for active duty soldiers",
  "terms": "Must present valid military ID. Not valid with other offers.",
  "discountType": "percentage",
  "discountValue": 50,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.999Z",
  "maxUses": 1000,
  "currentUses": 45,
  "isActive": true,
  "media": ["https://example.com/promo1.jpg"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Usage

```typescript
// Creating a new discount
const discount = await DiscountModel.create({
  businessId: businessId,
  cityId: cityId,
  title: "50% Off for Soldiers",
  description: "Half price on all menu items",
  terms: "Must present valid military ID",
  discountType: "percentage",
  discountValue: 50,
  startDate: new Date(),
  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
  maxUses: 1000,
  isActive: true,
});

// Finding active discounts in a city
const cityDiscounts = await DiscountModel.find({
  cityId: cityId,
  isActive: true,
  startDate: { $lte: new Date() },
  endDate: { $gte: new Date() },
}).populate("businessId");

// Incrementing discount usage
await DiscountModel.findByIdAndUpdate(discountId, {
  $inc: { currentUses: 1 },
});

// Deactivating expired discounts
await DiscountModel.updateMany(
  {
    endDate: { $lt: new Date() },
  },
  {
    isActive: false,
  }
);
```

## Discount Types

- `percentage`: Percentage off regular price
- `fixed`: Fixed amount off
- `bogo`: Buy one get one free
- `other`: Custom discount type

## Security Considerations

1. Only business owners can create/modify their discounts
2. Discount usage must be properly tracked
3. Date validations must be enforced
4. Media URLs must be validated
5. Usage limits must be enforced
6. Discount values must be validated
7. Terms must be properly formatted
8. Expired discounts must be automatically deactivated
9. Usage tracking must be atomic
10. Business and city existence must be verified
