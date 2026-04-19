import { Router, Request, Response } from "express";

export const healthRouter = Router();

healthRouter.get("/healthz", (_req: Request, res: Response) => {
  const mem = process.memoryUsage();
  res.status(200).json({
    status: "ok",
    version: process.env.APP_VERSION ?? "unknown",
    environment: process.env.NODE_ENV ?? "development",
    uptime: Math.floor(process.uptime()),
    memory: {
      rss: Math.round(mem.rss / 1024 / 1024),
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
    },
    timestamp: new Date().toISOString(),
  });
});
