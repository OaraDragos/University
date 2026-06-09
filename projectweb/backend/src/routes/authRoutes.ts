import { Router } from "express";
import {
  getAuthUserByIdentifier,
  login,
  register,
  updateUserPasswordByEmail,
} from "../services/authService";
import { createAuthSession, invalidateAuthToken } from "../services/tokenService";
import { issueChallenge, verifyChallenge } from "../services/authChallengeService";
import { authenticateRequest } from "../middleware/authMiddleware";

const authRouter = Router();

authRouter.post("/login", async (req, res, next) => {
  const username = String(req.body?.username ?? req.body?.identifier ?? "").trim();
  const password = String(req.body?.password ?? "");

  if (username.length === 0 || password.length === 0) {
    return res.status(400).json({ error: "username and password are required" });
  }

  try {
    const user = await login(username, password);

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    return res.json(createAuthSession(user));
  } catch (error) {
    return next(error);
  }
});

authRouter.post("/register", async (req, res, next) => {
  const username = String(req.body?.username ?? "").trim();
  const email = String(req.body?.email ?? "").trim();
  const password = String(req.body?.password ?? "");

  if (!username || !email || !password) {
    return res.status(400).json({ error: "username, email and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  try {
    const user = await register(username, email, password);
    return res.status(201).json(createAuthSession(user));
  } catch (error) {
    return next(error);
  }
});

authRouter.post("/login/code/request", async (req, res, next) => {
  const identifier = String(req.body?.identifier ?? "").trim();
  if (!identifier) {
    return res.status(400).json({ error: "identifier is required" });
  }

  try {
    const user = await getAuthUserByIdentifier(identifier);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const challenge = issueChallenge("LOGIN_CODE", identifier);
    return res.json({
      message: "Login code generated",
      code: challenge.code,
      expiresAt: challenge.expiresAt,
    });
  } catch (error) {
    return next(error);
  }
});

authRouter.post("/login/code/verify", async (req, res, next) => {
  const identifier = String(req.body?.identifier ?? "").trim();
  const code = String(req.body?.code ?? "").trim();
  if (!identifier || !code) {
    return res.status(400).json({ error: "identifier and code are required" });
  }

  try {
    if (!verifyChallenge("LOGIN_CODE", identifier, code)) {
      return res.status(401).json({ error: "Invalid or expired code" });
    }

    const user = await getAuthUserByIdentifier(identifier);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(createAuthSession(user));
  } catch (error) {
    return next(error);
  }
});

authRouter.post("/password-recovery/request", async (req, res, next) => {
  const email = String(req.body?.email ?? "").trim();
  if (!email) {
    return res.status(400).json({ error: "email is required" });
  }

  try {
    const user = await getAuthUserByIdentifier(email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const challenge = issueChallenge("PASSWORD_RESET", email);
    return res.json({
      message: "Password recovery code generated",
      code: challenge.code,
      expiresAt: challenge.expiresAt,
    });
  } catch (error) {
    return next(error);
  }
});

authRouter.post("/password-recovery/reset", async (req, res, next) => {
  const email = String(req.body?.email ?? "").trim();
  const code = String(req.body?.code ?? "").trim();
  const newPassword = String(req.body?.newPassword ?? "");

  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: "email, code and newPassword are required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  try {
    if (!verifyChallenge("PASSWORD_RESET", email, code)) {
      return res.status(401).json({ error: "Invalid or expired code" });
    }

    await updateUserPasswordByEmail(email, newPassword);
    return res.json({ message: "Password updated" });
  } catch (error) {
    return next(error);
  }
});

authRouter.get("/session", authenticateRequest, (req, res) => {
  return res.json({ user: req.authUser });
});

authRouter.post("/logout", authenticateRequest, (req, res) => {
  const header = String(req.headers.authorization ?? "");
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  invalidateAuthToken(token);
  return res.status(204).send();
});

export default authRouter;
