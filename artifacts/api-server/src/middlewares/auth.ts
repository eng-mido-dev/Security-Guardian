import { jwtVerify } from "jose";
import type { Request, Response, NextFunction } from "express";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "horras-fallback-secret-change-in-production",
);

export interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string; name: string };
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  try {
    const token = header.slice(7);
    const { payload } = await jwtVerify(token, secret);
    req.user = payload as { id: number; email: string; role: string; name: string };
    next();
  } catch {
    res.status(401).json({ error: "invalid_token" });
  }
}

export function adminMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (req.user?.role !== "admin") {
    res.status(403).json({ error: "forbidden" });
    return;
  }
  next();
}
