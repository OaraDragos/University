import { Group } from "../models/types";

const groups: Group[] = [];

export function getGroupsStore(): Group[] {
  return groups;
}

export function clearStore(): void {
  groups.length = 0;
}
