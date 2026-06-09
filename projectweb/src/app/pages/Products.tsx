import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGroup } from '../context/GroupContext';
import { useAuth } from '../context/AuthContext';
import { addProduct, deleteProduct, listProducts } from '../services/tripBuddyApi';
import { Product } from '../types';
import { setTracking } from '../utils/cookieTracker';

export default function ProductList() {
  const { currentGroup, currentMember, isHydrated } = useGroup();
  const { hasPermission } = useAuth();
  const pageSize = 5;
  const [items, setItems] = React.useState<Product[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const canCreate = hasPermission('CREATE_ENTITY');
  const canDelete = hasPermission('DELETE_ENTITY');

  const loadPage = React.useCallback(
    async (targetPage: number, replace = false) => {
      if (!currentGroup) return;
      if (loading) return;

      setLoading(true);
      try {
        const response = await listProducts(currentGroup.id, targetPage, pageSize);
        setTotalPages(response.totalPages);
        setPage(response.page);
        setItems((prev) => {
          if (replace || response.page === 1) {
            return response.data;
          }

          const existingIds = new Set(prev.map((item) => item.id));
          const merged = [...prev];
          response.data.forEach((item) => {
            if (!existingIds.has(item.id)) {
              merged.push(item);
            }
          });
          return merged;
        });
      } catch (e: any) {
        setError(e?.message || 'Could not load products');
      } finally {
        setLoading(false);
      }
    },
    [currentGroup, loading]
  );

  React.useEffect(() => {
    if (!currentGroup) return;
    setItems([]);
    setPage(1);
    setTotalPages(1);
    void loadPage(1, true);
  }, [currentGroup?.id]);

  React.useEffect(() => {
    const element = sentinelRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first.isIntersecting) return;
        if (loading) return;
        if (page >= totalPages) return;
        void loadPage(page + 1);
      },
      { threshold: 0.2 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [loadPage, loading, page, totalPages]);

  React.useEffect(() => {
    if (isHydrated && (!currentGroup || !currentMember)) {
      navigate('/home');
    }
  }, [currentGroup, currentMember, isHydrated, navigate]);

  React.useEffect(() => {
    setTracking({ productsCrudPage: page });
  }, [page]);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreate) {
      setError('Your role cannot create products');
      return;
    }

    setError(null);
    const priceNum = Number(price);
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setError('Price must be a non-negative number');
      return;
    }
    if (!currentGroup || !currentMember) {
      setError('No active group or member');
      return;
    }

    void (async () => {
      try {
        const createdName = name.trim();
        await addProduct(currentGroup.id, {
          productName: createdName,
          supermarket: 'Unknown',
          price: priceNum,
          quantity: 1,
          unit: 'buc',
          category: 'General',
          addedBy: currentMember.id,
          addedByName: currentMember.name,
          votes: { thumbsUp: [], thumbsDown: [] },
        });
        setTracking({
          lastProductsAction: 'create',
          lastProductsActionAt: new Date().toISOString(),
          lastCreatedProductName: createdName,
        });
        setName('');
        setPrice('');
        await loadPage(1, true);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      }
    })();
  }

  function handleDelete(id: string) {
    if (!currentGroup) return;
    if (!canDelete) {
      setError('Your role cannot delete products');
      return;
    }

    void (async () => {
      try {
        await deleteProduct(currentGroup.id, id);
        setTracking({
          lastProductsAction: 'delete',
          lastProductsActionAt: new Date().toISOString(),
        });
        await loadPage(1, true);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      }
    })();
  }

  if (!isHydrated) {
    return null;
  }

  if (!currentGroup || !currentMember) {
    return null;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Products</h1>
      {canCreate && (
        <form onSubmit={handleCreate} style={{ marginBottom: 16 }}>
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input placeholder="Price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          <button type="submit">Create</button>
        </form>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <table border={1} cellPadding={8} style={{ width: '100%', marginBottom: 12 }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p: Product) => (
            <tr key={p.id}>
              <td>{p.productName}</td>
              <td>{p.price}</td>
              <td>
                {canDelete ? (
                  <button onClick={() => handleDelete(p.id)}>Delete</button>
                ) : (
                  <span>Read only</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginBottom: 8, color: '#475569' }}>
        {loading ? 'Loading...' : `Loaded page ${page} of ${totalPages}`}
      </div>
      <div ref={sentinelRef} style={{ height: 24 }} />
    </div>
  );
}
