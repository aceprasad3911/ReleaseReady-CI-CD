import express from "express";
import { logger } from "./lib/logger";
import { router } from "./routes";
import { metricsMiddleware } from "./lib/metrics";

const app = express();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(metricsMiddleware);
app.use("/api", router);

export { app };

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    logger.info(
      { port: PORT, env: process.env.NODE_ENV ?? "development" },
      "ReleaseReady server started"
    );
  });
}
