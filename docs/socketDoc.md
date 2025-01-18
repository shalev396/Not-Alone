# Socket Service Documentation

## Overview

The Socket Service provides real-time communication capabilities for the application, handling WebSocket connections, authentication, and event management for channels and messages.

## Table of Contents

- [Connection Setup](#connection-setup)
- [Authentication](#authentication)
- [Channel Events](#channel-events)
- [Message Events](#message-events)
- [User Status](#user-status)
- [Error Handling](#error-handling)

## Connection Setup

The Socket.IO server is configured with CORS support and requires authentication for all connections.

### Server Configuration

```typescript
const io = new SocketServer(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://not-alone.onrender.com",
      "http://localhost:5000",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
```

## Authentication

### Client Authentication

1. Connect to the WebSocket server
2. Emit `authenticate` event with JWT token
3. Wait for `authenticated` or `auth_error` response

```typescript
// Client-side example
const socket = io("your-server-url");
socket.emit("authenticate", "your-jwt-token");

socket.on("authenticated", () => {
  console.log("Successfully authenticated");
});

socket.on("auth_error", (error) => {
  console.error("Authentication failed:", error);
});
```

### Server Authentication Process

1. Validates JWT token using existing auth middleware
2. Creates user-specific room
3. Stores user connection information

## Channel Events

### Join Channel

Join a specific channel's room.

**Event**: `join_channel`  
**Payload**: channelId (string)

```typescript
// Client-side example
socket.emit("join_channel", "channel-123");
```

### Leave Channel

Leave a specific channel's room.

**Event**: `leave_channel`  
**Payload**: channelId (string)

```typescript
// Client-side example
socket.emit("leave_channel", "channel-123");
```

### Channel Updates

Listen for channel-related events.

```typescript
// Client-side example
socket.on("channel_update", (update) => {
  console.log("Channel updated:", update);
});

socket.on("member_join", (member) => {
  console.log("New member joined:", member);
});

socket.on("member_leave", (memberId) => {
  console.log("Member left:", memberId);
});
```

## Message Events

### New Message

Listen for new messages in joined channels.

**Event**: `new_message`  
**Payload**: Message object

```typescript
// Client-side example
socket.on("new_message", (message) => {
  console.log("New message received:", message);
});
```

### Message Updates

Listen for message edits and deletions.

```typescript
// Client-side example
socket.on("message_update", ({ messageId, update }) => {
  console.log(`Message ${messageId} updated:`, update);
});

socket.on("message_delete", (messageId) => {
  console.log(`Message ${messageId} deleted`);
});
```

### Typing Status

Send and receive typing status updates.

```typescript
// Client-side example
// Emit typing status
socket.emit("typing_status", {
  channelId: "channel-123",
  isTyping: true,
});

// Listen for typing status
socket.on("typing_status", ({ userId, isTyping }) => {
  console.log(`User ${userId} is ${isTyping ? "typing" : "not typing"}`);
});
```

## User Status

### Online Status

Track user online/offline status.

```typescript
// Server-side methods
socketService.getUserOnlineStatus(["userId1", "userId2"]);
socketService.getConnectedUsers();
```

### User Socket Information

Retrieve socket information for specific users.

```typescript
// Server-side method
socketService.getUserSocket("userId");
```

## Error Handling

### Authentication Errors

```typescript
// Client-side example
socket.on("auth_error", (error) => {
  console.error("Authentication error:", error);
});
```

### Connection Errors

```typescript
// Client-side example
socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
});
```

## Server-Side Event Emission

The service provides methods to emit events from the server:

```typescript
// Server-side examples
socketService.emitNewMessage(channelId, message);
socketService.emitMessageUpdate(channelId, messageId, update);
socketService.emitMessageDelete(channelId, messageId);
socketService.emitChannelUpdate(channelId, update);
socketService.emitMemberJoin(channelId, member);
socketService.emitMemberLeave(channelId, memberId);
socketService.emitTypingStatus(channelId, userId, isTyping);
```

## Type Definitions

### UserSocket Interface

```typescript
interface UserSocket {
  userId: string;
  socketId: string;
  channels: string[];
}
```

## Security Considerations

1. All connections require JWT authentication
2. Users can only join channels they are members of
3. User information is validated before storing connections
4. CORS is configured to allow only specific origins
5. Sensitive information is filtered from socket events
