import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import ApiError from "../utils/ApiError";

/**
 * Validates req.body / req.params / req.query against a Zod schema.
 * On failure, forwards a 400 ApiError with field-level errorDetails.
 */
const validate = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      req.body = parsed.body ?? req.body;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errorDetails = err.errors.map((e) => ({
          field: e.path.slice(1).join(".") || e.path.join("."),
          message: e.message,
        }));
        return next(new ApiError(400, "Validation failed", errorDetails));
      }
      next(err);
    }
  };
};

export default validate;
