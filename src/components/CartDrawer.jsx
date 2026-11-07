import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';
import { getProductFallback, handleImageError } from '../utils/productImages';
import '../styles/store.css';

export default function CartDrawer({ onClose }) {
  const { cartItems, itemCount, subtotal, updateQuantity, removeItem } = useCart();
  const { wishlistCount } = useWishlist();
  const toast = useToast();

  const handleRemove = async (itemId, name) => {
    await removeItem(itemId);
    toast.info(`${name || 'Creation'} removed from bag`);
  };

  const handleQty = async (itemId, newQty) => {
    if (newQty < 1) return;
    await updateQuantity(itemId, newQty);
  };

  const freeDeliveryThreshold = 50000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));
  const remainingForFree = Math.max(0, freeDeliveryThreshold - subtotal);

  return (
    <>
      <div className="cart-drawer-overlay" onClick={onClose} />
      <div className="cart-drawer" style={{ background: '#ffffff', color: '#0f172a' }}>
        {/* Header */}
        <div className="cart-drawer-header" style={{ borderBottom: '1px solid #e2e8f0', padding: '1.25rem 1.5rem', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Shopping Bag
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                {itemCount} {itemCount === 1 ? 'curated creation' : 'curated creations'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="icon-btn" id="cart-close-btn" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '50%', width: '32px', height: '32px', color: '#64748b' }}>
            <X size={16} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        {cartItems.length > 0 && (
          <div style={{ padding: '0.85rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              <span>{progressPercent >= 100 ? '🎉 Complimentary Courier Unlocked' : `Add ${formatINR(remainingForFree)} for Free Courier`}</span>
              <span>{progressPercent}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #4f46e5, #06b6d4)', transition: 'width 0.4s ease' }}></div>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="cart-drawer-items" style={{ padding: '1.25rem 1.5rem' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#94a3b8' }}>
                <ShoppingBag size={28} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>Your Bag is Empty</h4>
              <p style={{ color: '#64748b', fontSize: '0.86rem', marginBottom: '1.75rem' }}>
                Discover our signature acoustics and precision computing masterpieces.
              </p>
              <button onClick={onClose} className="btn-keynote-primary" style={{ padding: '0.7rem 1.5rem', fontSize: '0.88rem' }}>
                Explore Atelier Catalog
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cartItems.map(item => {
                const name = item.product?.name || item.productName || 'Aura Creation';
                const img = item.product?.imageUrl || item.imageUrl || getProductFallback(item.product || item);
                const price = item.price || item.product?.price || 0;
                return (
                  <div key={item.id} style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '0.85rem',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  }}>
                    <img
                      src={img}
                      alt={name}
                      onError={(e) => handleImageError(e, item.product || item)}
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '10px',
                        objectFit: 'contain',
                        background: '#f8fafc',
                        padding: '4px',
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', margin: '0 0 0.2rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {name}
                        </p>
                        <p style={{ color: '#4f46e5', fontWeight: 800, fontSize: '0.95rem', margin: 0 }}>
                          {formatINR(price * item.quantity)}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderRadius: '9999px',
                          padding: '2px 4px',
                        }}>
                          <button
                            onClick={() => handleQty(item.id, item.quantity - 1)}
                            style={{ width: '22px', height: '22px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a' }}
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ minWidth: '22px', textAlign: 'center', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQty(item.id, item.quantity + 1)}
                            style={{ width: '22px', height: '22px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a' }}
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemove(item.id, name)}
                          style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer" style={{ borderTop: '1px solid #e2e8f0', padding: '1.25rem 1.5rem', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.88rem', color: '#64748b' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatINR(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem', fontSize: '0.88rem', color: '#64748b' }}>
              <span>Courier Delivery</span>
              <span style={{ fontWeight: 700, color: '#059669' }}>Complimentary</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
              <span>Total Amount</span>
              <span style={{ color: '#0f172a' }}>{formatINR(subtotal)}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                to="/checkout"
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: '#0f172a',
                  color: '#ffffff',
                  padding: '0.85rem',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.18)',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/cart"
                onClick={onClose}
                style={{
                  textAlign: 'center',
                  color: '#4f46e5',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                View Detailed Bag & Apply Promo Code
              </Link>
              <Link
                to="/wishlist"
                onClick={onClose}
                id="drawer-view-wishlist-link"
                style={{
                  textAlign: 'center',
                  color: '#e11d48',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  marginTop: '0.2rem'
                }}
              >
                <Heart size={14} fill="#e11d48" />
                <span>View Saved Wishlist ({wishlistCount}) →</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
