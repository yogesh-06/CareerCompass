import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { authMiddleware } from "../src/infrastructure/http/auth-middleware.js";

const secret = "development-insecure-secret";

describe("auth middleware", () => {
  it("rejects protected route without token", async () => {
    const app = express();
    app.get("/protected", authMiddleware, (_request, response) => {
      response.status(200).json({ ok: true });
    });

    const response = await request(app).get("/protected");
    expect(response.status).toBe(401);
  });

  it("allows protected route with valid token", async () => {
    const app = express();
    app.get("/protected", authMiddleware, (_request, response) => {
      response.status(200).json({ ok: true });
    });

    const token = jwt.sign({ sub: "user-id" }, secret);
    const response = await request(app)
      .get("/protected")
      .set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
  });
});
