import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import { auth } from "../middleware/auth";
import { UserModel } from "../models/userModel";

interface UserSocket {
  userId: string;
  socketId: string;
  channels: string[];
}

class SocketService {
  private io: SocketServer;
  private connectedUsers: Map<string, UserSocket>;

  constructor(server: HttpServer) {
    this.io = new SocketServer(server, {
      cors: {
        origin: [
          process.env.CLIENT_URL || "http://localhost:3000",
          "http://localhost:5173",
          "http://127.0.0.1:5173",
          "http://localhost:5173",
          "http://127.0.0.1:5173",
          "https://not-alone.onrender.com",
          "http://localhost:5000",
        ],
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.connectedUsers = new Map();
    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on("connection", async (socket) => {
      console.log("New socket connection:", socket.id);

      // Handle authentication
      socket.on("authenticate", async (token: string) => {
        try {
          // Create a mock request object with the token
          const mockReq: any = {
            headers: {
              authorization: `Bearer ${token}`,
            },
          };

          // Create a mock response object
          const mockRes: any = {
            status: () => mockRes,
            json: () => mockRes,
          };

          // Create a next function to capture the user
          const next = () => {
            if (!mockReq.user) {
              socket.emit("auth_error", "Authentication failed");
              return;
            }

            const userId = mockReq.user.userId;

            // Store user connection info
            this.connectedUsers.set(userId, {
              userId: userId,
              socketId: socket.id,
              channels: [],
            });

            // Join user's channels
            socket.join(userId); // Private room for user
            socket.emit("authenticated");

            console.log(`User ${userId} authenticated`);
          };

          // Use the auth middleware
          await auth(mockReq, mockRes, next);
        } catch (error) {
          socket.emit("auth_error", "Authentication failed");
        }
      });

      // Handle joining city channel
      socket.on("join_city", (cityId: string) => {
        socket.join(`city:${cityId}`);
        const userSocket = Array.from(this.connectedUsers.values()).find(
          (u) => u.socketId === socket.id
        );
        if (userSocket) {
          userSocket.channels.push(`city:${cityId}`);
        }
      });

      // Handle leaving city channel
      socket.on("leave_city", (cityId: string) => {
        socket.leave(`city:${cityId}`);
        const userSocket = Array.from(this.connectedUsers.values()).find(
          (u) => u.socketId === socket.id
        );
        if (userSocket) {
          userSocket.channels = userSocket.channels.filter(
            (id) => id !== `city:${cityId}`
          );
        }
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        const userSocket = Array.from(this.connectedUsers.values()).find(
          (u) => u.socketId === socket.id
        );
        if (userSocket) {
          this.connectedUsers.delete(userSocket.userId);
        }
        console.log("Client disconnected:", socket.id);
      });
    });
  }

  // Emit new message to channel members
  public emitNewMessage(channelId: string, message: any): void {
    this.io.to(`channel:${channelId}`).emit("new_message", message);
  }

  // Emit message update to channel members
  public emitMessageUpdate(
    channelId: string,
    messageId: string,
    update: any
  ): void {
    this.io.to(`channel:${channelId}`).emit("message_update", {
      messageId,
      update,
    });
  }

  // Emit message deletion to channel members
  public emitMessageDelete(channelId: string, messageId: string): void {
    this.io.to(`channel:${channelId}`).emit("message_delete", messageId);
  }

  // Emit channel update to members
  public emitChannelUpdate(channelId: string, update: any): void {
    this.io.to(`channel:${channelId}`).emit("channel_update", update);
  }

  // Emit new channel member to all channel members
  public emitMemberJoin(channelId: string, member: any): void {
    this.io.to(`channel:${channelId}`).emit("member_join", member);
  }

  // Emit member leave to all channel members
  public emitMemberLeave(channelId: string, memberId: string): void {
    this.io.to(`channel:${channelId}`).emit("member_leave", memberId);
  }

  // Emit typing status to channel members
  public emitTypingStatus(
    channelId: string,
    userId: string,
    isTyping: boolean
  ): void {
    this.io.to(`channel:${channelId}`).emit("typing_status", {
      userId,
      isTyping,
    });
  }

  // Get online status of users
  public getUserOnlineStatus(userIds: string[]): Map<string, boolean> {
    const onlineStatus = new Map<string, boolean>();
    userIds.forEach((userId) => {
      onlineStatus.set(userId, this.connectedUsers.has(userId));
    });
    return onlineStatus;
  }

  // Get socket instance for a specific user
  public getUserSocket(userId: string): UserSocket | undefined {
    return this.connectedUsers.get(userId);
  }

  // Get all connected users
  public getConnectedUsers(): UserSocket[] {
    return Array.from(this.connectedUsers.values());
  }

  // Emit city matching update to municipality users
  public emitCityMatchingUpdate(cityId: string, update: any): void {
    this.io.to(`city:${cityId}`).emit("city_matching_update", update);
  }

  // Emit donation assignment update
  public emitDonationAssignment(cityId: string, donationId: string, soldierId: string): void {
    this.io.to(`city:${cityId}`).emit("donation_assignment", {
      donationId,
      soldierId,
    });
  }

  // Emit new donation to city channel
  public emitNewDonation(cityId: string, donation: any): void {
    this.io.to(`city:${cityId}`).emit("new_donation", donation);
  }

  // Emit donation status update
  public emitDonationStatusUpdate(cityId: string, donationId: string, status: string): void {
    this.io.to(`city:${cityId}`).emit("donation_status_update", {
      donationId,
      status,
    });
  }
}

export default SocketService;
