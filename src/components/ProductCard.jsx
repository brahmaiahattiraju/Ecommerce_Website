import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Sparkles, ShieldCheck, Truck, ArrowRight, Heart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';
import { getProductFallback, handleImageError } from '../utils/productImages';
import '../styles/store.css';

export default function ProductCard({ product, viewMode = 'grid' }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const toast = useToast();
  const isWishlisted = isInWishlist(product.id);

  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : (product.featured ? 25 : 15);

  const effectiveComparePrice = product.comparePrice || Math.round(product.price * 1.25);
  const ratingScore = product.rating || 4.5;
  const reviewCount = product.reviewsCount || 1240;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const success = await addToCart(product.id, 1, product);
    if (success) {
      toast.success(`${product.name} added to cart`);
    } else {
      toast.error('Unable to add product to cart');
    }
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  if (viewMode === 'list') {
    return (
      <Link 
        to={`/product/${product.id}`} 
        className="luxury-card-horizontal" 
        id={`product-list-${product.id}`}
        style={{ marginBottom: '1.25rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px' }}
      >
        <div className="card-h-media" style={{ position: 'relative' }}>
          <img
            src={product.imageUrl || getProductFallback(product)}
            alt={product.name}
            loading="lazy"
            className="card-h-img"
            onError={(e) => handleImageError(e, product)}
          />
          <button
            className="amz-card-wishlist-btn"
            onClick={handleToggleWishlist}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            type="button"
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              zIndex: 2,
              background: 'rgba(255, 255, 255, 0.92)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
            }}
          >
            <Heart size={16} fill={isWishlisted ? "#e11d48" : "none"} color={isWishlisted ? "#e11d48" : "#64748b"} />
          </button>
          {discount > 0 && (
            <span className="amz-deal-badge">
              {discount}% OFF
            </span>
          )}
        </div>

        <div className="card-h-content" style={{ padding: '1.5rem' }}>
          <div className="card-h-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
              <span className="amz-assured-badge">
                <ShieldCheck size={12} /> AURA ASSURED
              </span>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                {product.category?.name || 'ELECTRONICS'}
              </span>
            </div>

            <h3 className="card-h-title" style={{ fontSize: '1.15rem', margin: '0 0 0.5rem 0' }}>
              {product.name}
            </h3>

            <div className="amz-rating-row">
              <span className="amz-rating-pill">
                {ratingScore.toFixed(1)} <Star size={11} fill="#ffffff" color="#ffffff" />
              </span>
              <span className="amz-rating-count">({reviewCount.toLocaleString()} ratings)</span>
            </div>

            <p className="card-h-desc" style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 0.85rem 0' }}>
              {product.description || 'Premium build with active noise cancellation, precision acoustics, and 40-hour playback.'}
            </p>

            <div className="amz-delivery-info">
              <span className="amz-delivery-bold">FREE Delivery by Tomorrow, 2 PM</span>
              <div style={{ color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                ⚡ In Stock • Ready to Dispatch
              </div>
            </div>
          </div>

          <div className="card-h-footer" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <div className="amz-pricing-block" style={{ marginBottom: 0 }}>
              <span className="amz-price-current">{formatINR(product.price)}</span>
              <span className="amz-price-mrp">{formatINR(effectiveComparePrice)}</span>
              <span className="amz-price-discount">({discount}% off)</span>
            </div>

            <button
              className="amz-btn-add-cart"
              onClick={handleAddToCart}
              style={{ width: 'auto', padding: '0.65rem 1.6rem', borderRadius: '9999px' }}
              type="button"
            >
              <ShoppingCart size={16} /> Add to Cart
            </button>
          </div>
        </div>
      </Link>
    );
  }

  // Grid Mode (Amazon & Flipkart High-Density Card)
  return (
    <Link 
      to={`/product/${product.id}`} 
      className="amz-card" 
      id={`product-${product.id}`}
    >
      {/* Product Image Stage */}
      <div className="amz-card-media">
        <img
          src={product.imageUrl || getProductFallback(product)}
          alt={product.name}
          loading="lazy"
          className="amz-card-img"
          onError={(e) => handleImageError(e, product)}
        />

        {/* Wishlist Button */}
        <button
          className="amz-card-wishlist-btn"
          onClick={handleToggleWishlist}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          type="button"
        >
          <Heart size={16} fill={isWishlisted ? "#e11d48" : "none"} color={isWishlisted ? "#e11d48" : "currentColor"} />
        </button>

        {/* Deal Tag */}
        {discount >= 20 ? (
          <span className="amz-deal-badge">
            {discount}% OFF
          </span>
        ) : (
          <span className="amz-deal-badge" style={{ background: '#4f46e5' }}>
            TOP DEAL
          </span>
        )}
      </div>

      {/* Product Information */}
      <div>
        {/* Assured Badge & Category */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span className="amz-assured-badge">
            <ShieldCheck size={11} /> AURA ASSURED
          </span>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            {product.category?.name || 'Electronics'}
          </span>
        </div>

        {/* Product Title */}
        <h3 className="amz-card-title" title={product.name}>
          {product.name}
        </h3>

        {/* Ratings & Reviews */}
        <div className="amz-rating-row">
          <span className="amz-rating-pill">
            {ratingScore.toFixed(1)} <Star size={10} fill="#ffffff" color="#ffffff" />
          </span>
          <span className="amz-rating-count">({reviewCount.toLocaleString()})</span>
        </div>

        {/* Pricing Block */}
        <div className="amz-pricing-block">
          <span className="amz-price-current">{formatINR(product.price)}</span>
          <span className="amz-price-mrp">{formatINR(effectiveComparePrice)}</span>
          <span className="amz-price-discount">({discount}% off)</span>
        </div>

        {/* Delivery Guarantee */}
        <div className="amz-delivery-info">
          <span>FREE Delivery by </span>
          <span className="amz-delivery-bold">Tomorrow, 2 PM</span>
        </div>
      </div>

      {/* Quick Add to Cart Action */}
      <button
        className="amz-btn-add-cart"
        onClick={handleAddToCart}
        id={`add-bag-${product.id}`}
        type="button"
      >
        <ShoppingCart size={15} />
        <span>Add to Cart</span>
      </button>
    </Link>
  );
}
