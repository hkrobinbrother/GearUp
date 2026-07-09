import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import { verifyToken, JwtPayload } from "../utils/jwt";
import { prisma } from "../config/prisma";

// Extend Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Verifies the Bearer JWT and attaches the decoded payload to req.user.
 * Also re-checks the user's current status in the DB so a suspended
 * user's existing token is immediately rejected.
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication required. No token provided.");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      throw new ApiError(401, "User belonging to this token no longer exists.");
    }

    if (user.status === "SUSPENDED") {
      throw new ApiError(403, "Your account has been suspended. Contact support.");
    }

    req.user = { id: user.id, role: user.role, email: user.email };
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(new ApiError(401, "Invalid or expired token."));
  }
};

/**
 * Restricts access to the given roles.
 * Usage: authorize("ADMIN"), authorize("PROVIDER", "ADMIN")
 */
export const authorize = (...roles: Array<"CUSTOMER" | "PROVIDER" | "ADMIN">) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required."));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, "You do not have permission to perform this action.")
      );
    }
    next();
  };
};
