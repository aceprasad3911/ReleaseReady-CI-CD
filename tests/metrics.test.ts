import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/index";

describe("GET /api/metrics", () => {
  it("returns 200 with Prometheus text exposition format", async () => {
    const res = await request(app).get("/api/metrics");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/plain/);
  });

  it("exposes default Node.js process metrics", async () => {
    const res = await request(app).get("/api/metrics");
    expect(res.text).toContain("process_cpu_user_seconds_total");
    expect(res.text).toContain("nodejs_heap_size_total_bytes");
  });

  it("records HTTP request metrics after traffic", async () => {
    await request(app).get("/api/healthz");
    await request(app).get("/api/updates");
    const res = await request(app).get("/api/metrics");
    expect(res.text).toContain("http_requests_total");
    expect(res.text).toContain("http_request_duration_seconds");
  });
});
