import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface customRequest extends Request {
  userId?: string;
}

const jwtMiddleware = (
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

export default jwtMiddleware;
