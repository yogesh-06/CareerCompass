import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { environment } from "../configuration/environment.js";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function authMiddleware(
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
): void {
  const authorizationHeader = request.header("authorization");
  if (!authorizationHeader?.startsWith("Bearer ")) {
    response.status(401).json({ message: "Authorization token is required." });
    return;
  }

  const token = authorizationHeader.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, environment.jwtSecret) as { sub: string };
    request.userId = payload.sub;
    next();
  } catch {
    response.status(401).json({ message: "Invalid or expired token." });
  }
}
