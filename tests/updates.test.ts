import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/index";
import { _resetStore } from "../src/models/update";

beforeEach(() => { _resetStore(); });

describe("GET /api/updates", () => {
  it("returns empty array when no updates exist", async () => {
    const res = await request(app).get("/api/updates");
    expect(res.status).toBe(200);
    expect(res.body.updates).toEqual([]);
  });
  it("returns all updates after creation", async () => {
    await request(app).post("/api/updates").send({ title: "T", body: "B", author: "a" });
    const res = await request(app).get("/api/updates");
    expect(res.body.updates).toHaveLength(1);
  });
});

describe("POST /api/updates", () => {
  it("creates an update with valid data", async () => {
    const res = await request(app).post("/api/updates").send({
      title: "Outage resolved", body: "All services restored.", author: "ops-team",
    });
    expect(res.status).toBe(201);
    expect(res.body.update.title).toBe("Outage resolved");
    expect(res.body.update.publishedAt).toBeNull();
  });
  it("returns 400 when title is missing", async () => {
    const res = await request(app).post("/api/updates").send({ body: "No title", author: "alice" });
    expect(res.status).toBe(400);
  });
  it("returns 400 when body is missing", async () => {
    const res = await request(app).post("/api/updates").send({ title: "Has title", author: "alice" });
    expect(res.status).toBe(400);
  });
  it("returns 400 when author is missing", async () => {
    const res = await request(app).post("/api/updates").send({ title: "Has title", body: "Has body" });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/updates/:id", () => {
  it("returns a specific update by id", async () => {
    const create = await request(app).post("/api/updates").send({ title: "S", body: "C", author: "bob" });
    const { id } = create.body.update;
    const res = await request(app).get(`/api/updates/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.update.id).toBe(id);
  });
  it("returns 404 for nonexistent id", async () => {
    const res = await request(app).get("/api/updates/nonexistent-id");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Update not found");
  });
});

describe("DELETE /api/updates/:id", () => {
  it("deletes an existing update", async () => {
    const create = await request(app).post("/api/updates").send({ title: "D", body: "G", author: "charlie" });
    const { id } = create.body.update;
    expect((await request(app).delete(`/api/updates/${id}`)).status).toBe(204);
    expect((await request(app).get(`/api/updates/${id}`)).status).toBe(404);
  });
  it("returns 404 when deleting nonexistent update", async () => {
    expect((await request(app).delete("/api/updates/does-not-exist")).status).toBe(404);
  });
});
