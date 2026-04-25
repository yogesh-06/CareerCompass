import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { environment } from "../../infrastructure/configuration/environment.js";
import { prismaClient } from "../../infrastructure/database/prisma-client.js";
import {
  authMiddleware,
  type AuthenticatedRequest,
} from "../../infrastructure/http/auth-middleware.js";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authenticationRouter = Router();

authenticationRouter.post("/register", async (request, response) => {
  const payload = credentialsSchema.parse(request.body);

  const existingUser = await prismaClient.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    response.status(409).json({ message: "Email already registered." });
    return;
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const user = await prismaClient.user.create({
    data: { email: payload.email, passwordHash },
  });

  response.status(201).json({ id: user.id, email: user.email });
});

authenticationRouter.post("/login", async (request, response) => {
  const payload = credentialsSchema.parse(request.body);

  const user = await prismaClient.user.findUnique({ where: { email: payload.email } });

  if (!user || !(await bcrypt.compare(payload.password, user.passwordHash))) {
    response.status(401).json({ message: "Invalid credentials." });
    return;
  }

  const token = jwt.sign({ sub: user.id }, environment.jwtSecret, { expiresIn: "1h" });
  response.status(200).json({ accessToken: token });
});

authenticationRouter.get(
  "/me",
  authMiddleware,
  async (request: AuthenticatedRequest, response) => {
    const user = await prismaClient.user.findUnique({
      where: { id: request.userId },
      select: { id: true, email: true, createdAt: true },
    });

    response.status(200).json(user);
  },
);
