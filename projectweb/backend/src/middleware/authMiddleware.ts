import { NextFunction, Request, Response } from "express";
import { verifyAuthToken } from "../services/tokenService";

declare global {
  namespace Express {
    interface Request {
      authUser?: {
        id: string;
        username: string;
        email: string;
        roles: string[];
        permissions: string[];
      };
    }
  }
}

export function authenticateRequest(req: Request, res: Response, next: NextFunction): void {
  const header = String(req.headers.authorization ?? "");
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  const user = verifyAuthToken(token);

  if (!user) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  req.authUser = user;
  next();
}

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.authUser) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    if (!req.authUser.permissions.includes(permission)) {
      res.status(403).json({ error: `Missing permission: ${permission}` });
      return;
    }

    next();
  };
}
