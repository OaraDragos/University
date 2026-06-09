// Simple in-memory product service with CRUD and pagination
// Use browser crypto.randomUUID when available, fallback to a compact generator
function generateId() {
  try {
    if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
      return (crypto as any).randomUUID();
    }
  } catch (e) {
    // ignore
  }
  return 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
};

let products: Product[] = [
  { id: generateId(), name: 'Sample Product 1', description: 'First sample', price: 10 },
  { id: generateId(), name: 'Sample Product 2', description: 'Second sample', price: 20 },
  { id: generateId(), name: 'Sample Product 3', description: 'Third sample', price: 30 },
];

export function resetProducts(data: Product[]) {
  products = [...data];
}

export function listProducts(page = 1, pageSize = 10) {
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const safePageSize = Number.isInteger(pageSize) && pageSize > 0 ? pageSize : 10;
  const start = (safePage - 1) * safePageSize;
  const end = start + safePageSize;
  const items = products.slice(start, end);
  return {
    items,
    total: products.length,
    page: safePage,
    pageSize: safePageSize,
  };
}

export function getProduct(id: string) {
  return products.find((p) => p.id === id) || null;
}

export function createProduct(data: Omit<Product, 'id'>) {
  if (!data.name || !Number.isFinite(data.price) || data.price < 0) {
    throw new Error('Invalid product data');
  }
  const product: Product = { id: generateId(), ...data };
  products.unshift(product);
  return product;
}

export function updateProduct(id: string, data: Partial<Omit<Product, 'id'>>) {
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Not found');
  const updated = { ...products[idx], ...data };
  if (!updated.name || !Number.isFinite(updated.price) || updated.price < 0) {
    throw new Error('Invalid product data');
  }
  products[idx] = updated;
  return updated;
}

export function deleteProduct(id: string) {
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Not found');
  const [removed] = products.splice(idx, 1);
  return removed;
}
