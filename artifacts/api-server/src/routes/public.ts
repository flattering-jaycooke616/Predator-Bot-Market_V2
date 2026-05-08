import { Router, type IRouter } from "express";
import healthRouter from "./health";
import configRouter from "./config";
import botsRouter from "./bots";

const router: IRouter = Router();

router.use(healthRouter);
router.use(configRouter);
router.use(botsRouter);

export default router;
