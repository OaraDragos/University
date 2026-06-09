import { Router } from "express";
import { createChatMessage, listChatMessages } from "../services/chatService";
import { broadcastGroupEvent } from "../websocket/realtimeHub";

const chatRouter = Router();

chatRouter.get("/groups/:groupId/messages", async (req, res, next) => {
  try {
    const groupId = String(req.params.groupId ?? "");
    const limit = Number(req.query.limit ?? 50);
    const userId = String(req.authUser?.id ?? "");
    const messages = await listChatMessages(groupId, userId, limit);
    return res.json({ messages });
  } catch (error) {
    return next(error);
  }
});

chatRouter.post("/groups/:groupId/messages", async (req, res, next) => {
  try {
    const groupId = String(req.params.groupId ?? "");
    const userId = String(req.authUser?.id ?? "");
    const text = String(req.body?.text ?? "");
    const message = await createChatMessage({ groupId, userId, text });

    broadcastGroupEvent(groupId, {
      type: "chat_message",
      payload: { groupId, message },
    });

    return res.status(201).json(message);
  } catch (error) {
    return next(error);
  }
});

export default chatRouter;
