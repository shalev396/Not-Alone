import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import { auth } from "../middleware/auth";
import { UserModel } from "../models/userModel";
import mongoose from "mongoose";
import { MessageModel, IMessage } from "../models/messageModel";

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
      path: "/api/socket.io",
      cors: {
        origin: [
          process.env.CLIENT_URL || "http://localhost:3000",
          "http://localhost:5173",
          "http://127.0.0.1:5173",
          "http://localhost:5173",
          "http://127.0.0.1:5173",
          "https://not-alone.onrender.com",
          "http://localhost:5000",
          "https://notalonesoldier.com",
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

      // Auto-authenticate from query parameters if token is provided
      const token = socket.handshake.auth.token;
      const channelId = socket.handshake.query.channelId as string;

      if (token) {
        try {
          // Create a mock request object with the token
          const mockReq: any = {
            headers: {
              authorization: `Bearer ${token}`,
            },
            // Add header method to mock Express request
            header: function (name: string) {
              return name.toLowerCase() === "authorization"
                ? this.headers.authorization
                : undefined;
            },
            user: null, // Will be populated by auth middleware
          };

          // Create a mock response object
          const mockRes: any = {
            status: function (code: number) {
              console.log("Auth status code:", code);
              return this;
            },
            json: function (data: any) {
              console.log("Auth response:", data);
              return this;
            },
          };

          // Create a next function to capture the user
          const next = () => {
            if (!mockReq.user) {
              console.error("Socket auth failed: No user in request");
              socket.emit("auth_error", "Authentication failed");
              return;
            }

            const userId = mockReq.user.userId;
            console.log(
              `Socket authenticated: User ${userId} with socket ${socket.id}`
            );

            // Store user connection info
            this.connectedUsers.set(userId, {
              userId: userId,
              socketId: socket.id,
              channels: [],
            });

            // Auto-join the channel if channelId is provided
            if (channelId) {
              console.log(
                `Auto-joining channel: ${channelId} for user ${userId}`
              );
              socket.join(`channel:${channelId}`);

              const userSocket = this.connectedUsers.get(userId);
              if (userSocket) {
                userSocket.channels.push(`channel:${channelId}`);
              }
            }

            // Join user's channels
            socket.join(userId); // Private room for user
            socket.emit("authenticated");
          };

          // Use the auth middleware
          await auth(mockReq, mockRes, next);
        } catch (error) {
          console.error("Socket authentication error:", error);
          socket.emit("auth_error", "Authentication failed");
        }
      } else {
        console.log("Socket connected without auth token");
      }

      // Handle joining channel
      socket.on("join channel", (channelId: string) => {
        console.log(`Socket ${socket.id} joining channel: ${channelId}`);
        socket.join(`channel:${channelId}`);
        const userSocket = Array.from(this.connectedUsers.values()).find(
          (u) => u.socketId === socket.id
        );
        if (userSocket) {
          userSocket.channels.push(`channel:${channelId}`);
          console.log(`User ${userSocket.userId} joined channel ${channelId}`);
        } else {
          console.log(
            `No user found for socket ${socket.id} trying to join channel`
          );
        }
      });

      // Handle leaving channel
      socket.on("leave channel", (channelId: string) => {
        console.log(`Socket ${socket.id} leaving channel: ${channelId}`);
        socket.leave(`channel:${channelId}`);
        const userSocket = Array.from(this.connectedUsers.values()).find(
          (u) => u.socketId === socket.id
        );
        if (userSocket) {
          userSocket.channels = userSocket.channels.filter(
            (id) => id !== `channel:${channelId}`
          );
        }
      });

      // Handle new message
      socket.on("new message", async (message: any) => {
        console.log(
          `New message received for channel: ${message.channelId}`,
          message
        );
        try {
          // Find socket user info
          const userSocket = Array.from(this.connectedUsers.values()).find(
            (u) => u.socketId === socket.id
          );

          console.log(
            "Connected users:",
            Array.from(this.connectedUsers.entries())
          );
          console.log("Current socket ID:", socket.id);
          console.log("Found user socket:", userSocket);

          if (!userSocket && message.sender) {
            // If user not found in connected users but we have sender ID,
            // try to create a temporary connection for this message
            console.log(
              "Creating temporary user connection for sender:",
              message.sender
            );

            const tempUserId = message.sender;
            this.connectedUsers.set(tempUserId, {
              userId: tempUserId,
              socketId: socket.id,
              channels: [`channel:${message.channelId}`],
            });

            // Use the temporary user connection
            const tempUserSocket = this.connectedUsers.get(tempUserId);
            console.log("Created temporary user connection:", tempUserSocket);

            await this.processMessage(socket, message, tempUserSocket!);
          } else if (userSocket) {
            await this.processMessage(socket, message, userSocket);
          } else {
            console.error(
              "No user found for socket trying to send message and no sender ID provided"
            );
            socket.emit("error", { message: "User not authenticated" });
          }
        } catch (error) {
          console.error("Error handling new message:", error);
          socket.emit("error", { message: "Failed to process message" });
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
  public emitDonationAssignment(
    cityId: string,
    donationId: string,
    soldierId: string
  ): void {
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
  public emitDonationStatusUpdate(
    cityId: string,
    donationId: string,
    status: string
  ): void {
    this.io.to(`city:${cityId}`).emit("donation_status_update", {
      donationId,
      status,
    });
  }

  private async processMessage(
    socket: any,
    message: any,
    userSocket: UserSocket
  ): Promise<void> {
    const { channelId, content, sender } = message;

    // Log the room information
    const rooms = Array.from(socket.rooms);
    console.log(`Socket rooms for ${socket.id}:`, rooms);
    console.log(`Emitting to room: channel:${channelId}`);

    // Double check if socket is in the channel room
    if (!socket.rooms.has(`channel:${channelId}`)) {
      console.log(`Socket not in channel room, joining now`);
      socket.join(`channel:${channelId}`);
    }

    // Fetch sender details from database
    const userDetails = await UserModel.findById(sender).select(
      "firstName lastName profileImage"
    );

    if (!userDetails) {
      throw new Error("User not found");
    }

    // Create message in database first
    try {
      const savedMessage = (await MessageModel.create({
        channelId,
        content,
        sender,
        readBy: [sender], // Mark as read by sender
      })) as IMessage & { _id: mongoose.Types.ObjectId };

      console.log("Message saved to database with ID:", savedMessage._id);

      // Create message object with sender details
      const messageObj = {
        _id: savedMessage._id.toString(),
        channelId,
        content,
        sender: {
          _id: sender,
          firstName: userDetails.firstName || "",
          lastName: userDetails.lastName || "",
          profileImage: userDetails.profileImage || "",
        },
        createdAt: savedMessage.createdAt.toISOString(),
      };

      // Log the message before broadcasting
      console.log("Broadcasting message:", messageObj);

      // Emit to all clients in the channel including sender
      this.io.to(`channel:${channelId}`).emit("message received", messageObj);

      console.log("Message broadcast completed");
    } catch (dbError) {
      console.error("Error saving message to database:", dbError);
      throw new Error("Failed to save message");
    }
  }
}

export default SocketService;
