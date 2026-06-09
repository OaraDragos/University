import { PaginatedResponse } from "../models/types";

export function normalizePage(value: unknown, fallback = 1): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return parsed;
}

export function normalizeLimit(value: unknown, fallback = 10, max = 100): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
}

export function paginate<T>(items: T[], page: number, limit: number): PaginatedResponse<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;
  const data = items.slice(start, start + limit);

  return {
    data,
    page: safePage,
    limit,
    totalItems,
    totalPages,
  };
}
