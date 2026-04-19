import { Router, Request, Response } from "express";
import { logger } from "../lib/logger";
import { getAllUpdates, getUpdateById, createUpdate, deleteUpdate, Update } from "../models/update";

export const updatesRouter = Router();

updatesRouter.get("/updates", (_req: Request, res: Response) => {
  const updates = getAllUpdates();
  logger.info({ count: updates.length }, "Fetched all updates");
  res.json({ updates });
});

updatesRouter.get("/updates/:id", (req: Request, res: Response) => {
  const update = getUpdateById(req.params.id);
  if (!update) {
    logger.warn({ id: req.params.id }, "Update not found");
    res.status(404).json({ error: "Update not found" });
    return;
  }
  res.json({ update });
});

updatesRouter.post("/updates", (req: Request, res: Response) => {
  const { title, body, author } = req.body as Partial<Omit<Update, "id" | "createdAt" | "publishedAt">>;
  if (!title || !body || !author) {
    res.status(400).json({ error: "title, body and author are required" });
    return;
  }
  const update = createUpdate({ title, body, author });
  logger.info({ id: update.id, author: update.author }, "Created new update");
  res.status(201).json({ update });
});

updatesRouter.delete("/updates/:id", (req: Request, res: Response) => {
  const deleted = deleteUpdate(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: "Update not found" });
    return;
  }
  logger.info({ id: req.params.id }, "Deleted update");
  res.status(204).send();
});
