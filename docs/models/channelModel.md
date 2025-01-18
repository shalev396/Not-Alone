# Channel Model

## Overview

The Channel model represents communication channels in the system, supporting direct messages, group chats, and eatup-specific channels. Each channel can have multiple members and specific settings based on its type.

## Schema

```typescript
interface IChannel {
  name: string;
  type: "direct" | "group" | "eatup";
  members: mongoose.Types.ObjectId[];
  eatupId?: mongoose.Types.ObjectId;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Fields

| Field       | Type       | Required | Description                                             |
| ----------- | ---------- | -------- | ------------------------------------------------------- |
| `name`      | string     | Yes      | Channel name                                            |
| `type`      | string     | Yes      | Type of channel (direct, group, or eatup)               |
| `members`   | ObjectId[] | Yes      | Array of user IDs who are members of the channel        |
| `eatupId`   | ObjectId   | No\*     | Reference to associated eatup (required for eatup type) |
| `isPublic`  | boolean    | No       | Whether the channel is public (defaults to false)       |
| `createdAt` | Date       | Yes      | Timestamp when the channel was created                  |
| `updatedAt` | Date       | Yes      | Timestamp when the channel was last updated             |

\*Required only when type is "eatup"

### Indexes

- `members`: For finding channels by member
- `eatupId`: For finding channels associated with an eatup (sparse index)
- `type`: For filtering channels by type
- Compound indexes for common queries

### Virtuals

- `memberDetails`: Populates member user information
- `eatupDetails`: Populates associated eatup information for eatup-type channels

### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Team Chat",
  "type": "group",
  "members": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"],
  "isPublic": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Usage

```typescript
// Creating a new channel
const channel = await ChannelModel.create({
  name: "New Channel",
  type: "group",
  members: [userId1, userId2],
  isPublic: false,
});

// Finding channels for a user
const userChannels = await ChannelModel.find({
  members: userId,
}).populate("memberDetails");

// Getting channel with all related data
const channelDetails = await ChannelModel.findById(channelId)
  .populate("memberDetails")
  .populate("eatupDetails");

// Adding a member to a channel
await ChannelModel.findByIdAndUpdate(channelId, {
  $addToSet: { members: newMemberId },
});
```

## Channel Types

1. **Direct**: One-on-one private conversations between two users
2. **Group**: Multi-user conversations
3. **Eatup**: Special channels associated with eatup events

## Security Considerations

1. Direct channels should always have exactly two members
2. Group channels should enforce member limits
3. Eatup channels should validate the existence of the associated eatup
4. Members array should contain unique user IDs
5. Channel access should be restricted to members only
6. Public channels should still validate membership for write operations
