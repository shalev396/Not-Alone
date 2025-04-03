import { io, Socket } from "socket.io-client";

interface SocketMessage {
  channelId: string;
  content: string;
  sender: string;
}

class SocketService {
  private socket: Socket | null = null;
  private currentChannel: string | null = null;

  connect(channelId: string): Socket {
    if (this.socket && this.currentChannel === channelId) {
      console.log("Socket already connected to channel:", channelId);
      return this.socket;
    }

    if (this.socket) {
      console.log("Disconnecting from previous channel:", this.currentChannel);
      this.socket.emit("leave channel", this.currentChannel);
      this.socket.disconnect();
      this.socket = null;
    }

    const token = sessionStorage.getItem("token");
    console.log("Connecting with token:", token ? "Token exists" : "No token");

    // Make sure we have the token
    if (!token) {
      console.error("No authentication token available");
      throw new Error("Authentication required");
    }
    const baseURL =
      process.env.NODE_ENV === "production" ? "/" : "http://localhost:3000";

    this.socket = io(baseURL, {
      path: "/api/socket.io",
      auth: { token },
      query: { channelId },
      transports: ["polling", "websocket"],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true,
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    this.currentChannel = channelId;

    this.socket.on("connect", () => {
      console.log(`Socket connected to channel: ${channelId}`);
      // Explicitly join the channel after connection
      this.socket?.emit("join channel", channelId);
      console.log("Sent 'join channel' event for:", channelId);
    });

    this.socket.on("authenticated", () => {
      console.log("Socket authenticated successfully");
    });

    this.socket.on("auth_error", (error) => {
      console.error("Socket authentication error:", error);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      console.log("Disconnecting socket from channel:", this.currentChannel);
      this.socket.emit("leave channel", this.currentChannel);
      this.socket.disconnect();
      this.socket = null;
      this.currentChannel = null;
    }
  }

  emitMessage(message: SocketMessage): void {
    if (this.socket && this.currentChannel === message.channelId) {
      console.log("Emitting message:", message);
      this.socket.emit("new message", message);
    } else {
      console.error(
        "Cannot send message - socket not connected to correct channel"
      );
      console.log("Current channel:", this.currentChannel);
      console.log("Message channel:", message.channelId);
      console.log("Socket connected:", !!this.socket);
    }
  }
}

const socketService = new SocketService();
export { socketService };
