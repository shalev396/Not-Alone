import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import helmet from "helmet";
import userRoutes from "./routes/userRoutes";
import { validateEnv } from "./utils/validateEnv";

// Load and validate environment variables
dotenv.config();
validateEnv();

export const app = express();

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
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// API routes
app.use("/api/users", userRoutes);

// Global error handling middleware
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err.stack);
    const message =
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message;
    res.status(500).json({
      error: message,
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
  }
);

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
    throw error; // Don't exit process, throw error instead
  }
};

// Only start server if this file is run directly (not in tests)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  connectDB()
    .then(() => {
      const server = app.listen(PORT, () => {
        console.log(`Server is running on port http://localhost:${PORT}`);
      });

      // Graceful shutdown
      process.on("SIGTERM", () => {
        console.log("SIGTERM received. Shutting down gracefully...");
        server.close(() => {
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
