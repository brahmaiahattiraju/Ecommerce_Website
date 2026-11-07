import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, Plus, Minus, ArrowRight, ShoppingCart, ShieldCheck, 
  Truck, Sparkles, Tag, Check, CheckCircle2, Lock, Gift, HelpCircle,
  TicketPercent, X
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { couponAPI } from '../../services/api';
import { formatINR } from '../../utils/currency';
import { getProductFallback, handleImageError } from '../../utils/productImages';
import '../../styles/store.css';

export default function CartPage() {
  const { 
    cartItems, subtotal, updateQuantity, removeItem, clearCart,
    appliedCoupon, discountAmount, finalTotal, applyCoupon, removeCoupon 
  } = useCart();
  const navigate = useNavigate();
  const toast = useToast();
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [validating, setValidating] = useState(false);
  const [activePromos, setActivePromos] = useState([]);
  const [isGift, setIsGift] = useState(false);

  useEffect(() => {
    couponAPI.getActive().then(data => {
      setActivePromos(data || []);
    }).catch(() => {});
  }, []);

  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    if (!couponCodeInput.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    setValidating(true);
    const result = await applyCoupon(couponCodeInput);
    setValidating(false);
    if (result.success) {
      toast.success(result.message);
      setCouponCodeInput('');
    } else {
      toast.error(result.message);
    }
  };

  const handleApplyPreset = async (code) => {
    setCouponCodeInput(code);
    setValidating(true);
    const result = await applyCoupon(code);
    setValidating(false);
    if (result.success) {
      toast.success(result.message);
      setCouponCodeInput('');
    } else {
      toast.error(result.message);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast.info('Coupon discount removed');
  };

  const totalItemCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', maxWidth: '1200px' }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '560px',
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '4rem 2rem',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#eef2ff',
            color: '#4f46e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <ShoppingCart size={38} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            Your Shopping Cart is Empty
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Explore today's blockbuster deals, top-rated audio, and flagship electronics.
          </p>
          <Link
            to="/shop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#0f172a',
              color: '#ffffff',
              padding: '0.85rem 2rem',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.95rem',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.18)',
            }}
          >
            <span>Continue Shopping</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '2rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '1440px', padding: '0 1.5rem' }}>
        
        {/* Amazon Shopping Cart 2-Column Grid */}
        <div className="cart-responsive-grid">
          
          {/* ================= LEFT COLUMN: SHOPPING CART ITEMS ================= */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)' }}>
            
            {/* Header with Title and Deselect all */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Shopping Cart
                </h1>
                <span style={{ fontSize: '0.85rem', color: '#4f46e5', fontWeight: 600, cursor: 'pointer' }} onClick={() => toast.info('All items selected for checkout')}>
                  Deselect all items
                </span>
              </div>
              <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600 }}>Price</span>
            </div>

            {/* List of Cart Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {cartItems.map((item) => {
                const prod = item.product || {};
                const itemTotal = (prod.price || 0) * (item.quantity || 1);

                return (
                  <div 
                    key={item.id} 
                    className="cart-item-row"
                  >
                    {/* Thumbnail Image */}
                    <Link to={`/product/${prod.id}`} className="cart-item-img-wrap">
                      <img 
                        src={prod.imageUrl || getProductFallback(prod)} 
                        alt={prod.name} 
                        style={{ width: '90%', height: '90%', objectFit: 'contain' }}
                        onError={(e) => handleImageError(e, prod)}
                      />
                    </Link>

                    {/* Information & Controls */}
                    <div>
                      <Link to={`/product/${prod.id}`} style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', textDecoration: 'none', lineHeight: 1.35, display: 'block', marginBottom: '0.35rem' }}>
                        {prod.name}
                      </Link>

                      <div style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 700, marginBottom: '0.25rem' }}>
                        In Stock
                      </div>

                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.45rem' }}>
                        Eligible for <strong style={{ color: '#0f172a' }}>FREE Express Shipping</strong>
                      </div>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#475569', marginBottom: '0.85rem', cursor: 'pointer' }}>
                        <input type="checkbox" style={{ accentColor: '#4f46e5' }} />
                        <span>This will be a gift</span>
                      </label>

                      {/* Quantity & Actions Bar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '2px' }}>
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                            style={{ background: 'none', border: 'none', padding: '0.25rem 0.55rem', cursor: 'pointer', color: '#0f172a', display: 'flex', alignItems: 'center' }}
                            title="Decrease Quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span style={{ fontSize: '0.86rem', fontWeight: 800, padding: '0 0.55rem', minWidth: '24px', textAlign: 'center' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                            style={{ background: 'none', border: 'none', padding: '0.25rem 0.55rem', cursor: 'pointer', color: '#0f172a', display: 'flex', alignItems: 'center' }}
                            title="Increase Quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <span style={{ color: '#cbd5e1' }}>|</span>

                        <button
                          onClick={() => removeItem(item.id)}
                          style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                        >
                          Delete
                        </button>

                        <span style={{ color: '#cbd5e1' }}>|</span>

                        <button
                          onClick={() => toast.info('Saved for later')}
                          style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                        >
                          Save for later
                        </button>
                      </div>
                    </div>

                    {/* Price Column */}
                    <div className="cart-item-price-col">
                      <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                        {formatINR(itemTotal)}
                      </span>
                      {item.quantity > 1 && (
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          ({formatINR(prod.price)} each)
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Subtotal Footer */}
            <div style={{ textAlign: 'right', marginTop: '1.5rem', fontSize: '1.15rem', color: '#0f172a' }}>
              Subtotal ({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}): <strong style={{ fontSize: '1.35rem', fontWeight: 900 }}>{formatINR(subtotal)}</strong>
            </div>

          </div>

          {/* ================= RIGHT COLUMN: AMAZON SUBTOTAL SIDEBAR ================= */}
          <div style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Main Checkout Card */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #cbd5e1', padding: '1.75rem', boxShadow: '0 4px 18px rgba(15, 23, 42, 0.05)' }}>
              
              {/* Free Delivery Qualified Banner */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontSize: '0.82rem', fontWeight: 700, marginBottom: '1rem' }}>
                <CheckCircle2 size={18} color="#059669" />
                <span>Your order qualifies for FREE Express Delivery.</span>
              </div>

              {/* Price Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: '#64748b' }}>
                  <span>Items Subtotal:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatINR(subtotal)}</span>
                </div>

                {appliedCoupon && discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: '#059669', fontWeight: 700 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Tag size={14} /> Coupon ({appliedCoupon.code}):
                    </span>
                    <span>-{formatINR(discountAmount)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #e2e8f0' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Total Amount:</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                      {formatINR(finalTotal)}
                    </div>
                    {discountAmount > 0 && (
                      <div style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 700 }}>
                        Total Savings: {formatINR(discountAmount)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Gift Checkbox */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: '#334155', marginBottom: '1.25rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={isGift} 
                  onChange={(e) => setIsGift(e.target.checked)} 
                  style={{ accentColor: '#4f46e5' }} 
                />
                <span>This order contains a gift</span>
              </label>

              {/* Big "Proceed to Buy" CTA Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="amz-btn-buynow"
                style={{ width: '100%', padding: '0.85rem 1.25rem', borderRadius: '9999px', fontSize: '0.96rem' }}
                id="proceed-to-checkout-btn"
              >
                Proceed to Buy ({formatINR(finalTotal)})
              </button>

              {/* Coupon / Voucher Section */}
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <TicketPercent size={16} color="#4f46e5" /> Apply Coupon / Promo:
                  </span>
                  {appliedCoupon && (
                    <button
                      onClick={handleRemoveCoupon}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                    >
                      Remove
                    </button>
                  )}
                </div>

                {appliedCoupon ? (
                  <div style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '10px',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, color: '#166534', fontSize: '0.92rem' }}>
                        <CheckCircle2 size={16} color="#16a34a" />
                        <span>{appliedCoupon.code}</span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#15803d', marginTop: '2px' }}>
                        {appliedCoupon.description || 'Promotional coupon applied!'}
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      title="Remove coupon"
                      style={{
                        background: '#ffffff',
                        border: '1px solid #bbf7d0',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#64748b'
                      }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <>
                    <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.85rem' }}>
                      <input
                        type="text"
                        placeholder="Enter coupon code..."
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        style={{
                          flex: 1,
                          padding: '0.55rem 0.75rem',
                          fontSize: '0.84rem',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          textTransform: 'uppercase',
                          fontFamily: 'monospace',
                          fontWeight: 700
                        }}
                      />
                      <button
                        type="submit"
                        disabled={validating}
                        style={{
                          background: '#0f172a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0 1rem',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          cursor: validating ? 'wait' : 'pointer',
                          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.15)',
                        }}
                      >
                        {validating ? 'Applying...' : 'Apply'}
                      </button>
                    </form>

                    {/* Available Offers Quick-Apply Chips */}
                    {activePromos.length > 0 && (
                      <div style={{ marginTop: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Available Offers for Your Cart:
                          </span>
                          <Link to="/customer/dashboard" style={{ fontSize: '0.72rem', color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>
                            View Vouchers →
                          </Link>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {activePromos.map((p) => {
                            const isEligible = !p.minOrderAmount || subtotal >= p.minOrderAmount;
                            const savingsAmount = p.discountType === 'PERCENTAGE'
                              ? Math.min(p.maxDiscountAmount || 999999, Math.round(subtotal * (p.discountValue / 100)))
                              : Math.min(subtotal, p.discountValue);
                            const amountNeeded = (p.minOrderAmount || 0) - subtotal;

                            return (
                              <div
                                key={p.id}
                                onClick={() => isEligible && handleApplyPreset(p.code)}
                                style={{
                                  padding: '0.6rem 0.75rem',
                                  borderRadius: '10px',
                                  background: isEligible ? '#f0fdf4' : '#f8fafc',
                                  border: isEligible ? '1px solid #bbf7d0' : '1px dashed #cbd5e1',
                                  cursor: isEligible ? 'pointer' : 'default',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                    <span style={{
                                      fontFamily: 'monospace',
                                      fontWeight: 800,
                                      fontSize: '0.82rem',
                                      color: isEligible ? '#15803d' : '#4f46e5',
                                      background: '#ffffff',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      border: isEligible ? '1px solid #bbf7d0' : '1px solid #e2e8f0'
                                    }}>
                                      {p.code}
                                    </span>
                                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0f172a' }}>
                                      {p.discountType === 'PERCENTAGE' ? `${p.discountValue}% OFF` : `₹${p.discountValue} OFF`}
                                    </span>
                                  </div>

                                  {isEligible ? (
                                    <span style={{
                                      fontSize: '0.72rem',
                                      fontWeight: 800,
                                      color: '#ffffff',
                                      background: '#16a34a',
                                      padding: '0.15rem 0.5rem',
                                      borderRadius: '9999px'
                                    }}>
                                      Apply (Save {formatINR(savingsAmount)})
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                                      Min {formatINR(p.minOrderAmount)}
                                    </span>
                                  )}
                                </div>

                                <div style={{ fontSize: '0.72rem', color: isEligible ? '#166534' : '#64748b' }}>
                                  {isEligible ? (
                                    <span>✓ Eligible right now on your subtotal!</span>
                                  ) : (
                                    <span>Add items worth <strong>{formatINR(amountNeeded)}</strong> more to unlock</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Security info */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.76rem', marginTop: '1.25rem' }}>
                <Lock size={13} color="#059669" />
                <span>256-Bit SSL Encrypted Checkout</span>
              </div>

            </div>

            {/* Quick Perks Strip */}
            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1rem', fontSize: '0.78rem', color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem', fontWeight: 700, color: '#0f172a' }}>
                <ShieldCheck size={15} color="#4f46e5" /> AURA Purchase Protection
              </div>
              <div>Shop with peace of mind. 7-day doorstep replacement and 2-year warranty included.</div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
