import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import videosRouter from "./videos";
import activityRouter from "./activity";
import adminRouter from "./admin";
import scanRouter from "./scan";
import reportsRouter from "./reports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(videosRouter);
router.use(activityRouter);
router.use(adminRouter);
router.use(scanRouter);
router.use(reportsRouter);

export default router;
