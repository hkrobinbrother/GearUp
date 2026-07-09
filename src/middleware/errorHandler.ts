import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import ApiError from "../utils/ApiError";
import { env } from "../config/env";

/**
 * Global error handler. Every error in the app funnels through here
 * and is returned in the mandatory shape:
 * { success: false, message, errorDetails }
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Internal server error";
  let errorDetails: unknown = env.NODE_ENV === "development" ? err.stack : undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorDetails = err.errorDetails ?? errorDetails;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    switch (err.code) {
      case "P2002":
        message = `A record with this ${(err.meta?.target as string[])?.join(", ")} already exists.`;
        break;
      case "P2025":
        statusCode = 404;
        message = "Requested record was not found.";
        break;
      case "P2003":
        message = "Invalid reference to a related record.";
        break;
      default:
        message = "Database request error.";
    }
    errorDetails = env.NODE_ENV === "development" ? err.message : undefined;
  } else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Invalid or expired token.";
  } else if (err instanceof Error) {
    message = err.message || message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails: errorDetails ?? null,
  });
};
