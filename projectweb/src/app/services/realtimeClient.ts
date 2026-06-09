import { API_URLS } from "./config";

export type RealtimeEvent = {
  type: string;
  payload: any;
};

let socket: WebSocket | null = null;
const listeners = new Set<(event: RealtimeEvent) => void>();
const pendingEvents: RealtimeEvent[] = [];
const activeGroupSubscriptions = new Map<string, { groupId: string; userId: string }>();
let subscriberCount = 0;
let reconnectTimer: number | null = null;
let closeTimer: number | null = null;
let shouldReconnect = false;

function flushPendingEvents(): void {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return;
  }

  while (pendingEvents.length > 0) {
    const event = pendingEvents.shift();
    if (event) {
      socket.send(JSON.stringify(event));
    }
  }
}

function openSocket(): void {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  socket = new WebSocket(API_URLS.ws);

  socket.onopen = () => {
    activeGroupSubscriptions.forEach((subscription) => {
      socket?.send(
        JSON.stringify({
          type: "group_subscribe",
          payload: subscription,
        })
      );
    });
    flushPendingEvents();
  };

  socket.onmessage = (message) => {
    try {
      const payload = JSON.parse(String(message.data));
      listeners.forEach((listener) => listener(payload));
    } catch (_error) {
      // ignore malformed event
    }
  };

  socket.onclose = () => {
    socket = null;

    if (shouldReconnect && subscriberCount > 0) {
      reconnectTimer = window.setTimeout(() => {
        reconnectTimer = null;
        openSocket();
      }, 800);
    }
  };
}

export function connectRealtime(onEvent: (event: RealtimeEvent) => void): () => void {
  listeners.add(onEvent);
  subscriberCount += 1;
  shouldReconnect = true;

  if (closeTimer) {
    window.clearTimeout(closeTimer);
    closeTimer = null;
  }

  try {
    openSocket();
  } catch (_error) {
    // no-op
  }

  return () => {
    listeners.delete(onEvent);
    subscriberCount = Math.max(0, subscriberCount - 1);

    if (subscriberCount === 0) {
      shouldReconnect = false;
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }

      closeTimer = window.setTimeout(() => {
        closeTimer = null;
        if (socket && subscriberCount === 0) {
          socket.close();
          socket = null;
        }
      }, 150);
    }
  };
}

export function sendRealtimeEvent(event: RealtimeEvent): boolean {
  if (!socket) {
    return false;
  }

  if (socket.readyState === WebSocket.CONNECTING) {
    pendingEvents.push(event);
    return true;
  }

  if (socket.readyState !== WebSocket.OPEN) {
    return false;
  }

  socket.send(JSON.stringify(event));
  return true;
}

export function subscribeRealtimeGroup(groupId: string, userId: string): boolean {
  activeGroupSubscriptions.set(groupId, { groupId, userId });
  return sendRealtimeEvent({
    type: "group_subscribe",
    payload: { groupId, userId },
  });
}

export function unsubscribeRealtimeGroup(groupId: string): boolean {
  activeGroupSubscriptions.delete(groupId);
  return sendRealtimeEvent({
    type: "group_unsubscribe",
    payload: { groupId },
  });
}
