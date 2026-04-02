/**
 * Express application only — no HTTP listen, no Socket.IO (those live in handlers/http-server.ts).
 * Imported by Jest, Lambda (lambda-handler), and the local HTTP server.
 */
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import helmet from "helmet";
import useragent from "express-useragent";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import cityRoutes from "./routes/cityRoutes";
import requestRoutes from "./routes/requestRoutes";
import donationRoutes from "./routes/donationRoutes";
import businessRoutes from "./routes/businessRoutes";
import profileRoutes from "./routes/profileRoutes";
import eatupRoutes from "./routes/eatupRoutes";
import postRoutes from "./routes/postRoutes";
import commentRoutes from "./routes/commentRoutes";
import emailRoutes from "./routes/emailRoutes";
import { validateEnv } from "./utils/validateEnv";
import channelRoutes from "./routes/channelRoutes";
import messageRoutes from "./routes/messageRoutes";
import verify2FARoutes from "./routes/verify2FARoutes";
import discountRoutes from "./routes/discountRoutes";

dotenv.config();
validateEnv();

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["*", "data:"],
      },
    },
  }),
);

const defaultOrigins = [
  "http://localhost:5173",
  "https://notalonesoldier.shalev396.com",
];
const extra = process.env.CORS_ORIGINS?.split(",")
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: extra?.length ? [...defaultOrigins, ...extra] : defaultOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Methods",
    ],
    credentials: true,
  }),
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
app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "../public")));

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
if (process.env.NODE_ENV !== "production") {
  app.use("/api/email", emailRoutes);
}
app.use("/api/verify-2fa", verify2FARoutes);

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

export { app };
