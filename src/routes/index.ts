import { Router } from "express";
import { healthRouter } from "./health";
import { updatesRouter } from "./updates";

export const router = Router();
router.use(healthRouter);
router.use(updatesRouter);
