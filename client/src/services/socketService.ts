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
      return this.socket;
    }

    if (this.socket) {
      this.socket.emit("leave channel", this.currentChannel);
      this.socket.disconnect();
      this.socket = null;
    }

    const token = sessionStorage.getItem("token");

    this.socket = io("http://localhost:5000", {
      auth: { token },
      query: { channelId },
      transports: ["polling", "websocket"],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true,
    });

    this.currentChannel = channelId;

    this.socket.on("connect", () => {
      console.log(`Socket connected to channel: ${channelId}`);
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
      this.socket.emit("leave channel", this.currentChannel);
      this.socket.disconnect();
      this.socket = null;
      this.currentChannel = null;
    }
  }

  emitMessage(message: SocketMessage): void {
    if (this.socket && this.currentChannel === message.channelId) {
      this.socket.emit("new message", message);
    }
  }
}

const socketService = new SocketService();
export { socketService };
