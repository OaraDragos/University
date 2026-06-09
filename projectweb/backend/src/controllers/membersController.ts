import { Request, Response } from "express";
import { addMember, deleteMember, listMembers, updateMember } from "../services/groupsService";
import { normalizeLimit, normalizePage } from "../utils/pagination";
import { validateBody } from "../utils/validation";
import { memberSchema, memberUpdateSchema } from "../validators/memberValidators";

export function listMembersHandler(req: Request, res: Response): void {
  const page = normalizePage(req.query.page, 1);
  const limit = normalizeLimit(req.query.limit, 10, 100);
  const result = listMembers(req.params.groupId, page, limit);
  res.json(result);
}

export function addMemberHandler(req: Request, res: Response): void {
  const payload = validateBody(memberSchema, req.body);
  const member = addMember(req.params.groupId, payload);
  res.status(201).json(member);
}

export function updateMemberHandler(req: Request, res: Response): void {
  const payload = validateBody(memberUpdateSchema, req.body);
  const member = updateMember(req.params.groupId, req.params.memberId, payload);
  res.json(member);
}

export function deleteMemberHandler(req: Request, res: Response): void {
  const deleted = deleteMember(req.params.groupId, req.params.memberId);
  res.json(deleted);
}
