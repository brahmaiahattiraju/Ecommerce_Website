import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight, Star, ShieldCheck, Sparkles } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { formatINRCompact } from '../../utils/currency';
import '../../styles/store.css';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const toast = useToast();

  const handleMoveToCart = async (product) => {
    try {
      await addToCart(product.id, 1);
      removeFromWishlist(product.id);
      toast.success(`Moved ${product.name.slice(0, 24)}... to your Bag!`);
    } catch (err) {
      toast.error('Could not move item to bag');
    }
  };

  const items = Array.isArray(wishlist) ? wishlist.filter(Boolean) : [];

  return (
    <div style={{ background: '#f8fafc', minHeight: '85vh', padding: '2.5rem 1rem 5rem' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header Breadcrumb & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ffe4e6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart size={22} fill="#e11d48" color="#e11d48" />
              </div>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                  My Wishlist & Saved Items
                </h1>
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b' }}>
                  {items.length} {items.length === 1 ? 'item' : 'items'} saved for later
                </p>
              </div>
            </div>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={clearWishlist}
              style={{
                background: '#ffffff',
                border: '1px solid #fecdd3',
                color: '#e11d48',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease'
              }}
            >
              <Trash2 size={15} /> Clear All
            </button>
          )}
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            padding: '4.5rem 2rem',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
          }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Heart size={38} color="#f43f5e" />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Your Wishlist is Empty
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem', maxWidth: '440px', margin: '0 auto 1.75rem', lineHeight: '1.5' }}>
              Explore our curated catalog of flagship technology, audio, and luxury lifestyle pieces. Click the heart icon on any product to save it here.
            </p>
            <Link
              to="/shop"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                color: '#ffffff',
                padding: '0.75rem 1.75rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.92rem',
                textDecoration: 'none',
                boxShadow: '0 4px 15px rgba(79, 70, 229, 0.35)'
              }}
            >
              <span>Explore Department Catalog</span>
              <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          /* Wishlist Items Grid */
          <div className="customer-wishlist-grid">
            {items.map((item) => {
              const price = Number(item.price) || 0;
              const comp = Number(item.comparePrice) || Math.round(price * 1.25);
              const discount = comp > price ? Math.round((1 - price / comp) * 100) : 0;

              return (
                <div
                  key={item.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  {/* Image Stage */}
                  <div className="customer-wishlist-card-media" style={{ position: 'relative', height: '220px', background: '#f8fafc', overflow: 'hidden' }}>
                    <Link to={`/products/${item.id}`}>
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Link>

                    {discount > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: '#e11d48',
                        color: '#ffffff',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px'
                      }}>
                        {discount}% OFF
                      </span>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(item.id)}
                      title="Remove from wishlist"
                      aria-label="Remove item"
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#e11d48',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Details */}
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '0.72rem', color: '#4f46e5', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      {item.category?.name || 'Exclusive Luxury'}
                    </div>

                    <Link
                      to={`/products/${item.id}`}
                      className="customer-wishlist-card-title"
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        textDecoration: 'none',
                        lineHeight: '1.35',
                        marginBottom: '0.5rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {item.name}
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.75rem' }}>
                      <Star size={13} fill="#f59e0b" color="#f59e0b" />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{item.rating || 4.8}</span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>• Authentic</span>
                    </div>

                    <div className="customer-wishlist-card-price" style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: 'auto', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                        {formatINRCompact(item.price)}
                      </span>
                      {comp > item.price && (
                        <span style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                          {formatINRCompact(comp)}
                        </span>
                      )}
                    </div>

                    {/* Move to bag button */}
                    <button
                      type="button"
                      onClick={() => handleMoveToCart(item)}
                      className="customer-wishlist-card-btn"
                      style={{
                        width: '100%',
                        background: '#0f172a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.65rem 1rem',
                        fontWeight: 700,
                        fontSize: '0.86rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.45rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <ShoppingBag size={16} /> Move to Bag
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
