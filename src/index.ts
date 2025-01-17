import express, { Express, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import helmet from "helmet";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import cityRoutes from "./routes/cityRoutes";
import requestRoutes from "./routes/requestRoutes";
import donationRoutes from "./routes/donationRoutes";
import { validateEnv } from "./utils/validateEnv";
import { Server } from "http";
import businessRoutes from "./routes/businessRoutes";
import discountRoutes from "./routes/discountRoutes";
import profileRoutes from "./routes/profileRoutes";
import eatupRoutes from "./routes/eatupRoutes";
import postRoutes from "./routes/postRoutes";

// Load and validate environment variables
dotenv.config();
validateEnv();

// Create Express app instance
const app = express();
let server: Server | null = null;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Logging and parsing middleware
app.use(morgan("dev"));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../public")));

// Security headers middleware
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

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
      : process.env.MONGODB_URI;

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

// Only start server if this file is run directly (not in tests)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  connectDB()
    .then(() => {
      server = app.listen(PORT, () => {
        console.log(`Server is running on port http://localhost:${PORT}`);
      });

      // Graceful shutdown
      process.on("SIGTERM", () => {
        console.log("SIGTERM received. Shutting down gracefully...");
        closeServer().then(() => {
          console.log("Server closed. Exiting process...");
          mongoose.connection.close(false).then(() => {
            process.exit(0);
          });
        });
      });
    })
    .catch((error) => {
      console.error("Failed to start server:", error);
      process.exit(1);
    });
}

export { app, server };
