# Profile Model

## Overview

The Profile model represents additional user information and preferences beyond the basic user account details. Each profile is associated with a user and includes customizable fields like nickname, bio, and profile image, as well as privacy settings.

## Schema

```typescript
interface IProfile {
  userId: mongoose.Types.ObjectId;
  nickname: string;
  bio: string;
  profileImage: string;
  visibility: "public" | "private";
  createdAt: Date;
  updatedAt: Date;
}
```

### Fields

| Field          | Type     | Required | Description                                    |
| -------------- | -------- | -------- | ---------------------------------------------- |
| `userId`       | ObjectId | Yes      | Reference to the associated user               |
| `nickname`     | string   | No       | User's preferred display name                  |
| `bio`          | string   | No       | User's biography or description                |
| `profileImage` | string   | No       | URL to user's profile image                    |
| `visibility`   | string   | No       | Profile privacy setting (defaults to "public") |
| `createdAt`    | Date     | Yes      | Timestamp when the profile was created         |
| `updatedAt`    | Date     | Yes      | Timestamp when the profile was last updated    |

### Validation Rules

- `nickname`: Maximum 30 characters
- `bio`: Maximum 500 characters
- `visibility`: Must be either "public" or "private"
- Each text field is trimmed to remove whitespace

### Indexes

- `userId`: For finding a user's profile
- `nickname`: For searching profiles by nickname

### Virtuals

- `user`: Populates associated user information

### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "nickname": "SoldierJohn",
  "bio": "Serving in the IDF, love meeting new people!",
  "profileImage": "profile.jpg",
  "visibility": "public",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Usage

```typescript
// Creating a new profile
const profile = await ProfileModel.create({
  userId: userId,
  nickname: "SoldierJohn",
  bio: "Hello world!",
});

// Finding a user's profile
const userProfile = await ProfileModel.findOne({ userId }).populate("user");

// Updating profile settings
await ProfileModel.findOneAndUpdate(
  { userId },
  {
    bio: "Updated bio",
    visibility: "private",
  },
  { runValidators: true }
);

// Finding public profiles
const publicProfiles = await ProfileModel.find({
  visibility: "public",
}).populate("user");
```

## Default Profile

When a user is created, a default profile should be automatically generated with:

- Empty nickname (will display user's full name)
- Empty bio
- Default profile image
- Public visibility

## Security Considerations

1. Users can only edit their own profiles
2. Profile image URLs should be validated and sanitized
3. Private profiles should only be visible to authorized users
4. Nickname uniqueness should be enforced if required
5. Profile updates should be rate-limited
6. Sensitive user information should not be exposed through profiles
7. Profile visibility changes should be properly validated
