import { Router, Request, Response } from "express";
import { register } from "../lib/metrics";

export const metricsRouter = Router();

metricsRouter.get("/metrics", async (_req: Request, res: Response) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});
