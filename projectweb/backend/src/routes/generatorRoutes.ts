import { Router } from "express";
import {
  getGeneratorStatusHandler,
  startGeneratorHandler,
  stopGeneratorHandler,
} from "../controllers/generatorController";

const generatorRouter = Router();

generatorRouter.get("/status", getGeneratorStatusHandler);
generatorRouter.post("/start", startGeneratorHandler);
generatorRouter.post("/stop", stopGeneratorHandler);

export default generatorRouter;
