// Types for the group trip organizer

export interface Member {
  id: string;
  authUserId?: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  ageRange: '18-24' | '24-30' | '30-40' | '40-50' | '50+';
  drinkLevel: number; // 1-5
  foodAppetite: number; // 1-5
}

export interface Product {
  id: string;
  productName: string;
  supermarket: string;
  price: number;
  quantity?: number; // NEW: optional for backwards compatibility
  unit?: string; // NEW: optional for backwards compatibility
  category: string;
  photo?: string;
  claimedBy?: string; // member id
  addedBy: string; // member id
  addedByName: string; // member name
  votes?: { // NEW: optional for backwards compatibility
    thumbsUp: string[]; // array of member ids
    thumbsDown: string[]; // array of member ids
  };
}

export interface Group {
  id: string;
  name: string;
  shareCode: string;
  joinPassword?: string; // optional for backwards compatibility with older groups
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  cabinDetails: string;
  createdAt: string;
  members: Member[];
  products: Product[];
}
