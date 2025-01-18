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
  const error: ErrorResponse = {
    message: err.message || "Server Error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  };

  res.status(500).json(error);
};
