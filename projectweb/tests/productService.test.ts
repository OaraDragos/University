import { describe, it, expect, beforeEach } from 'vitest';
import { listProducts, createProduct, getProduct, updateProduct, deleteProduct, resetProducts } from '../src/app/services/productService';

const initial = [
  { id: '1', name: 'A', description: '', price: 5 },
  { id: '2', name: 'B', description: '', price: 10 },
  { id: '3', name: 'C', description: '', price: 15 },
];

describe('productService', () => {
  beforeEach(() => {
    resetProducts(initial as any);
  });

  it('lists products with pagination', () => {
    const res = listProducts(1, 2);
    expect(res.items.length).toBe(2);
    expect(res.total).toBe(3);
  });

  it('sanitizes invalid pagination inputs', () => {
    const res = listProducts(0 as any, 0 as any);
    expect(res.page).toBe(1);
    expect(res.pageSize).toBe(10);
    expect(res.items.length).toBe(3);
  });

  it('creates a product', () => {
    const p = createProduct({ name: 'New', price: 20, description: 'x' });
    expect(p.id).toBeDefined();
    const res = listProducts(1, 10);
    expect(res.total).toBe(4);
    expect(getProduct(p.id)).toBeTruthy();
  });

  it('validates create', () => {
    expect(() => createProduct({ name: '', price: -1, description: '' })).toThrow();
  });

  it('updates a product', () => {
    const updated = updateProduct('1', { name: 'A1', price: 6 });
    expect(updated.name).toBe('A1');
    expect(getProduct('1')?.price).toBe(6);
  });

  it('deletes a product', () => {
    deleteProduct('2');
    const res = listProducts(1, 10);
    expect(res.total).toBe(2);
    expect(getProduct('2')).toBeNull();
  });
});

