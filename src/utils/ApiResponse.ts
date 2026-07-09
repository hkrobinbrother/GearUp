import { Response } from "express";

/**
 * Sends a consistently-shaped success response.
 * { success: true, message, data }
 */
export const sendSuccess = (
  res: Response,
  statusCode: number,
  message: string,
  data?: unknown
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null,
  });
};
