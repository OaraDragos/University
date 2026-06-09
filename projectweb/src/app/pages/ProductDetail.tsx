import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGroup } from '../context/GroupContext';
import { getProduct, updateProduct } from '../services/tripBuddyApi';
import { setTracking } from '../utils/cookieTracker';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentGroup, isHydrated } = useGroup();
  const [productName, setProductName] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!currentGroup || !id) {
      navigate('/products');
      return;
    }

    void (async () => {
      setLoading(true);
      try {
        const product = await getProduct(currentGroup.id, id);
        setProductName(product.productName);
        setPrice(String(product.price));
        setTracking({
          lastViewedProductId: product.id,
          lastViewedProductName: product.productName,
          lastProductsAction: 'view_detail',
          lastProductsActionAt: new Date().toISOString(),
        });
      } catch (err: any) {
        setError(err?.message || 'Could not load product');
      } finally {
        setLoading(false);
      }
    })();
  }, [currentGroup?.id, id, isHydrated, navigate]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!id || !currentGroup) return;
    const priceNum = Number(price);
    void (async () => {
      try {
        await updateProduct(currentGroup.id, id, { productName: productName.trim(), price: priceNum });
        setTracking({
          lastProductsAction: 'update',
          lastProductsActionAt: new Date().toISOString(),
        });
        navigate('/products');
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      }
    })();
  }

  if (!isHydrated || loading) return <div style={{ padding: 20 }}>Loading...</div>;

  if (error) {
    return <div style={{ padding: 20, color: 'red' }}>{error}</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Product detail</h1>
      <form onSubmit={handleSave}>
        <div>
          <label>Name</label>
          <input value={productName} onChange={(e) => setProductName(e.target.value)} />
        </div>
        <div>
          <label>Price</label>
          <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div>
          <button type="submit">Save</button>
          <button type="button" onClick={() => navigate('/products')}>Cancel</button>
        </div>
      </form>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}

