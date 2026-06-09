import * as React from 'react';
import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useGroup } from '../context/GroupContext';

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UNITS = [
  { value: 'buc', label: 'buc (pieces)' },
  { value: 'pachete', label: 'pachete (packages)' },
  { value: 'kg', label: 'kg (kilograms)' },
  { value: 'L', label: 'L (liters)' },
  { value: 'g', label: 'g (grams)' },
];

const INPUT_CLASSNAME =
  'h-12 rounded-xl border border-[#E5E7EB] bg-[#F3F4F6] px-4 text-[16px] text-[#111827] placeholder:text-[#6B7280] focus-visible:ring-2 focus-visible:ring-green-200 focus-visible:border-[#22C55E]';

export default function AddProductDialog({ open, onOpenChange }: AddProductDialogProps) {
  const { currentMember, addProduct } = useGroup();
  const [productName, setProductName] = useState('');
  const [supermarket, setSupermarket] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('buc');
  const [category, setCategory] = useState('');
  const [photo, setPhoto] = useState('');

  React.useEffect(() => {
    if (!open) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onOpenChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedProductName = productName.trim();
    const trimmedSupermarket = supermarket.trim();
    const trimmedCategory = category.trim();
    const trimmedPhoto = photo.trim();
    const parsedPrice = Number(price);
    const parsedQuantity = Number(quantity);

    if (!trimmedProductName || !trimmedSupermarket || !trimmedCategory) {
      alert('Please fill in all required fields');
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      alert('Price must be a valid non-negative number');
      return;
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      alert('Quantity must be a whole number greater than 0');
      return;
    }

    if (!currentMember) return;

    addProduct({
      productName: trimmedProductName,
      supermarket: trimmedSupermarket,
      price: parsedPrice,
      quantity: parsedQuantity,
      unit,
      category: trimmedCategory,
      photo: trimmedPhoto || undefined,
      addedBy: currentMember.id,
      addedByName: currentMember.name,
      votes: {
        thumbsUp: [],
        thumbsDown: []
      }
    });

    // Reset form
    setProductName('');
    setSupermarket('');
    setPrice('');
    setQuantity('1');
    setUnit('buc');
    setCategory('');
    setPhoto('');
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={() => onOpenChange(false)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(1px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.35)',
          padding: '24px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, lineHeight: 1.1 }}>Add Product</h2>
            <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#6B7280', lineHeight: 1.45 }}>
              Add a new item to the shopping list with pricing details.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close dialog"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '999px',
              border: '1px solid #E5E7EB',
              background: '#FFFFFF',
              color: '#6B7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productName" className="text-[14px] font-semibold text-[#111827]">Product Name *</Label>
            <Input
              id="productName"
              placeholder="e.g., Premium Burgers"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className={INPUT_CLASSNAME}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supermarket" className="text-[14px] font-semibold text-[#111827]">Supermarket *</Label>
            <Input
              id="supermarket"
              placeholder="e.g., Walmart"
              value={supermarket}
              onChange={(e) => setSupermarket(e.target.value)}
              className={INPUT_CLASSNAME}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-[14px] font-semibold text-[#111827]">Unit Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={INPUT_CLASSNAME}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-[14px] font-semibold text-[#111827]">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={INPUT_CLASSNAME}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[14px] font-semibold text-[#111827]">Unit *</Label>
            <div className="grid grid-cols-3 gap-2">
              {UNITS.map((u) => (
                <Button
                  key={u.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUnit(u.value)}
                  className={`h-10 rounded-xl border text-[14px] font-semibold transition-colors ${
                    unit === u.value
                      ? 'border-[#00C853] bg-[#00C853] text-white hover:bg-[#00B84A]'
                      : 'border-[#D1D5DB] bg-white text-[#111827] hover:bg-[#F3F4F6]'
                  }`}
                >
                  {u.value}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-[14px] font-semibold text-[#111827]">Category *</Label>
            <Input
              id="category"
              placeholder="e.g., Meat, Drinks, Snacks"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={INPUT_CLASSNAME}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo" className="text-[14px] font-semibold text-[#111827]">Photo URL (optional)</Label>
            <Input
              id="photo"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
              className={INPUT_CLASSNAME}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12 flex-1 rounded-xl border-[#D1D5DB] text-[16px] font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-12 flex-1 rounded-xl bg-[#00C853] text-[16px] font-semibold hover:bg-[#00B84A]"
            >
              Add Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
