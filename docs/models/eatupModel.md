# Eatup Model

## Overview

The Eatup model represents social dining events organized for soldiers. These events can be hosted by organizations, donors, or cities, and include details such as location, date, dietary preferences, and language options. The model tracks event details and manages guest attendance.

## Schema

```typescript
interface IEatup {
  city: mongoose.Types.ObjectId;
  title: string;
  authorId: mongoose.Types.ObjectId;
  media: string[];
  date: Date;
  kosher: boolean;
  description: string;
  languages: string[];
  hosting: "organization" | "donators" | "city";
  limit: number;
  guests: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Fields

| Field         | Type       | Required | Description                                   |
| ------------- | ---------- | -------- | --------------------------------------------- |
| `city`        | ObjectId   | Yes      | Reference to the city where event takes place |
| `title`       | string     | Yes      | Event title                                   |
| `authorId`    | ObjectId   | Yes      | Reference to the user who created the event   |
| `media`       | string[]   | No       | Array of media URLs (images/videos)           |
| `date`        | Date       | Yes      | Date and time of the event                    |
| `kosher`      | boolean    | Yes      | Whether kosher food is provided               |
| `description` | string     | Yes      | Detailed description of the event             |
| `languages`   | string[]   | Yes      | Languages spoken at the event                 |
| `hosting`     | string     | Yes      | Type of host (organization/donators/city)     |
| `limit`       | number     | Yes      | Maximum number of guests                      |
| `guests`      | ObjectId[] | No       | Array of user IDs who are attending           |
| `createdAt`   | Date       | Yes      | Timestamp when the event was created          |
| `updatedAt`   | Date       | Yes      | Timestamp when the event was last updated     |

### Validation Rules

- `title`: 3-100 characters
- `description`: 10-1000 characters
- `media`: Maximum 10 items
- `date`: Must be in the future
- `languages`: 1-5 languages required
- `limit`: Between 2 and 100 guests
- `guests`: Cannot exceed the limit

### Indexes

- `city`: For finding events in a city
- `date`: For finding upcoming events
- `hosting`: For filtering by host type
- Compound indexes:
  - `[city, date]`: For city-specific upcoming events
  - `[authorId, date]`: For author's upcoming events
  - `[hosting, city]`: For host-specific city events

### Virtuals

- `author`: Populates author user information
- `cityDetails`: Populates city information
- `guestDetails`: Populates guest user information
- `availableSpots`: Calculates remaining spots
- `isFull`: Indicates if event is at capacity

### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "city": "507f1f77bcf86cd799439012",
  "title": "Friday Night Dinner",
  "authorId": "507f1f77bcf86cd799439013",
  "media": ["dinner1.jpg", "dinner2.jpg"],
  "date": "2024-01-15T18:00:00.000Z",
  "kosher": true,
  "description": "Join us for a traditional Friday night dinner",
  "languages": ["Hebrew", "English"],
  "hosting": "organization",
  "limit": 20,
  "guests": ["507f1f77bcf86cd799439014"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Usage

```typescript
// Creating a new eatup
const eatup = await EatupModel.create({
  city: cityId,
  title: "Shabbat Dinner",
  authorId: userId,
  date: new Date("2024-01-15T18:00:00Z"),
  kosher: true,
  description: "Traditional dinner",
  languages: ["Hebrew", "English"],
  hosting: "organization",
  limit: 20,
});

// Finding upcoming events in a city
const cityEvents = await EatupModel.find({
  city: cityId,
  date: { $gt: new Date() },
}).sort({ date: 1 });

// Adding a guest
await EatupModel.findByIdAndUpdate(
  eatupId,
  {
    $addToSet: { guests: guestId },
  },
  {
    runValidators: true,
  }
);

// Getting event with all details
const eventDetails = await EatupModel.findById(eatupId)
  .populate("author")
  .populate("cityDetails")
  .populate("guestDetails");
```

## Security Considerations

1. Only authorized users (organizations, donors, municipalities) can create events
2. Event dates must be validated server-side
3. Guest list modifications should be properly authorized
4. Media URLs should be validated and sanitized
5. Guest limit should be strictly enforced
6. City-specific events should respect city membership
7. Event modifications should be restricted to authors and admins
