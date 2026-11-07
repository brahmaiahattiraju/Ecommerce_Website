import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, ShoppingBag, DollarSign, Clock, Truck, 
  MapPin, Mail, Phone, ArrowRight, ExternalLink, ShieldCheck, User, Sparkles, Award,
  TicketPercent, Copy, Check, Tag, Gift, Percent, ArrowUpRight, Zap, Heart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { orderAPI, couponAPI } from '../../services/api';
import { formatINR } from '../../utils/currency';
import '../../styles/store.css';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { wishlist, wishlistCount, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const [couponFilter, setCouponFilter] = useState('ALL'); // 'ALL' | 'READY' | 'REDEEMED'
  const [testCodeInput, setTestCodeInput] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testingCode, setTestingCode] = useState(false);

  useEffect(() => {
    orderAPI.myOrders()
      .then((data) => setOrders(data || []))
      .catch((err) => console.error('Failed to load customer orders', err))
      .finally(() => setLoading(false));

    couponAPI.getCustomerCoupons(user?.email)
      .then((data) => setCoupons(data || []))
      .catch(() => couponAPI.getActive().then((data) => setCoupons(data || [])))
      .catch((err) => console.error('Failed to load customer coupons', err))
      .finally(() => setCouponsLoading(false));
  }, [user]);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleTestCoupon = async (e) => {
    e.preventDefault();
    if (!testCodeInput.trim()) return;
    setTestingCode(true);
    setTestResult(null);
    try {
      const res = await couponAPI.validate(testCodeInput.trim(), 2999);
      setTestResult(res);
    } catch (err) {
      setTestResult({ valid: false, message: err.message || 'Invalid coupon code' });
    } finally {
      setTestingCode(false);
    }
  };

  const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const activeOrders = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  const readyCoupons = coupons.filter(c => !c.usedByCustomer);
  const redeemedCoupons = coupons.filter(c => c.usedByCustomer);

  const displayedCoupons = coupons.filter(c => {
    if (couponFilter === 'READY') return !c.usedByCustomer;
    if (couponFilter === 'REDEEMED') return c.usedByCustomer;
    return true;
  });

  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    const isDelivered = s === 'delivered' || s === 'completed';
    const isCancelled = s === 'cancelled';
    const isShipped = s === 'shipped';

    const color = isDelivered ? '#059669' : isCancelled ? '#e11d48' : isShipped ? '#0284c7' : '#4f46e5';
    const bg = isDelivered ? '#ecfdf5' : isCancelled ? '#fff1f2' : isShipped ? '#f0f9ff' : '#eef2ff';
    const border = isDelivered ? '#a7f3d0' : isCancelled ? '#fecdd3' : isShipped ? '#bae6fd' : '#c7d2fe';

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.25rem 0.65rem',
        borderRadius: '9999px',
        fontSize: '0.72rem',
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        background: bg,
        color: color,
        border: `1px solid ${border}`,
      }}>
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: color }}></span>
        {status}
      </span>
    );
  };

  const handleMoveWishlistToCart = async (item) => {
    try {
      await addToCart(item.id, 1, item);
      removeFromWishlist(item.id);
      toast?.success?.(`Moved ${item.name?.slice(0, 20)}... to your Cart!`);
    } catch {
      toast?.error?.('Could not move item to cart');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1100px', padding: '3rem 1.5rem 6rem' }}>
      
      {/* Profile Welcome Hero Banner */}
      <div style={{ 
        padding: '2.5rem', 
        marginBottom: '2.25rem', 
        background: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 8px 30px -4px rgba(15, 23, 42, 0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ 
            width: '72px', 
            height: '72px', 
            borderRadius: '20px', 
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#fff', 
            fontWeight: 900, 
            fontSize: '1.8rem',
            boxShadow: '0 8px 25px rgba(79, 70, 229, 0.25)'
          }}>
            {user?.fullName?.charAt(0) || 'M'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                Welcome back, {user?.fullName || 'Privilege Member'}!
              </h1>
              <span style={{ 
                fontSize: '0.72rem', 
                fontWeight: 800, 
                letterSpacing: '0.06em', 
                color: '#4f46e5', 
                padding: '0.25rem 0.75rem', 
                borderRadius: '9999px', 
                backgroundColor: '#eef2ff',
                border: '1px solid rgba(79, 70, 229, 0.25)'
              }}>
                AURA BLACK PRIVILEGE
              </span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
              Your complimentary white-glove courier and concierge status are fully active.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link
            to="/shop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: '#0f172a',
              color: '#ffffff',
              padding: '0.75rem 1.4rem',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.9rem',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.15)',
            }}
          >
            <ShoppingBag size={16} /> Explore Creations
          </Link>
          <Link
            to="/wishlist"
            id="account-hero-wishlist-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: '#fff1f2',
              color: '#e11d48',
              border: '1px solid #fecdd3',
              padding: '0.75rem 1.4rem',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.9rem',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(225, 29, 72, 0.08)',
            }}
          >
            <Heart size={16} fill="#e11d48" color="#e11d48" /> My Wishlist ({wishlistCount})
          </Link>
          <Link
            to="/orders"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              padding: '0.75rem 1.4rem',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.9rem',
              textDecoration: 'none',
            }}
          >
            <Package size={16} /> View All Orders
          </Link>
        </div>
      </div>

      {/* Customer Metrics Overview */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1.25rem',
        marginBottom: '2.5rem'
      }}>
        {/* Wishlist KPI Card */}
        <Link 
          to="/wishlist" 
          style={{ 
            background: '#ffffff', 
            padding: '1.5rem', 
            borderRadius: '18px', 
            border: '1px solid #fecdd3', 
            boxShadow: '0 2px 8px rgba(225, 29, 72, 0.05)',
            textDecoration: 'none',
            display: 'block',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e11d48', textTransform: 'uppercase' }}>Saved Wishlist</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fff1f2', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={18} fill="#e11d48" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>{wishlistCount}</div>
          <div style={{ fontSize: '0.76rem', color: '#e11d48', fontWeight: 700, marginTop: '0.25rem' }}>View saved pieces →</div>
        </Link>
        <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Reservations</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>{orders.length}</div>
          <div style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 600, marginTop: '0.25rem' }}>Lifetime acquisitions</div>
        </div>

        <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Active In Transit</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>{activeOrders.length}</div>
          <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.25rem' }}>Dispatched via courier</div>
        </div>

        <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Portfolio Valuation</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>{formatINR(totalSpent)}</div>
          <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.25rem' }}>Total value acquired</div>
        </div>

        {/* Customer Vouchers KPI */}
        <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Available Coupons</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fdf2f8', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TicketPercent size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>
            {readyCoupons.length} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>active</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#db2777', fontWeight: 700, marginTop: '0.25rem' }}>Ready to apply</div>
        </div>

        <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Private Concierge</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>24/7 Dedicated</div>
          <div style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 700, marginTop: '0.25rem' }}>Direct Line Active</div>
        </div>
      </div>

      {/* ================= AVAILABLE CUSTOMER COUPONS & VOUCHERS ================= */}
      <div style={{ 
        background: '#ffffff', 
        borderRadius: '24px', 
        border: '1px solid #e2e8f0', 
        padding: '2.25rem', 
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
        marginBottom: '2.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <TicketPercent size={22} color="#4f46e5" />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                My Available Coupons & Privilege Vouchers
              </h2>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
              Exclusive discount codes personalized for your account. Copy code and apply during checkout or in cart.
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '9999px', gap: '2px' }}>
            <button
              onClick={() => setCouponFilter('ALL')}
              style={{
                border: 'none',
                background: couponFilter === 'ALL' ? '#ffffff' : 'transparent',
                color: couponFilter === 'ALL' ? '#0f172a' : '#64748b',
                fontWeight: 700,
                fontSize: '0.8rem',
                padding: '0.4rem 0.9rem',
                borderRadius: '9999px',
                cursor: 'pointer',
                boxShadow: couponFilter === 'ALL' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              All Offers ({coupons.length})
            </button>
            <button
              onClick={() => setCouponFilter('READY')}
              style={{
                border: 'none',
                background: couponFilter === 'READY' ? '#ffffff' : 'transparent',
                color: couponFilter === 'READY' ? '#4f46e5' : '#64748b',
                fontWeight: 700,
                fontSize: '0.8rem',
                padding: '0.4rem 0.9rem',
                borderRadius: '9999px',
                cursor: 'pointer',
                boxShadow: couponFilter === 'READY' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Ready to Use ({readyCoupons.length})
            </button>
            <button
              onClick={() => setCouponFilter('REDEEMED')}
              style={{
                border: 'none',
                background: couponFilter === 'REDEEMED' ? '#ffffff' : 'transparent',
                color: couponFilter === 'REDEEMED' ? '#059669' : '#64748b',
                fontWeight: 700,
                fontSize: '0.8rem',
                padding: '0.4rem 0.9rem',
                borderRadius: '9999px',
                cursor: 'pointer',
                boxShadow: couponFilter === 'REDEEMED' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Redeemed ({redeemedCoupons.length})
            </button>
          </div>
        </div>

        {/* Coupons Grid */}
        {couponsLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
            <div className="luxury-spinner" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ fontSize: '0.9rem' }}>Loading your tailored vouchers...</p>
          </div>
        ) : displayedCoupons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
            <TicketPercent size={36} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
              No coupons found in this category right now.
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '1.25rem' 
          }}>
            {displayedCoupons.map((coupon) => {
              const isUsed = coupon.usedByCustomer;
              const isWelcome = coupon.isFirstOrderSpecial;
              const isCopied = copiedCode === coupon.code;

              return (
                <div 
                  key={coupon.id}
                  style={{
                    borderRadius: '16px',
                    border: isUsed ? '1px solid #e2e8f0' : '1px solid #c7d2fe',
                    background: isUsed ? '#f8fafc' : 'linear-gradient(180deg, #ffffff 0%, #f8faff 100%)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isUsed ? 'none' : '0 4px 16px -2px rgba(79, 70, 229, 0.08)',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Top Discount Banner */}
                  <div style={{
                    padding: '1rem 1.25rem',
                    background: isUsed 
                      ? '#f1f5f9' 
                      : isWelcome 
                      ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' 
                      : 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Tag size={16} />
                      <span style={{ fontSize: '1.15rem', fontWeight: 900, letterSpacing: '-0.01em' }}>
                        {coupon.discountType === 'PERCENTAGE' 
                          ? `${coupon.discountValue}% OFF` 
                          : `FLAT ₹${coupon.discountValue} OFF`}
                      </span>
                    </div>

                    {/* Customer Status Badge */}
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '9999px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      background: isUsed ? '#e2e8f0' : 'rgba(255, 255, 255, 0.22)',
                      color: isUsed ? '#64748b' : '#ffffff',
                      border: isUsed ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.3)',
                    }}>
                      {isUsed ? 'Redeemed' : isWelcome ? '✨ Welcome Perk' : 'Active'}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      {/* Code and Copy Button */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                        <div style={{
                          flex: 1,
                          background: '#ffffff',
                          border: '1.5px dashed #4f46e5',
                          borderRadius: '8px',
                          padding: '0.45rem 0.75rem',
                          fontFamily: 'monospace',
                          fontWeight: 900,
                          fontSize: '1rem',
                          color: '#4f46e5',
                          letterSpacing: '0.08em',
                          textAlign: 'center',
                          boxShadow: '0 2px 4px rgba(79, 70, 229, 0.05)'
                        }}>
                          {coupon.code}
                        </div>
                        <button
                          onClick={() => handleCopy(coupon.code)}
                          title="Copy promo code"
                          style={{
                            background: isCopied ? '#ecfdf5' : '#0f172a',
                            color: isCopied ? '#059669' : '#ffffff',
                            border: isCopied ? '1px solid #a7f3d0' : 'none',
                            borderRadius: '8px',
                            padding: '0.5rem 0.85rem',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isCopied ? (
                            <>
                              <Check size={14} /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={14} /> Copy
                            </>
                          )}
                        </button>
                      </div>

                      {/* Description */}
                      <p style={{ fontSize: '0.86rem', color: '#1e293b', fontWeight: 600, margin: '0 0 0.65rem 0', lineHeight: 1.35 }}>
                        {coupon.description || 'Valid across luxury catalog items'}
                      </p>

                      {/* Terms Bullet Points */}
                      <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1rem' }}>
                        <div>• Minimum Order: <strong>{formatINR(coupon.minOrderAmount || 0)}</strong></div>
                        {coupon.maxDiscountAmount && (
                          <div>• Maximum Savings Cap: <strong>{formatINR(coupon.maxDiscountAmount)}</strong></div>
                        )}
                        <div>• Validity: {coupon.endDate ? `Valid till ${new Date(coupon.endDate).toLocaleDateString()}` : 'No Expiry Date'}</div>
                        {coupon.customerStatus && (
                          <div style={{ color: isUsed ? '#64748b' : '#4f46e5', fontWeight: 700, marginTop: '2px' }}>
                            • {coupon.customerStatus}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom CTA Button */}
                    <Link
                      to="/shop"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        background: isUsed ? '#f1f5f9' : '#eef2ff',
                        color: isUsed ? '#475569' : '#4f46e5',
                        border: isUsed ? '1px solid #cbd5e1' : '1px solid rgba(79, 70, 229, 0.25)',
                        padding: '0.55rem 1rem',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>Shop with this Coupon</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Voucher Tester Tool */}
        <div style={{ 
          marginTop: '1.75rem', 
          padding: '1.25rem', 
          background: '#f8fafc', 
          borderRadius: '14px', 
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
            <Zap size={16} color="#d97706" /> Have a private promotion or gift card code? Check savings:
          </div>

          <form onSubmit={handleTestCoupon} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="e.g. AURA20, WELCOME10..."
              value={testCodeInput}
              onChange={(e) => setTestCodeInput(e.target.value.toUpperCase())}
              style={{
                flex: 1,
                minWidth: '220px',
                padding: '0.55rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
                fontWeight: 700
              }}
            />
            <button
              type="submit"
              disabled={testingCode}
              style={{
                background: '#0f172a',
                color: '#ffffff',
                border: 'none',
                padding: '0.55rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: testingCode ? 'wait' : 'pointer'
              }}
            >
              {testingCode ? 'Checking...' : 'Check Code'}
            </button>
          </form>

          {testResult && (
            <div style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: testResult.valid ? '#ecfdf5' : '#fff1f2',
              color: testResult.valid ? '#065f46' : '#9f1239',
              border: `1px solid ${testResult.valid ? '#a7f3d0' : '#fecdd3'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}>
              {testResult.valid ? <Check size={15} /> : <Tag size={15} />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

      </div>

      {/* ================= SAVED WISHLIST PIECES SHOWCASE ================= */}
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        padding: '2.25rem',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
        marginBottom: '2.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Heart size={22} color="#e11d48" fill="#e11d48" />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                My Saved Wishlist & Favorites
              </h2>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
              Curated items you've bookmarked for future acquisitions.
            </p>
          </div>

          <Link
            to="/wishlist"
            id="account-view-all-wishlist-link"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#e11d48',
              fontWeight: 700,
              fontSize: '0.86rem',
              textDecoration: 'none'
            }}
          >
            <span>Open Dedicated Wishlist Page ({wishlistCount})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: '#fff1f2', borderRadius: '16px', border: '1px dashed #fecdd3' }}>
            <Heart size={32} color="#f43f5e" style={{ marginBottom: '0.5rem' }} />
            <h4 style={{ margin: '0 0 0.35rem 0', color: '#0f172a', fontWeight: 800 }}>Your Wishlist is Empty</h4>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
              Tap the heart icon on any product in the store to save it here.
            </p>
            <Link
              to="/shop"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#0f172a',
                color: '#ffffff',
                padding: '0.5rem 1.25rem',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '0.84rem',
                textDecoration: 'none'
              }}
            >
              Browse Catalog <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.25rem'
          }}>
            {wishlist.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ height: '170px', background: '#ffffff', position: 'relative', overflow: 'hidden' }}>
                  <Link to={`/products/${item.id}`}>
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(item.id)}
                    title="Remove from wishlist"
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#e11d48',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0', lineHeight: 1.3 }}>
                      {item.name}
                    </h4>
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.85rem' }}>
                      {formatINR(item.price)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleMoveWishlistToCart(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      background: '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.55rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    <ShoppingBag size={14} /> Move to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2-Column Section: Recent Orders & Member Profile */}
      <div className="dashboard-responsive-grid">
        
        {/* Recent Orders List */}
        <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Recent Acquisitions
            </h3>
            <Link to="/orders" style={{ color: '#4f46e5', fontSize: '0.84rem', fontWeight: 700, textDecoration: 'none' }}>
              View All ({orders.length}) →
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
              <div className="luxury-spinner" style={{ margin: '0 auto 0.75rem' }} />
              <p>Loading recent orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Package size={40} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>No orders placed yet.</p>
              <Link to="/shop" className="btn-keynote-primary" style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem' }}>
                Start Exploring
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.slice(0, 4).map(o => (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>#{o.orderNumber}</span>
                      {getStatusBadge(o.status)}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {o.items?.length || 0} {(o.items?.length || 0) === 1 ? 'item' : 'items'} • {new Date(o.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: 900, fontSize: '1.05rem', color: '#0f172a' }}>
                      {formatINR(o.totalAmount)}
                    </span>
                    <Link
                      to={`/order-confirmation/${o.orderNumber}`}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ffffff', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a' }}
                      title="View Details"
                    >
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Member Shipping Dossier */}
        <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1.25rem 0' }}>
            Shipping Dossier
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem' }}>
            <div style={{ padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Recipient</div>
              <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{user?.fullName || 'Client'}</div>
            </div>

            <div style={{ padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Email Address</div>
              <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{user?.email || 'N/A'}</div>
            </div>

            <div style={{ padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Phone Contact</div>
              <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{user?.phone || '+91 98765 43210'}</div>
            </div>

            <div style={{ padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Primary Residence</div>
              <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                {user?.address ? `${user.address}, ${user.city || ''} ${user.zipCode || ''}` : 'Flat 402, Lotus Residency, MG Road, Bengaluru 560001'}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
