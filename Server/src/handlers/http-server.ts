/**
 * Local / Render Node entry: HTTP (or HTTPS) + Socket.IO + Mongo.
 * Run: npm run dev | npm start (after build).
 */
import mongoose from "mongoose";
import { createServer, Server } from "http";
import https from "https";
import fs from "fs";
import { app } from "../index";
import SocketService from "../services/socketService";
import { initDB } from "../config/bootstrap";

const httpsOptions =
  fs.existsSync("./https/key.pem") && fs.existsSync("./https/cert.pem")
    ? {
        key: fs.readFileSync("./https/key.pem"),
        cert: fs.readFileSync("./https/cert.pem"),
      }
    : null;

let server: Server | null = null;

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

if (require.main === module) {
  const httpServer = createServer(app);
  new SocketService(httpServer);

  const listenPort = Number(process.env.PORT) || 5000;

  void initDB()
    .then(() => {
      if (process.env.NODE_ENV === "secure-development" && httpsOptions) {
        const httpsServer = https.createServer(httpsOptions, app);
        server = httpsServer.listen(listenPort, () => {
          console.log(
            `HTTPS Server is running on https://localhost:${listenPort}`,
          );
        });
      } else {
        server = httpServer.listen(listenPort, () => {
          console.log(
            `HTTP Server is running on http://localhost:${listenPort}`,
          );
        });
      }

      process.on("SIGTERM", () => {
        console.log("SIGTERM received. Shutting down gracefully...");
        void closeServer().then(() => {
          console.log("Server closed. Exiting process...");
          void mongoose.connection.close(false).then(() => {
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
