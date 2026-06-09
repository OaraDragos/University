export interface OfflineOperation {
  id: string;
  method: "POST" | "PUT" | "DELETE";
  path: string;
  body?: unknown;
  createdAt: string;
}

export type OfflineQueueRetentionStrategy = (
  operation: OfflineOperation,
  error: unknown
) => boolean;

const STORAGE_KEY = "tripbuddy_offline_ops";

function readQueue(): OfflineOperation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function writeQueue(queue: OfflineOperation[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function getOfflineQueue(): OfflineOperation[] {
  return readQueue();
}

export function addOfflineOperation(operation: Omit<OfflineOperation, "id" | "createdAt">): OfflineOperation {
  const queued: OfflineOperation = {
    ...operation,
    id: `offline_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };

  const queue = readQueue();
  queue.push(queued);
  writeQueue(queue);

  return queued;
}

export function clearOfflineQueue(): void {
  writeQueue([]);
}

export async function flushOfflineQueue(
  executor: (operation: OfflineOperation) => Promise<void>,
  shouldRetainOnFailure: OfflineQueueRetentionStrategy = () => true
): Promise<{ processed: number; failed: number; dropped: number }> {
  const queue = readQueue();
  if (queue.length === 0) {
    return { processed: 0, failed: 0, dropped: 0 };
  }

  const pending: OfflineOperation[] = [];
  let processed = 0;
  let failed = 0;
  let dropped = 0;

  for (const operation of queue) {
    try {
      await executor(operation);
      processed += 1;
    } catch (error) {
      failed += 1;
      if (shouldRetainOnFailure(operation, error)) {
        pending.push(operation);
      } else {
        dropped += 1;
      }
    }
  }

  writeQueue(pending);
  return { processed, failed, dropped };
}
