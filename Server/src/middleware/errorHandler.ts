import { Request, Response, NextFunction } from "express";

interface ErrorResponse {
  message: string;
  stack?: string;
  statusCode?: number;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Response already started: delegate to Express's default handler, which
  // closes the connection (writing a new status/body here would throw).
  if (res.headersSent) {
    return next(err);
  }

  const error: ErrorResponse = {
    message: err.message || "Server Error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  };

  res.status(500).json(error);
};
