import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../src/index";
import type { Server } from "http";

let server: Server;
beforeAll(() => { server = app.listen(0); });
afterAll(() => { server.close(); });

describe("GET /api/healthz", () => {
  it("returns 200 with status ok", async () => {
    const res = await request(app).get("/api/healthz");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
  it("includes timestamp in ISO format", async () => {
    const res = await request(app).get("/api/healthz");
    expect(res.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
  it("includes environment field", async () => {
    const res = await request(app).get("/api/healthz");
    expect(res.body).toHaveProperty("environment");
  });
  it("includes uptime as a number", async () => {
    const res = await request(app).get("/api/healthz");
    expect(typeof res.body.uptime).toBe("number");
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
  });
  it("includes memory usage fields", async () => {
    const res = await request(app).get("/api/healthz");
    expect(res.body.memory).toHaveProperty("rss");
    expect(res.body.memory).toHaveProperty("heapUsed");
  });
});
