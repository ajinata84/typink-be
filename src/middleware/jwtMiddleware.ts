import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface customRequest extends Request {
  userId?: string;
}

export const jwtMiddleware = (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied" });
  }

  try {
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export const optionalJwtMiddleware = (
  req: customRequest,
  res: Response,
  next: NextFunction
) => {
  const authorizationHeader = req.headers.authorization;
  if (authorizationHeader) {
    const token = authorizationHeader.split(" ")[1];
    if (token) {
      try {
        const secret = process.env.JWT_SECRET!;
        const decoded = jwt.verify(token, secret) as { userId: string };
        req.userId = decoded.userId;
      } catch (error) {
        // If token is invalid, ignore it and proceed without userId
      }
    }
  }
  next();
};

