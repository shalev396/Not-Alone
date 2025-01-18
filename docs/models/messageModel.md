# Message Model

## Overview

The Message model represents messages sent within channels in the system. Each message is associated with a specific channel and sender, and includes features like read tracking and real-time updates through WebSocket integration.

## Schema

```typescript
interface IMessage {
  channelId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  isEdited: boolean;
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Fields

| Field       | Type       | Required | Description                                     |
| ----------- | ---------- | -------- | ----------------------------------------------- |
| `channelId` | ObjectId   | Yes      | Reference to the channel the message belongs to |
| `sender`    | ObjectId   | Yes      | Reference to the user who sent the message      |
| `content`   | string     | Yes      | The message text content                        |
| `isEdited`  | boolean    | No       | Whether the message has been edited             |
| `readBy`    | ObjectId[] | No       | Array of user IDs who have read the message     |
| `createdAt` | Date       | Yes      | Timestamp when the message was created          |
| `updatedAt` | Date       | Yes      | Timestamp when the message was last updated     |

### Validation Rules

- `content`: 1-5000 characters
- `channelId`: Must reference a valid channel
- `sender`: Must be a member of the channel
- `readBy`: Must contain unique user IDs

### Indexes

- `channelId`: For finding messages in a channel
- `sender`: For finding messages by sender
- Compound indexes:
  - `[channelId, createdAt]`: For efficient message retrieval
  - `[sender, createdAt]`: For user message history

### Virtuals

- `senderDetails`: Populates sender user information
- `channelDetails`: Populates channel information

### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "channelId": "507f1f77bcf86cd799439012",
  "sender": "507f1f77bcf86cd799439013",
  "content": "Hello everyone!",
  "isEdited": false,
  "readBy": ["507f1f77bcf86cd799439014", "507f1f77bcf86cd799439015"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Usage

```typescript
// Creating a new message
const message = await MessageModel.create({
  channelId: channelId,
  sender: userId,
  content: "New message content",
});

// Finding messages in a channel with pagination
const messages = await MessageModel.find({ channelId })
  .sort({ createdAt: -1 })
  .limit(50)
  .populate("senderDetails");

// Marking a message as read
await MessageModel.findByIdAndUpdate(messageId, {
  $addToSet: { readBy: userId },
});

// Editing a message
await MessageModel.findOneAndUpdate(
  { _id: messageId, sender: userId },
  {
    content: "Updated content",
    isEdited: true,
  }
);
```

## WebSocket Integration

Messages are integrated with WebSocket functionality for real-time features:

- Message creation notifications
- Read status updates
- Edit notifications
- Typing indicators

## Security Considerations

1. Users can only send messages in channels they are members of
2. Message edits should only be allowed for the sender
3. Read status should only be updated by channel members
4. Content should be sanitized to prevent XSS attacks
5. Message retrieval should respect channel access permissions
6. Rate limiting should be implemented for message sending
7. Large message content should be properly handled
