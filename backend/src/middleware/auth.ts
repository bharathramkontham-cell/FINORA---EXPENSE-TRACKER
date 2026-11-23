
import "dotenv/config";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : undefined;

  if (!token) {
    res.status(401).json({
      message: "Access denied. Authentication token required."
    });
    return;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({
      message: "Server authentication configuration error."
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded === "string" ||
      typeof decoded.userId !== "number"
    ) {
      res.status(401).json({
        message: "Invalid authentication token."
      });
      return;
    }

    req.userId = decoded.userId;

    next();
  } catch {
    res.status(401).json({
      message: "Invalid or expired authentication token."
    });
  }
}
