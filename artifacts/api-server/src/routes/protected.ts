import { Router, type IRouter } from "express";
import purchasesRouter from "./purchases";
import adminRouter from "./admin";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(purchasesRouter);
router.use(adminRouter);
router.use(storageRouter);

export default router;
