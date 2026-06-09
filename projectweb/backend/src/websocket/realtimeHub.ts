import { WebSocketServer, WebSocket } from "ws";
import { createChatMessage } from "../services/chatService";
import { isAuthUserInGroup } from "../services/groupsService";

type ServerEvent = {
  type: string;
  payload: unknown;
};

let wsServer: WebSocketServer | null = null;
const groupSubscriptions = new WeakMap<WebSocket, Set<string>>();

export function attachWebSocketServer(server: WebSocketServer): void {
  wsServer = server;
}

export function broadcastGroupEvent(groupId: string, event: ServerEvent): void {
  if (!wsServer) return;

  const serialized = JSON.stringify(event);
  wsServer.clients.forEach((client) => {
    const subscriptions = groupSubscriptions.get(client);
    if (client.readyState === WebSocket.OPEN && subscriptions?.has(groupId)) {
      client.send(serialized);
    }
  });
}

export async function handleRealtimeClientMessage(rawMessage: WebSocket.RawData, socket: WebSocket): Promise<void> {
  try {
    const event = JSON.parse(rawMessage.toString()) as ServerEvent;

    if (event.type === "group_subscribe") {
      const payload = event.payload as { groupId?: unknown; userId?: unknown };
      const groupId = String(payload?.groupId ?? "").trim();
      const userId = String(payload?.userId ?? "").trim();

      if (!groupId || !userId || !isAuthUserInGroup(groupId, userId)) {
        throw new Error("User is not a member of this realtime group");
      }

      const subscriptions = groupSubscriptions.get(socket) ?? new Set<string>();
      subscriptions.add(groupId);
      groupSubscriptions.set(socket, subscriptions);

      if (socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "group_subscribed",
            payload: { groupId },
          })
        );
      }
      return;
    }

    if (event.type === "group_unsubscribe") {
      const payload = event.payload as { groupId?: unknown };
      const groupId = String(payload?.groupId ?? "").trim();
      groupSubscriptions.get(socket)?.delete(groupId);
      return;
    }

    if (event.type !== "chat_send") {
      return;
    }

    const payload = event.payload as { groupId?: unknown; userId?: unknown; text?: unknown };
    const message = await createChatMessage({
      groupId: String(payload?.groupId ?? ""),
      userId: String(payload?.userId ?? ""),
      text: String(payload?.text ?? ""),
    });

    broadcastGroupEvent(message.groupId, {
      type: "chat_message",
      payload: { groupId: message.groupId, message },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not process realtime message";
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "chat_error",
          payload: { error: message },
        })
      );
    }
  }
}
