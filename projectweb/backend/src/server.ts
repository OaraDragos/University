import { createServer as createHttpServer } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { WebSocketServer } from "ws";
import { app } from "./app";
import { attachWebSocketServer, handleRealtimeClientMessage } from "./websocket/realtimeHub";

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? "0.0.0.0";
const useHttps = process.env.HTTPS === "true";
const protocol = useHttps ? "https" : "http";
const pfxPath = process.env.HTTPS_PFX_FILE ?? join(process.cwd(), "backend", "certs", "devcert.pfx");
const pfxPassphrase = process.env.HTTPS_PFX_PASSPHRASE ?? "silver-dev";

const server = useHttps
  ? createHttpsServer({ pfx: readFileSync(pfxPath), passphrase: pfxPassphrase }, app)
  : createHttpServer(app);
const wss = new WebSocketServer({
  server,
  path: "/ws",
});

wss.on("connection", (socket) => {
  socket.send(
    JSON.stringify({
      type: "connected",
      payload: { message: "Realtime channel connected" },
    })
  );

  socket.on("message", (rawMessage) => {
    void handleRealtimeClientMessage(rawMessage, socket);
  });
});

attachWebSocketServer(wss);

server.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`TripBuddy backend listening on ${protocol}://${host}:${port}`);
});
