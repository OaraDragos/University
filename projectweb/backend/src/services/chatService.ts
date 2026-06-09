import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { getAuthUserById } from "./authService";
import { isAuthUserInGroup } from "./groupsService";
import { HttpError } from "../utils/errors";
import { createId } from "../utils/id";

export type ChatMessage = {
  id: string;
  groupId: string;
  userId: string;
  username: string;
  role: string;
  text: string;
  createdAt: string;
};

type ChatDocumentDatabase = {
  messages: ChatMessage[];
};

const defaultDatabasePath = join(process.cwd(), "backend", "data", "chatMessages.json");
const databasePath = process.env.CHAT_DB_FILE || defaultDatabasePath;
const maxStoredMessages = 500;

let writeQueue = Promise.resolve();

async function readDatabase(): Promise<ChatDocumentDatabase> {
  try {
    const content = await readFile(databasePath, "utf8");
    const parsed = JSON.parse(content) as Partial<ChatDocumentDatabase>;
    return {
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
    };
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      return { messages: [] };
    }

    throw error;
  }
}

async function writeDatabase(database: ChatDocumentDatabase): Promise<void> {
  await mkdir(dirname(databasePath), { recursive: true });
  const temporaryPath = `${databasePath}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(database, null, 2), "utf8");
  await rename(temporaryPath, databasePath);
}

async function withWriteLock<T>(runner: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(runner, runner);
  writeQueue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

export async function listChatMessages(groupId: string, userId: string, limit = 50): Promise<ChatMessage[]> {
  await ensureCanUseGroupChat(groupId, userId);

  const normalizedLimit = Math.min(Math.max(Math.trunc(limit) || 50, 1), maxStoredMessages);
  const database = await readDatabase();
  return database.messages
    .filter((message) => message.groupId === groupId)
    .slice(-normalizedLimit);
}

export async function createChatMessage(input: {
  groupId: string;
  userId: string;
  text: string;
}): Promise<ChatMessage> {
  const text = input.text.trim();
  if (!text) {
    throw new HttpError(400, "Message text is required");
  }

  if (text.length > 500) {
    throw new HttpError(400, "Message text must be at most 500 characters");
  }

  const user = await ensureCanUseGroupChat(input.groupId, input.userId);

  const message: ChatMessage = {
    id: createId(),
    groupId: input.groupId,
    userId: user.id,
    username: user.username,
    role: user.roles[0] ?? "USER",
    text,
    createdAt: new Date().toISOString(),
  };

  await withWriteLock(async () => {
    const database = await readDatabase();
    database.messages.push(message);
    database.messages = database.messages.slice(-maxStoredMessages);
    await writeDatabase(database);
  });

  return message;
}

async function ensureCanUseGroupChat(groupId: string, userId: string) {
  if (!groupId.trim()) {
    throw new HttpError(400, "Group id is required");
  }

  const user = await getAuthUserById(userId);
  if (!user) {
    throw new HttpError(401, "Invalid chat user");
  }

  if (!user.permissions.includes("VIEW_CHAT")) {
    throw new HttpError(403, "User is not allowed to view chat");
  }

  if (!isAuthUserInGroup(groupId, user.id)) {
    throw new HttpError(403, "User is not a member of this group chat");
  }

  if (!user.permissions.includes("SEND_MESSAGE")) {
    throw new HttpError(403, "User is not allowed to send chat messages");
  }

  return user;
}

export async function clearChatMessages(): Promise<void> {
  await withWriteLock(async () => {
    await writeDatabase({ messages: [] });
  });
}
