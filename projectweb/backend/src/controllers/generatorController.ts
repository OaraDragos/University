import { Request, Response } from "express";
import { getGeneratorStatus, startGenerator, stopGenerator } from "../services/generatorService";

export function getGeneratorStatusHandler(_req: Request, res: Response): void {
  res.json(getGeneratorStatus());
}

export function startGeneratorHandler(req: Request, res: Response): void {
  const intervalMsRaw = req.body?.intervalMs;
  const intervalMs = Number.isInteger(intervalMsRaw) ? Number(intervalMsRaw) : 2000;
  res.json(startGenerator(intervalMs));
}

export function stopGeneratorHandler(_req: Request, res: Response): void {
  res.json(stopGenerator());
}
