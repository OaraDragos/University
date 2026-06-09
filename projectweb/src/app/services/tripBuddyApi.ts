import { Group, Member, Product } from "../types";
import { API_URLS } from "./config";
import { apiRequest } from "./networkClient";

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface CreateGroupPayload {
  name: string;
  joinPassword: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  cabinDetails: string;
}

export interface JoinGroupPayload {
  shareCode: string;
  joinPassword: string;
}

export interface CreateMemberPayload {
  authUserId?: string;
  name: string;
  gender: Member["gender"];
  ageRange: Member["ageRange"];
  drinkLevel: number;
  foodAppetite: number;
}

export type UpdateProductPayload = Partial<
  Pick<Product, "productName" | "supermarket" | "price" | "quantity" | "unit" | "category" | "photo" | "claimedBy" | "votes">
>;

export function listGroups(page = 1, limit = 5) {
  return apiRequest<PaginatedResponse<Group>>(`${API_URLS.groups}?page=${page}&limit=${limit}`);
}

export function listGroupsForUser(authUserId: string) {
  return apiRequest<{ groups: Group[] }>(`${API_URLS.groups}/by-user/${encodeURIComponent(authUserId)}`);
}

export function createGroup(payload: CreateGroupPayload) {
  return apiRequest<Group>(API_URLS.groups, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function joinGroup(payload: JoinGroupPayload) {
  return apiRequest<Group>(`${API_URLS.groups}/join`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getGroup(groupId: string) {
  return apiRequest<Group>(`${API_URLS.groups}/${groupId}`);
}

export function addMember(groupId: string, payload: CreateMemberPayload) {
  return apiRequest<Member>(`${API_URLS.groups}/${groupId}/members`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listMembers(groupId: string, page = 1, limit = 10) {
  return apiRequest<PaginatedResponse<Member>>(`${API_URLS.groups}/${groupId}/members?page=${page}&limit=${limit}`);
}

export function listProducts(groupId: string, page = 1, limit = 20) {
  return apiRequest<PaginatedResponse<Product>>(`${API_URLS.groups}/${groupId}/products?page=${page}&limit=${limit}`);
}

export function addProduct(groupId: string, payload: Omit<Product, "id">) {
  return apiRequest<Product>(`${API_URLS.groups}/${groupId}/products`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getProduct(groupId: string, productId: string) {
  return apiRequest<Product>(`${API_URLS.groups}/${groupId}/products/${productId}`);
}

export function updateProduct(groupId: string, productId: string, payload: UpdateProductPayload) {
  return apiRequest<Product>(`${API_URLS.groups}/${groupId}/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteProduct(groupId: string, productId: string) {
  return apiRequest<Product>(`${API_URLS.groups}/${groupId}/products/${productId}`, {
    method: "DELETE",
  });
}

export function startGenerator(intervalMs = 2000) {
  return apiRequest<{ running: boolean; intervalMs: number }>(`${API_URLS.generator}/start`, {
    method: "POST",
    body: JSON.stringify({ intervalMs }),
  });
}

export function stopGenerator() {
  return apiRequest<{ running: boolean; intervalMs: number }>(`${API_URLS.generator}/stop`, {
    method: "POST",
  });
}

export function getGeneratorStatus() {
  return apiRequest<{ running: boolean; intervalMs: number }>(`${API_URLS.generator}/status`);
}

export function executeGraphQL<T>(query: string, variables?: Record<string, unknown>) {
  return apiRequest<{ data?: T; errors?: unknown[] }>(API_URLS.graphql, {
    method: "POST",
    body: JSON.stringify({ query, variables }),
  });
}
