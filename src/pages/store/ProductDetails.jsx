import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Star, ShoppingCart, ArrowLeft, Truck, ShieldCheck, 
  MapPin, Lock, RotateCcw, Check, Sparkles, CreditCard, ChevronRight,
  Package, Zap, Award, ThumbsUp, Heart, Share2, Tag, HelpCircle, Shield,
  TicketPercent, Copy, CheckCircle2
} from 'lucide-react';
import { productAPI, couponAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/currency';
import ProductCard from '../../components/ProductCard';
import { getProductFallback, handleImageError } from '../../utils/productImages';
import '../../styles/store.css';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [copiedCoupon, setCopiedCoupon] = useState(null);

  const { addToCart, applyCoupon } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();
  const isWishlisted = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    setLoading(true);
    productAPI.byId(id)
      .then((data) => {
        setProduct(data);
        setSelectedImage(data.imageUrl);
        if (data.category?.slug) {
          productAPI.list({ category: data.category.slug, size: 5 })
            .then(res => {
              const items = Array.isArray(res) ? res : (res?.content || []);
              setRelatedProducts(items.filter(p => p.id !== data.id));
            })
            .catch(console.error);
        }
      })
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false));

    couponAPI.getActive()
      .then((data) => setCoupons(data || []))
      .catch((err) => console.error('Failed to load coupons', err));
  }, [id, navigate]);

  const handleCopyCoupon = (code, e) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    toast.success(`Coupon code ${code} copied!`);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      const ok = await addToCart(product.id, quantity, product);
      if (ok) {
        toast.success(`${product.name} (Qty: ${quantity}) added to cart!`);
      } else {
        toast.error('Failed to add product to cart');
      }
    } catch (e) {
      toast.error('Failed to add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity, product);
    } catch (e) {
      console.warn('Buy now cart sync warning:', e);
    } finally {
      setAddingToCart(false);
      navigate('/checkout');
    }
  };

  const handleToggleWishlist = () => {
    if (product) toggleWishlist(product);
  };

  const discount = product?.comparePrice && product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : (product?.featured ? 25 : 18);

  const effectiveComparePrice = product?.comparePrice || Math.round((product?.price || 0) * 1.25);
  const savings = effectiveComparePrice ? effectiveComparePrice - (product?.price || 0) : 0;
  const ratingScore = product?.rating || 4.5;
  const reviewCount = product?.reviewsCount || 2480;

  const galleryImages = (() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images.filter(Boolean);
    }
    if (product.imageUrl) {
      if (product.imageUrl.startsWith('[') && product.imageUrl.endsWith(']')) {
        try {
          const parsed = JSON.parse(product.imageUrl);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed.filter(Boolean);
        } catch (e) {}
      }
      if (product.imageUrl.includes(',')) {
        return product.imageUrl.split(',').map(s => s.trim()).filter(Boolean);
      }
      return [product.imageUrl];
    }
    return [];
  })();

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '8rem 0', color: '#64748b' }}>
        <div className="luxury-spinner" style={{ margin: '0 auto 1.25rem' }} />
        <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Loading product details...</p>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '5rem' }}>
      <div className="container" style={{ maxWidth: '1440px', padding: '0 1.5rem' }}>
        
        {/* Amazon-Style Breadcrumb Navigation */}
        <nav style={{ padding: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', color: '#64748b' }}>
          <Link to="/" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
          <ChevronRight size={13} />
          <Link to="/shop" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 600 }}>All Departments</Link>
          <ChevronRight size={13} />
          {product.category && (
            <>
              <Link to={`/shop?category=${product.category.slug}`} style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 600 }}>
                {product.category.name}
              </Link>
              <ChevronRight size={13} />
            </>
          )}
          <span style={{ color: '#0f172a', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
            {product.name}
          </span>
        </nav>

        {/* Amazon & Flipkart Classic 3-Column PDP Grid */}
        <div className="amz-pdp-layout">
          
          {/* ================= COLUMN 1: IMAGE GALLERY ================= */}
          <div style={{ position: 'sticky', top: '120px' }}>
            <div className="amz-gallery-container" style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
              
              {/* Vertical / Responsive Thumbnail Strip (only if product has multiple real images) */}
              {galleryImages.length > 1 && (
                <div className="amz-thumbnails-strip" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '10px',
                        border: (selectedImage || product.imageUrl) === img ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                        background: '#ffffff',
                        padding: '3px',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        boxShadow: (selectedImage || product.imageUrl) === img ? '0 2px 8px rgba(79, 70, 229, 0.25)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <img 
                        src={img} 
                        alt="" 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                        onError={(e) => handleImageError(e, product)}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image Stage */}
              <div style={{
                flex: 1,
                aspectRatio: '1',
                maxHeight: '480px',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <img
                  src={selectedImage || product.imageUrl || getProductFallback(product)}
                  alt={product.name}
                  style={{ width: '90%', height: '90%', objectFit: 'contain', transition: 'transform 0.4s ease' }}
                  onError={(e) => handleImageError(e, product)}
                />

                {/* Wishlist Button */}
                <button
                  onClick={handleToggleWishlist}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isWishlisted ? '#e11d48' : '#64748b',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                  }}
                  title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
                >
                  <Heart size={18} fill={isWishlisted ? '#e11d48' : 'none'} />
                </button>
              </div>

            </div>
          </div>

          {/* ================= COLUMN 2: PRODUCT DETAILS & OFFERS ================= */}
          <div>
            
            {/* Brand Store Link */}
            <div style={{ marginBottom: '0.45rem' }}>
              <Link to="/shop" style={{ color: '#4f46e5', fontSize: '0.82rem', fontWeight: 800, textDecoration: 'none', textTransform: 'uppercase' }}>
                Visit the AURA Official Brand Store
              </Link>
            </div>

            {/* Product Title */}
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.75rem 0', lineHeight: 1.3 }}>
              {product.name}
            </h1>

            {/* Amazon-Style Rating Line */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span className="amz-rating-pill">
                  {ratingScore.toFixed(1)} <Star size={11} fill="#ffffff" color="#ffffff" />
                </span>
                <div style={{ display: 'flex', gap: '2px', marginLeft: '0.25rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < Math.floor(ratingScore) ? '#f59e0b' : 'none'}
                      color={i < Math.floor(ratingScore) ? '#f59e0b' : '#cbd5e1'}
                    />
                  ))}
                </div>
              </div>
              <span style={{ color: '#4f46e5', fontSize: '0.84rem', fontWeight: 600 }}>
                {reviewCount.toLocaleString()} ratings
              </span>
              <span style={{ color: '#cbd5e1' }}>|</span>
              <span style={{ color: '#64748b', fontSize: '0.84rem' }}>
                128 answered questions
              </span>
              <span style={{ color: '#cbd5e1' }}>|</span>
              <span className="amz-assured-badge">
                <ShieldCheck size={11} /> AURA ASSURED
              </span>
            </div>

            {/* Pricing Section (Amazon Style) */}
            <div style={{ marginBottom: '1.5rem', background: '#ffffff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.65rem' }}>
                <Tag size={12} /> Limited time deal
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e11d48' }}>
                  -{discount}%
                </span>
                <span style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  {formatINR(product.price)}
                </span>
              </div>

              <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.25rem' }}>
                M.R.P.: <span style={{ textDecoration: 'line-through' }}>{formatINR(effectiveComparePrice)}</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700, marginTop: '0.2rem' }}>
                Inclusive of all taxes • You save {formatINR(savings)} ({discount}%)
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '0.85rem', paddingTop: '0.85rem', fontSize: '0.82rem', color: '#334155' }}>
                <strong>EMI</strong> starts at ₹1,212 per month. <span style={{ color: '#4f46e5', fontWeight: 600 }}>No Cost EMI available</span>
              </div>
            </div>

            {/* Dynamic Store Coupons for this Product */}
            {coupons.length > 0 && (
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <TicketPercent size={18} color="#4f46e5" /> Available Coupons for this Product
                  </h4>
                  <Link to="/customer/dashboard" style={{ fontSize: '0.78rem', color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>
                    View All Vouchers →
                  </Link>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {coupons.map((c) => {
                    const isEligible = !c.minOrderAmount || product.price >= c.minOrderAmount;
                    const savingsAmount = c.discountType === 'PERCENTAGE'
                      ? Math.min(c.maxDiscountAmount || 999999, Math.round(product.price * (c.discountValue / 100)))
                      : Math.min(product.price, c.discountValue);
                    const diffToUnlock = (c.minOrderAmount || 0) - product.price;
                    const isCopied = copiedCoupon === c.code;

                    return (
                      <div
                        key={c.id}
                        style={{
                          background: isEligible ? '#f8faff' : '#ffffff',
                          border: isEligible ? '1.5px solid #c7d2fe' : '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '0.85rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          flexWrap: 'wrap',
                          boxShadow: isEligible ? '0 2px 10px rgba(79, 70, 229, 0.05)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {/* Code Monospace Pill */}
                          <div style={{
                            background: '#ffffff',
                            border: '1px dashed #4f46e5',
                            borderRadius: '6px',
                            padding: '0.3rem 0.6rem',
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            fontSize: '0.86rem',
                            color: '#4f46e5'
                          }}>
                            {c.code}
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                                {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                              </span>
                              <span style={{
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '9999px',
                                background: isEligible ? '#ecfdf5' : '#f1f5f9',
                                color: isEligible ? '#059669' : '#64748b',
                                border: isEligible ? '1px solid #a7f3d0' : '1px solid #cbd5e1'
                              }}>
                                {isEligible ? 'Eligible on this item' : `Min order ${formatINR(c.minOrderAmount)}`}
                              </span>
                            </div>

                            <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                              {isEligible ? (
                                <span style={{ color: '#059669', fontWeight: 700 }}>
                                  ✓ You save {formatINR(savingsAmount)} instantly with this coupon!
                                </span>
                              ) : (
                                <span>Add items worth {formatINR(diffToUnlock)} more to your cart to unlock.</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <button
                            type="button"
                            onClick={(e) => handleCopyCoupon(c.code, e)}
                            style={{
                              background: isCopied ? '#ecfdf5' : '#ffffff',
                              border: isCopied ? '1px solid #a7f3d0' : '1px solid #cbd5e1',
                              color: isCopied ? '#059669' : '#0f172a',
                              borderRadius: '6px',
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            {isCopied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                            <span>{isCopied ? 'Copied' : 'Copy'}</span>
                          </button>

                          {isEligible && (
                            <button
                              type="button"
                              onClick={async () => {
                                await applyCoupon(c.code);
                                toast.success(`Applied coupon ${c.code} to your cart!`);
                              }}
                              style={{
                                background: '#4f46e5',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.35rem 0.75rem',
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Apply
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bank Offers Carousel */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.65rem 0', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <CreditCard size={16} color="#4f46e5" /> Additional Partner Offers
              </h4>
              <div className="amz-bank-offers-container">
                <div className="amz-bank-offer-card">
                  <div className="amz-bank-offer-title">
                    <Zap size={14} color="#059669" /> Bank Offer
                  </div>
                  <div>Up to ₹1,500 Instant Discount on HDFC & ICICI Credit Cards.</div>
                </div>

                <div className="amz-bank-offer-card">
                  <div className="amz-bank-offer-title">
                    <CreditCard size={14} color="#4f46e5" /> No Cost EMI
                  </div>
                  <div>Zero interest on 3 & 6 month tenures on select bank cards.</div>
                </div>

                <div className="amz-bank-offer-card">
                  <div className="amz-bank-offer-title">
                    <Award size={14} color="#d97706" /> Partner Offers
                  </div>
                  <div>Get GST invoice and save up to 28% on business purchases.</div>
                </div>
              </div>
            </div>

            {/* 4-Pill Amazon Trust Strip */}
            <div className="amz-pdp-trust-grid">
              <div>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.45rem' }}>
                  <RotateCcw size={18} />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>7 Days</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Replacement</div>
              </div>

              <div>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.45rem' }}>
                  <Truck size={18} />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>Free Express</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Delivery</div>
              </div>

              <div>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.45rem' }}>
                  <ShieldCheck size={18} />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>2-Year</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Warranty</div>
              </div>

              <div>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.45rem' }}>
                  <Award size={18} />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>Top Brand</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>AURA Official</div>
              </div>
            </div>

            {/* About This Item (Bullet Points) */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.85rem 0' }}>
                About this item
              </h3>
              <ul style={{ paddingLeft: '1.25rem', color: '#334155', fontSize: '0.88rem', lineHeight: '1.6', margin: 0 }}>
                <li>{product.description || 'Precision engineering with custom acoustics and aerospace-grade chassis.'}</li>
                <li>Industry-leading active noise cancellation with dual feedback processors and adaptive acoustic calibration.</li>
                <li>Up to 40 hours of unbroken listening playback on a single quick charge via USB-C fast charging.</li>
                <li>Crystal clear hands-free calls with beamforming microphone array and on-device machine intelligence.</li>
                <li>Multipoint Bluetooth 5.4 connectivity allowing simultaneous pairing with laptop and mobile devices.</li>
              </ul>
            </div>

            {/* Technical Specifications Table */}
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.85rem 0' }}>
                Technical Details
              </h3>
              <table style={{ width: '100%', fontSize: '0.84rem', borderCollapse: 'collapse', background: '#ffffff', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.65rem 1rem', background: '#f8fafc', fontWeight: 700, color: '#475569', width: '35%' }}>Brand</td>
                    <td style={{ padding: '0.65rem 1rem', color: '#0f172a' }}>AURA Studio Official</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.65rem 1rem', background: '#f8fafc', fontWeight: 700, color: '#475569' }}>Category</td>
                    <td style={{ padding: '0.65rem 1rem', color: '#0f172a' }}>{product.category?.name || 'Electronics'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.65rem 1rem', background: '#f8fafc', fontWeight: 700, color: '#475569' }}>Connectivity</td>
                    <td style={{ padding: '0.65rem 1rem', color: '#0f172a' }}>Wireless, Bluetooth 5.4, USB-C Lossless</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.65rem 1rem', background: '#f8fafc', fontWeight: 700, color: '#475569' }}>Item Weight</td>
                    <td style={{ padding: '0.65rem 1rem', color: '#0f172a' }}>254 grams</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.65rem 1rem', background: '#f8fafc', fontWeight: 700, color: '#475569' }}>Warranty</td>
                    <td style={{ padding: '0.65rem 1rem', color: '#0f172a' }}>2-Year Global Replacement Guarantee</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

          {/* ================= COLUMN 3: AMAZON STICKY BUY BOX ================= */}
          <div className="amz-buybox">
            
            {/* Price */}
            <div>
              <span style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a' }}>
                {formatINR(product.price)}
              </span>
            </div>

            {/* Delivery Info */}
            <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: '1.4' }}>
              <div>
                <strong style={{ color: '#0f172a' }}>FREE delivery</strong> <strong>Tomorrow, 2 PM</strong>.
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                Order within <span style={{ color: '#059669', fontWeight: 700 }}>3 hrs 45 mins</span>.
              </div>
            </div>

            {/* Location selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#4f46e5', fontWeight: 600 }}>
              <MapPin size={14} />
              <span>Deliver to Bengaluru 560001</span>
            </div>

            {/* In Stock Badge */}
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669' }}>
              In Stock.
            </div>

            {/* Quantity Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#475569' }}>Quantity:</span>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {/* CTA Buttons (Add to Cart & Buy Now) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="amz-btn-addbag-pdp"
                id="pdp-add-to-cart-btn"
              >
                <ShoppingCart size={17} />
                <span>{addingToCart ? 'Adding...' : 'Add to Cart'}</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={addingToCart}
                className="amz-btn-buynow"
                id="pdp-buy-now-btn"
              >
                <Zap size={17} />
                <span>Buy Now</span>
              </button>

              <button
                type="button"
                onClick={handleToggleWishlist}
                id="pdp-wishlist-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  background: isWishlisted ? '#fff1f2' : '#ffffff',
                  border: isWishlisted ? '1px solid #fecdd3' : '1px solid #cbd5e1',
                  color: isWishlisted ? '#e11d48' : '#334155',
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  marginTop: '0.2rem'
                }}
              >
                <Heart size={16} fill={isWishlisted ? '#e11d48' : 'none'} color={isWishlisted ? '#e11d48' : '#64748b'} />
                <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>

              {isWishlisted && (
                <Link
                  to="/wishlist"
                  id="pdp-view-wishlist-link"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    color: '#e11d48',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    textAlign: 'center',
                    padding: '0.35rem',
                    borderRadius: '6px',
                    background: 'rgba(225, 29, 72, 0.05)'
                  }}
                >
                  <span>View All Saved Items in Wishlist →</span>
                </Link>
              )}
            </div>

            {/* Security & Seller Details */}
            <div style={{ fontSize: '0.76rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.45rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569' }}>
                <Lock size={13} color="#059669" />
                <span>Secure transaction</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Ships from</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>AURA Logistics</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Sold by</span>
                <span style={{ fontWeight: 700, color: '#4f46e5' }}>AURA Official Retail</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Returns</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>7-Day Replacement</span>
              </div>
            </div>

          </div>

        </div>

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '3.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '2.5rem' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1.5rem 0' }}>
              Customers Who Viewed This Item Also Viewed
            </h3>
            <div className="amz-products-grid">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} viewMode="grid" />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Mobile Sticky Buy/Add to Bag Bar on Phones */}
      <div className="pdp-mobile-sticky-bar">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Total Price</span>
          <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>{formatINR(product.price)}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flex: 1, justifyContent: 'flex-end' }}>
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="amz-btn-addbag-pdp"
            style={{ width: 'auto', padding: '0.55rem 1rem', fontSize: '0.82rem' }}
          >
            <ShoppingCart size={15} /> Add
          </button>
          <button
            onClick={handleBuyNow}
            disabled={addingToCart}
            className="amz-btn-buynow"
            style={{ width: 'auto', padding: '0.55rem 1.25rem', fontSize: '0.82rem' }}
          >
            <Zap size={15} /> Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
