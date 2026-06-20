import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import matchesRouter from "./matches";
import standingsRouter from "./standings";
import predictionsRouter from "./predictions";
import leaguesRouter from "./leagues";
import profileRouter from "./profile";
import highlightsRouter from "./highlights";
import eventsRouter from "./events";
import preferencesRouter from "./preferences";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(matchesRouter);
router.use(standingsRouter);
router.use(predictionsRouter);
router.use(leaguesRouter);
router.use(profileRouter);
router.use(highlightsRouter);
router.use(eventsRouter);
router.use(preferencesRouter);

export default router;
