//imports
//node modules
import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import helmet from "helmet";
import { createServer, Server } from "http";
import { fileURLToPath } from "url";
import https from "https";
import fs from "fs";
import useragent from "express-useragent";
//routes
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import cityRoutes from "./routes/cityRoutes";
import requestRoutes from "./routes/requestRoutes";
import donationRoutes from "./routes/donationRoutes";
import businessRoutes from "./routes/businessRoutes";
import discountRoutes from "./routes/discountRoutes";
import profileRoutes from "./routes/profileRoutes";
import eatupRoutes from "./routes/eatupRoutes";
import postRoutes from "./routes/postRoutes";
import commentRoutes from "./routes/commentRoutes";
import emailRoutes from "./routes/emailRoutes";
//sockets
import SocketService from "./services/socketService";
//utils
import { validateEnv } from "./utils/validateEnv";
import channelRoutes from "./routes/channelRoutes";
import messageRoutes from "./routes/messageRoutes";
import verify2FARoutes from "./routes/verify2FARoutes";

// Load and validate environment variables
dotenv.config();
validateEnv();
//server setup
const PORT = process.env.PORT || 5000;
const app = express();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
const httpServer = createServer(app);
const socketService = new SocketService(httpServer);
let server: Server | null = null;
//https config
const httpsOptions = {
  key: fs.readFileSync("./https/key.pem"), // Path to private key
  cert: fs.readFileSync("./https/cert.pem"), // Path to certificate
};

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["*", "data:"],
      },
    },
  })
);
app.use(
  cors({
    origin: [
      //local
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "http://localhost:5000",
      "http://localhost:3000",
      //https
      "https://localhost:3000",
      //render
      "https://not-alone.onrender.com",
      //shalev PC
      "http://shalevpc.servehttp.com:5173",
      "http://shalevpc.servehttp.com",
      "http://shalevpc.servehttp.com:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Methods", // Add this
    ],
    credentials: true,
  })
);
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});
app.use(useragent.express());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
// Logging middleware
app.use(morgan("dev"));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../public")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/eatups", eatupRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/verify-2fa", verify2FARoutes);
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../public/index.html"));
// });

// Global error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message;
  res.status(500).json({
    error: message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// Database connection with retry logic
export const connectDB = async (retries = 5): Promise<void> => {
  const uri =
    process.env.NODE_ENV === "test"
      ? process.env.MONGODB_URI_TEST
      : process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MongoDB URI environment variable is required");
  }

  try {
    await mongoose.connect(uri);
    console.log(`Connected to MongoDB (${process.env.NODE_ENV} environment)`);
  } catch (error) {
    if (retries > 0) {
      console.log(
        `MongoDB connection failed. Retrying... (${retries} attempts left)`
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return connectDB(retries - 1);
    }
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

// Helper functions for server state
export const isServerListening = (): boolean => {
  return server !== null && server.listening;
};

export const closeServer = async (): Promise<void> => {
  if (server) {
    await new Promise<void>((resolve, reject) => {
      server!.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    server = null;
  }
};

// This block only executes when the file is run directly (not imported as a module)
// This prevents the server from starting during test runs where we import the app
if (require.main === module) {
  // Get port from environment variable or default to 3000
  const PORT = process.env.PORT || 5000;

  // Connect to MongoDB first before starting Express server
  connectDB()
    .then(() => {
      // Start Express server and store reference for cleanup
      if (process.env.NODE_ENV === "secure-development") {
        // Start HTTPS server in test environment
        const httpsServer = https.createServer(httpsOptions, app);
        server = httpsServer.listen(PORT, () => {
          console.log(`HTTPS Server is running on https://localhost:${PORT}`);
        });
      } else {
        // Use the existing httpServer where Socket.IO was initialized
        server = httpServer.listen(PORT, () => {
          console.log(`HTTP Server is running on http://localhost:${PORT}`);
        });
      }

      // Set up graceful shutdown handler for SIGTERM signal
      // SIGTERM is commonly sent by container orchestrators (e.g. Kubernetes)
      // to request graceful termination
      process.on("SIGTERM", () => {
        console.log("SIGTERM received. Shutting down gracefully...");

        // Close Express server first to stop accepting new connections
        closeServer().then(() => {
          console.log("Server closed. Exiting process...");

          // Then close MongoDB connection (false = no force close)
          // Finally exit process with success code
          mongoose.connection.close(false).then(() => {
            process.exit(0);
          });
        });
      });
    })
    .catch((error) => {
      // Log any startup errors and exit with failure code
      console.error("Failed to start server:", error);
      process.exit(1);
    });
}

export { app, server };
