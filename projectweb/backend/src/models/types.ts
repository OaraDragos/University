export type Gender = "male" | "female" | "other";

export type AgeRange = "18-24" | "24-30" | "30-40" | "40-50" | "50+";

export interface Member {
  id: string;
  authUserId?: string;
  name: string;
  gender: Gender;
  ageRange: AgeRange;
  drinkLevel: number;
  foodAppetite: number;
}

export interface ProductVotes {
  thumbsUp: string[];
  thumbsDown: string[];
}

export interface Product {
  id: string;
  productName: string;
  supermarket: string;
  price: number;
  quantity?: number;
  unit?: string;
  category: string;
  photo?: string;
  claimedBy?: string;
  addedBy: string;
  addedByName: string;
  votes?: ProductVotes;
}

export interface GroupLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface Group {
  id: string;
  name: string;
  shareCode: string;
  joinPassword?: string;
  location: GroupLocation;
  cabinDetails: string;
  createdAt: string;
  members: Member[];
  products: Product[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends PaginationMeta {
  data: T[];
}
