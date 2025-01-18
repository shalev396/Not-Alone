# Donation Model

## Overview

The Donation model represents items donated by users to soldiers. Each donation has a specific category, location details, and tracks its status from creation to delivery. Donations can be assigned to specific soldiers for pickup.

## Schema

```typescript
interface IDonation {
  city: mongoose.Types.ObjectId;
  address: string;
  category: "Furniture" | "Clothes" | "Electricity" | "Army Equipments";
  donorId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  media: string[];
  status: "pending" | "assigned" | "delivery" | "arrived";
  assignedTo?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

### Fields

| Field         | Type     | Required | Description                                     |
| ------------- | -------- | -------- | ----------------------------------------------- |
| `city`        | ObjectId | Yes      | Reference to the city where donation is located |
| `address`     | string   | Yes      | Physical address for pickup                     |
| `category`    | string   | Yes      | Type of donation                                |
| `donorId`     | ObjectId | Yes      | Reference to the user who made the donation     |
| `title`       | string   | Yes      | Title/name of the donation                      |
| `description` | string   | No       | Detailed description of the donated items       |
| `media`       | string[] | No       | Array of media URLs (images/videos)             |
| `status`      | string   | Yes      | Current status of the donation                  |
| `assignedTo`  | ObjectId | No       | Reference to the soldier assigned for pickup    |
| `createdAt`   | Date     | Yes      | Timestamp when the donation was created         |
| `updatedAt`   | Date     | Yes      | Timestamp when the donation was last updated    |

### Validation Rules

- `address`: 5-200 characters
- `category`: Must be one of the predefined types
- `media`: Array of URLs
- `status`: Must be one of: pending, assigned, delivery, arrived

### Indexes

- `city`: For finding donations in a specific city
- `category`: For filtering by donation type
- `donorId`: For finding donations by donor
- `status`: For filtering by current status

### Virtuals

- `donor`: Populates donor user information
- `cityDetails`: Populates city information
- `assignedSoldier`: Populates assigned soldier information

### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "city": "507f1f77bcf86cd799439012",
  "address": "123 Main St, Tel Aviv",
  "category": "Furniture",
  "donorId": "507f1f77bcf86cd799439013",
  "title": "Office Chair",
  "description": "Ergonomic office chair in good condition",
  "media": ["chair1.jpg", "chair2.jpg"],
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Usage

```typescript
// Creating a new donation
const donation = await DonationModel.create({
  city: cityId,
  address: "123 Main St",
  category: "Furniture",
  donorId: userId,
  title: "Office Chair",
  description: "Ergonomic chair",
});

// Finding donations in a city
const cityDonations = await DonationModel.find({
  city: cityId,
  status: "pending",
}).populate("donor");

// Assigning a donation to a soldier
await DonationModel.findByIdAndUpdate(donationId, {
  status: "assigned",
  assignedTo: soldierId,
});

// Getting donation with all details
const donationDetails = await DonationModel.findById(donationId)
  .populate("donor")
  .populate("cityDetails")
  .populate("assignedSoldier");
```

## Donation Categories

- **Furniture**: Chairs, tables, beds, etc.
- **Clothes**: Military and civilian clothing
- **Electricity**: Electronic devices and appliances
- **Army Equipments**: Military-specific gear and equipment

## Security Considerations

1. Only authenticated users can create donations
2. Donors can only modify their own donations
3. Only soldiers in the same city can be assigned to donations
4. Media URLs should be validated and sanitized
5. Address information should be protected
6. Status changes should be properly tracked and logged
7. Assigned soldiers should have exclusive access to donation details
