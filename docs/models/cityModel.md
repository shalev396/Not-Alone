# City Model

## Overview

The City model represents cities in the system where soldiers can be stationed and services can be provided. Each city has municipality users who manage it, soldiers who are stationed there, and various details about the city itself.

## Schema

```typescript
interface ICity {
  name: string;
  zone: "north" | "south" | "center";
  soldiers: mongoose.Types.ObjectId[];
  municipalityUsers: mongoose.Types.ObjectId[];
  media: string[];
  bio: string;
  approvalStatus: "pending" | "approved" | "denied";
  approvalDate?: Date;
  denialReason?: string;
  pendingJoins: {
    userId: mongoose.Types.ObjectId;
    type: "Soldier" | "Municipality";
  }[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Fields

| Field               | Type       | Required | Description                                      |
| ------------------- | ---------- | -------- | ------------------------------------------------ |
| `name`              | string     | Yes      | City name (must be unique)                       |
| `zone`              | string     | Yes      | Geographic zone (north, south, or center)        |
| `soldiers`          | ObjectId[] | No       | Array of soldier user IDs stationed in the city  |
| `municipalityUsers` | ObjectId[] | No       | Array of municipality user IDs managing the city |
| `media`             | string[]   | No       | Array of media URLs associated with the city     |
| `bio`               | string     | Yes      | City description/biography                       |
| `approvalStatus`    | string     | Yes      | Current approval status of the city              |
| `approvalDate`      | Date       | No       | Date when the city was approved                  |
| `denialReason`      | string     | No       | Reason if city was denied                        |
| `pendingJoins`      | Object[]   | No       | Array of pending join requests                   |
| `createdAt`         | Date       | Yes      | Timestamp when the city was created              |
| `updatedAt`         | Date       | Yes      | Timestamp when the city was last updated         |

### Indexes

- `name`: Unique index for city names
- `zone`: For finding cities in a specific zone
- `soldiers`: For finding cities by soldier
- `municipalityUsers`: For finding cities by municipality user
- `approvalStatus`: For filtering cities by status

### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Tel Aviv",
  "zone": "center",
  "soldiers": ["507f1f77bcf86cd799439012"],
  "municipalityUsers": ["507f1f77bcf86cd799439013"],
  "media": ["city-image.jpg"],
  "bio": "The city that never stops",
  "approvalStatus": "approved",
  "approvalDate": "2024-01-01T00:00:00.000Z",
  "pendingJoins": [
    {
      "userId": "507f1f77bcf86cd799439014",
      "type": "Soldier"
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Usage

```typescript
// Creating a new city
const city = await CityModel.create({
  name: "New City",
  zone: "north",
  bio: "A beautiful city in the north",
});

// Finding cities in a zone
const citiesInZone = await CityModel.find({
  zone: "center",
  approvalStatus: "approved",
});

// Adding a soldier to a city
await CityModel.findByIdAndUpdate(cityId, {
  $addToSet: { soldiers: soldierId },
});

// Adding a pending join request
await CityModel.findByIdAndUpdate(cityId, {
  $push: {
    pendingJoins: {
      userId: userId,
      type: "Soldier",
    },
  },
});
```

## Geographic Zones

- **North**: Northern region of the country
- **Center**: Central region of the country
- **South**: Southern region of the country

## Security Considerations

1. City names must be unique across the system
2. Only approved cities should be visible in public queries
3. Municipality users should only manage their assigned cities
4. Soldiers should only be able to join approved cities
5. Pending join requests should be managed by municipality users or admins
6. Media URLs should be validated and sanitized
7. Zone values should be strictly enforced to valid options
