import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

export interface CustomAdminRequest extends Request {
  adminId?: number;
}

const prisma = new PrismaClient();

const adminMiddleware = async (
  req: CustomAdminRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied" });
  }

  try {
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as { adminId: number };
    const admin = await prisma.admin.findUnique({
      where: { adminId: decoded.adminId },
    });

    if (!admin) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.adminId = decoded.adminId;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export default adminMiddleware;
