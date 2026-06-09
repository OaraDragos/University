import { Request, Response } from "express";
import {
  createGroup,
  deleteGroup,
  getGroupById,
  getGroupStatistics,
  getGroupsStatistics,
  joinGroupByCode,
  listGroupsForAuthUser,
  listGroups,
  updateGroup,
} from "../services/groupsService";
import { normalizeLimit, normalizePage } from "../utils/pagination";
import { validateBody } from "../utils/validation";
import { createGroupSchema, joinGroupSchema, updateGroupSchema } from "../validators/groupValidators";

export function createGroupHandler(req: Request, res: Response): void {
  const payload = validateBody(createGroupSchema, req.body);
  const group = createGroup(payload);
  res.status(201).json(group);
}

export function listGroupsHandler(req: Request, res: Response): void {
  const page = normalizePage(req.query.page, 1);
  const limit = normalizeLimit(req.query.limit, 5, 50);
  const result = listGroups(page, limit);
  res.json(result);
}

export function listUserGroupsHandler(req: Request, res: Response): void {
  const authUserId = String(req.params.authUserId ?? "").trim();
  const currentUserId = String(req.authUser?.id ?? "");
  const canManageUsers = Boolean(req.authUser?.permissions.includes("MANAGE_USERS"));

  if (!canManageUsers && authUserId !== currentUserId) {
    res.status(403).json({ error: "Forbidden user scope" });
    return;
  }

  res.json({ groups: listGroupsForAuthUser(authUserId) });
}

export function getGroupHandler(req: Request, res: Response): void {
  const group = getGroupById(req.params.groupId);
  res.json(group);
}

export function updateGroupHandler(req: Request, res: Response): void {
  const payload = validateBody(updateGroupSchema, req.body);
  const group = updateGroup(req.params.groupId, payload);
  res.json(group);
}

export function deleteGroupHandler(req: Request, res: Response): void {
  const deleted = deleteGroup(req.params.groupId);
  res.json(deleted);
}

export function groupsStatisticsHandler(_req: Request, res: Response): void {
  res.json(getGroupsStatistics());
}

export function groupStatisticsHandler(req: Request, res: Response): void {
  res.json(getGroupStatistics(req.params.groupId));
}

export function joinGroupHandler(req: Request, res: Response): void {
  const payload = validateBody(joinGroupSchema, req.body);
  const group = joinGroupByCode(payload);
  res.json(group);
}
