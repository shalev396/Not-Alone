# Socket Service Documentation

## Overview

The Socket Service provides real-time communication capabilities for the application, supporting features like instant messaging, typing indicators, and live updates. The service uses Socket.IO for WebSocket connections and integrates with the existing authentication system.

## Table of Contents

- [Connection Setup](#connection-setup)
- [Authentication](#authentication)
- [Channel Events](#channel-events)
- [Message Events](#message-events)
- [User Status Events](#user-status-events)
- [Error Handling](#error-handling)

## Connection Setup

### Client Connection

To connect to the WebSocket server:

```typescript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: {
    token: "your-jwt-token",
  },
});
```

### Connection Options

```typescript
{
  auth: {
    token: string; // JWT token for authentication
  },
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
}
```

## Authentication

The service uses JWT tokens for authentication. Each connection must provide a valid token.

### Authentication Flow

1. Client provides JWT token in connection auth
2. Server validates token using auth middleware
3. On successful auth, user is added to their personal room
4. Failed auth results in connection rejection

### Example Error Handling

```typescript
socket.on("connect_error", (error) => {
  if (error.message === "Authentication failed") {
    // Handle authentication failure
  }
});
```

## Channel Events

Events related to channel management and updates.

### Joining a Channel

```typescript
// Client emits
socket.emit("join:channel", { channelId: "channel-id" });

// Client listens
socket.on("channel:joined", (data) => {
  console.log(`Joined channel: ${data.channelId}`);
});
```

### Leaving a Channel

```typescript
// Client emits
socket.emit("leave:channel", { channelId: "channel-id" });

// Client listens
socket.on("channel:left", (data) => {
  console.log(`Left channel: ${data.channelId}`);
});
```

### Channel Updates

```typescript
// Client listens
socket.on("channel:updated", (data) => {
  console.log("Channel updated:", data);
});

socket.on("channel:deleted", (data) => {
  console.log("Channel deleted:", data.channelId);
});

socket.on("member:added", (data) => {
  console.log("New member added:", data);
});

socket.on("member:removed", (data) => {
  console.log("Member removed:", data);
});
```

## Message Events

Events related to real-time messaging.

### New Message

```typescript
// Client emits
socket.emit("message:send", {
  channelId: "channel-id",
  content: "Hello everyone!",
});

// Client listens
socket.on("message:received", (message) => {
  console.log("New message:", message);
});
```

### Message Updates

```typescript
// Client listens
socket.on("message:updated", (data) => {
  console.log("Message updated:", data);
});

socket.on("message:deleted", (data) => {
  console.log("Message deleted:", data.messageId);
});
```

### Typing Indicators

```typescript
// Client emits
socket.emit("typing:start", { channelId: "channel-id" });
socket.emit("typing:stop", { channelId: "channel-id" });

// Client listens
socket.on("user:typing", (data) => {
  console.log(`${data.user.firstName} is typing...`);
});

socket.on("user:stopped-typing", (data) => {
  console.log(`${data.user.firstName} stopped typing`);
});
```

## User Status Events

Events related to user presence and status.

### User Status Updates

```typescript
// Client listens
socket.on("user:online", (data) => {
  console.log(`User ${data.userId} is online`);
});

socket.on("user:offline", (data) => {
  console.log(`User ${data.userId} is offline`);
});

socket.on("user:away", (data) => {
  console.log(`User ${data.userId} is away`);
});
```

### Last Active Updates

```typescript
// Client listens
socket.on("user:last-active", (data) => {
  console.log(`User ${data.userId} was last active at ${data.lastActive}`);
});
```

## Error Handling

### Connection Errors

```typescript
socket.on("connect_error", (error) => {
  console.error("Connection error:", error.message);
});

socket.on("connect_timeout", () => {
  console.error("Connection timeout");
});
```

### Event Errors

```typescript
socket.on("error", (error) => {
  console.error("Socket error:", error.message);
});

socket.on("channel:error", (error) => {
  console.error("Channel error:", error.message);
});

socket.on("message:error", (error) => {
  console.error("Message error:", error.message);
});
```

## TypeScript Interfaces

### Socket Event Types

```typescript
interface SocketUser {
  _id: string;
  firstName: string;
  lastName: string;
}

interface MessageData {
  _id: string;
  channelId: string;
  sender: SocketUser;
  content: string;
  createdAt: string;
}

interface ChannelData {
  _id: string;
  name: string;
  type: "direct" | "group" | "eatup";
  members: SocketUser[];
}

interface TypingData {
  channelId: string;
  user: SocketUser;
}
```

## Security Considerations

1. **Authentication**

   - All connections require valid JWT tokens
   - Tokens are validated on every event
   - Invalid tokens result in immediate disconnection

2. **Authorization**

   - Users can only join channels they are members of
   - Message sending is restricted to channel members
   - User status updates are only broadcast to relevant users

3. **Rate Limiting**

   - Message sending is rate-limited
   - Typing indicators have cooldown periods
   - Connection attempts are limited per IP

4. **Data Validation**

   - All incoming events are validated
   - Message content is sanitized
   - Channel IDs are verified to exist

5. **Error Handling**
   - All errors are logged server-side
   - Appropriate error messages are sent to clients
   - Failed operations do not crash the server
