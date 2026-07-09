import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an async controller so any thrown/rejected error is
 * forwarded to Express's error-handling middleware via next().
 */
const catchAsync = (fn: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default catchAsync;
