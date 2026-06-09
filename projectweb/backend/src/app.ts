import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import authRouter from "./routes/authRoutes";
import chatRouter from "./routes/chatRoutes";
import groupsRouter from "./routes/groupsRoutes";
import generatorRouter from "./routes/generatorRoutes";
import { isHttpError } from "./utils/errors";
import { executeGraphQL } from "./graphql/schema";
import { authenticateRequest, requirePermission } from "./middleware/authMiddleware";

export const app = express();

app.use(
  cors({
    origin: true,
    credentials: false,
  })
);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/chat", authenticateRequest, requirePermission("VIEW_CHAT"), chatRouter);
app.use("/api/groups", authenticateRequest, groupsRouter);
app.use("/api/generator", authenticateRequest, requirePermission("MANAGE_USERS"), generatorRouter);

app.post("/graphql", async (req, res, next) => {
  try {
    const query = req.body?.query;
    const variables = req.body?.variables;

    if (typeof query !== "string" || query.trim() === "") {
      return res.status(400).json({ error: "Missing GraphQL query" });
    }

    const result = await executeGraphQL(query, variables);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (isHttpError(error)) {
    return res.status(error.status).json({ error: error.message });
  }

  if (error instanceof Error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(500).json({ error: "Unexpected server error" });
});
