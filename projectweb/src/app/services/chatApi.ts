import { API_URLS } from "./config";
import { apiRequest } from "./networkClient";

export type ChatMessage = {
  id: string;
  groupId: string;
  userId: string;
  username: string;
  role: string;
  text: string;
  createdAt: string;
};

export function listChatMessages(groupId: string, userId: string, limit = 50) {
  return apiRequest<{ messages: ChatMessage[] }>(
    `${API_URLS.chat}/groups/${encodeURIComponent(groupId)}/messages?userId=${encodeURIComponent(userId)}&limit=${limit}`
  );
}

export function createChatMessage(payload: { groupId: string; userId: string; text: string }) {
  return apiRequest<ChatMessage>(`${API_URLS.chat}/groups/${encodeURIComponent(payload.groupId)}/messages`, {
    method: "POST",
    body: JSON.stringify({ userId: payload.userId, text: payload.text }),
  });
}
