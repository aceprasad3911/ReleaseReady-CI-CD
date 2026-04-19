import { Router } from "express";
import { healthRouter } from "./health";
import { updatesRouter } from "./updates";
import { metricsRouter } from "./metrics";

export const router = Router();

router.use(healthRouter);
router.use(updatesRouter);
router.use(metricsRouter);
