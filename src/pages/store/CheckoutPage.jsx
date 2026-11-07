import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CreditCard, Truck, ShieldCheck, CheckCircle2, Lock, ArrowLeft, 
  UserCheck, Sparkles, Smartphone, Banknote, Building2, TicketPercent, Tag, X, Copy 
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { orderAPI, couponAPI, paymentAPI } from '../../services/api';
import { formatINR } from '../../utils/currency';
import '../../styles/store.css';

export default function CheckoutPage() {
  const { 
    cartItems, subtotal, clearCart, 
    appliedCoupon, discountAmount, applyCoupon, removeCoupon 
  } = useCart();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [checkoutCouponInput, setCheckoutCouponInput] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  useEffect(() => {
    couponAPI.getActive()
      .then((data) => setAvailableCoupons(data || []))
      .catch((err) => console.error('Failed to load coupons', err));
  }, []);

  const [formData, setFormData] = useState({
    customerName: user?.fullName || 'Alex Johnson',
    customerEmail: user?.email || 'user@ecommerce.com',
    customerPhone: user?.phone || '+91 98765 43210',
    shippingAddress: user?.address || 'Flat 402, Lotus Residency, MG Road',
    shippingCity: user?.city || 'Bengaluru',
    shippingZip: user?.zipCode || '560001',
    paymentMethod: 'RAZORPAY',
  });

  const [deliverySpeed, setDeliverySpeed] = useState('express');
  const [submitting, setSubmitting] = useState(false);

  const deliveryCharge = deliverySpeed === 'priority' ? 499 : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount) + deliveryCharge;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(true));
        existing.addEventListener('error', () => resolve(false));
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error('Your shopping bag is empty');
      navigate('/shop');
      return;
    }

    if (!isAuthenticated) {
      toast.info('Please sign in or use customer account to place your order');
      navigate('/login?redirect=/checkout');
      return;
    }

    setSubmitting(true);

    // If Cash on Delivery, place order directly
    if (formData.paymentMethod === 'COD') {
      try {
        const orderPayload = {
          ...formData,
          paymentMethod: 'COD',
          couponCode: appliedCoupon?.valid ? appliedCoupon.code : null,
        };
        const order = await orderAPI.place(orderPayload);
        clearCart();
        toast.success('🎉 Order placed successfully with Cash on Delivery!');
        navigate(`/order-confirmation/${order.orderNumber}`, { state: { order, isNewOrder: true } });
      } catch (err) {
        toast.error(err.message || 'Failed to place order');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Razorpay Payment Gateway Flow
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please verify your network connection.');
      }

      // Step 1: Create Razorpay Order on Backend
      const rzpOrder = await paymentAPI.createOrder(
        finalTotal,
        `rcpt_${Date.now()}`,
        'INR'
      );

      const razorpayOrderId = rzpOrder?.razorpayOrderId || rzpOrder?.orderId;
      if (!rzpOrder || !razorpayOrderId) {
        throw new Error('Unable to create Razorpay payment order. Please try again.');
      }

      // Step 2: Open Razorpay Checkout modal
      const options = {
        key: rzpOrder.keyId || 'rzp_test_TkZgFnCTwMLyUy',
        amount: rzpOrder.amount, // in paise
        currency: rzpOrder.currency || 'INR',
        name: 'AURA Luxury Store',
        description: `Order Checkout - ${cartItems.length} item(s)`,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&auto=format&fit=crop&q=80',
        order_id: razorpayOrderId,
        prefill: {
          name: formData.customerName,
          email: formData.customerEmail,
          contact: formData.customerPhone,
        },
        notes: {
          shippingAddress: formData.shippingAddress,
          city: formData.shippingCity,
          pincode: formData.shippingZip,
        },
        theme: {
          color: '#4f46e5',
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
            toast.info('Razorpay payment cancelled');
          },
        },
        handler: async function (response) {
          try {
            toast.info('Verifying secure payment signature...');
            
            // Step 3: Verify Razorpay signature on Backend
            const verifyRes = await paymentAPI.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (!verifyRes.verified) {
              throw new Error(verifyRes.message || 'Payment signature verification failed.');
            }

            // Step 4: Finalize and place verified Order
            const orderPayload = {
              ...formData,
              paymentMethod: 'RAZORPAY',
              couponCode: appliedCoupon?.valid ? appliedCoupon.code : null,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            };

            const order = await orderAPI.place(orderPayload);
            clearCart();
            toast.success('🎉 Payment successful! Order placed.');
            navigate(`/order-confirmation/${order.orderNumber}`, { state: { order, isNewOrder: true } });
          } catch (err) {
            console.error('Payment confirmation error:', err);
            toast.error(err.message || 'Payment verification or order placement failed');
          } finally {
            setSubmitting(false);
          }
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (resp) {
        console.error('Razorpay payment failed:', resp);
        toast.error(`Payment failed: ${resp.error?.description || 'Transaction declined'}`);
        setSubmitting(false);
      });

      razorpayInstance.open();
    } catch (err) {
      console.error('Razorpay initialization error:', err);
      const errMsg = err.message || '';
      if (errMsg.toLowerCase().includes('maximum amount') || errMsg.toLowerCase().includes('amount exceeds')) {
        toast.error('Order total exceeds Razorpay single-transaction limit of ₹5,00,000. Please reduce cart items or choose Cash on Delivery.');
      } else if (errMsg.toLowerCase().includes('failed to load') || errMsg.toLowerCase().includes('sdk failed')) {
        toast.error('Payment gateway script blocked by client/browser extension. Please disable ad-blocker or Brave Shields and try again.');
      } else {
        toast.error(err.message || 'Could not initiate Razorpay payment');
      }
      setSubmitting(false);
    }
  };

  const handleApplyCheckoutCoupon = async (e) => {
    e.preventDefault();
    if (!checkoutCouponInput.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    setValidatingCoupon(true);
    const res = await applyCoupon(checkoutCouponInput);
    setValidatingCoupon(false);
    if (res.success) {
      toast.success(res.message);
      setCheckoutCouponInput('');
    } else {
      toast.error(res.message);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '6rem 0' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px', margin: '0 auto', background: '#ffffff', padding: '3.5rem 2rem', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
          <h2>Your bag is empty</h2>
          <p style={{ color: '#64748b', marginBottom: '1.75rem' }}>Add some products before proceeding to checkout.</p>
          <Link to="/shop" className="btn-keynote-primary">Explore Catalog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0 6rem' }}>
      {/* Back Link */}
      <Link to="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: '#4f46e5', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600, marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Return to Shopping Bag
      </Link>

      <div className="checkout-responsive-grid">
        
        {/* Left Column: Checkout Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* 1. Contact & Destination */}
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800 }}>
                1
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Recipient & Delivery Destination
              </h3>
            </div>

            <div className="form-responsive-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Alex Johnson"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  required
                  placeholder="user@example.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  required
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="shippingCity"
                  value={formData.shippingCity}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Mumbai, Bengaluru"
                />
              </div>

              <div className="form-group form-col-full">
                <label className="form-label">Street Address / Suite</label>
                <input
                  type="text"
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  required
                  placeholder="Flat / Building, Landmark, Area"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Postal Pincode</label>
                <input
                  type="text"
                  name="shippingZip"
                  value={formData.shippingZip}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 560001"
                />
              </div>
            </div>
          </div>

          {/* 2. Delivery Speed */}
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800 }}>
                2
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Courier Tier
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.25rem',
                  borderRadius: '14px',
                  border: deliverySpeed === 'express' ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                  background: deliverySpeed === 'express' ? '#eef2ff' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <input
                  type="radio"
                  name="deliverySpeed"
                  checked={deliverySpeed === 'express'}
                  onChange={() => setDeliverySpeed('express')}
                  style={{ accentColor: '#4f46e5' }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>White Glove Express</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>24-48 Hours Insured Courier</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#059669', marginTop: '4px' }}>Complimentary</div>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.25rem',
                  borderRadius: '14px',
                  border: deliverySpeed === 'priority' ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                  background: deliverySpeed === 'priority' ? '#eef2ff' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <input
                  type="radio"
                  name="deliverySpeed"
                  checked={deliverySpeed === 'priority'}
                  onChange={() => setDeliverySpeed('priority')}
                  style={{ accentColor: '#4f46e5' }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>VIP Next-Flight Priority</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>Guaranteed Next-Morning Transit</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4f46e5', marginTop: '4px' }}>+₹499.00</div>
                </div>
              </label>
            </div>
          </div>

          {/* 3. Payment Method */}
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800 }}>
                  3
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Payment Method
                </h3>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#047857', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 700, border: '1px solid #a7f3d0' }}>
                <ShieldCheck size={14} /> Razorpay Encrypted 256-bit SSL
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              {/* Razorpay Option */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: formData.paymentMethod === 'RAZORPAY' ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                  background: formData.paymentMethod === 'RAZORPAY' ? '#f5f7ff' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="RAZORPAY"
                  checked={formData.paymentMethod === 'RAZORPAY'}
                  onChange={handleChange}
                  style={{ accentColor: '#4f46e5', marginTop: '4px' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontWeight: 800, fontSize: '1.02rem', color: '#0f172a' }}>
                      <CreditCard size={18} color="#4f46e5" />
                      <span>Razorpay Secure Gateway</span>
                    </div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#4f46e5', color: '#ffffff', padding: '3px 10px', borderRadius: '9999px', letterSpacing: '0.02em' }}>
                      RECOMMENDED
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '6px', lineHeight: 1.5 }}>
                    Instant checkout supporting UPI (Google Pay, PhonePe, Paytm, BHIM), Credit & Debit Cards (Visa, Mastercard, RuPay, Amex), Net Banking (50+ banks), and Digital Wallets.
                  </div>
                  
                  {/* Supported badges */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
                    {['UPI / QR', 'Cards (Visa / Master)', 'Net Banking', 'Wallets'].map((tag) => (
                      <span key={tag} style={{ background: '#e0e7ff', color: '#3730a3', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {formData.paymentMethod === 'RAZORPAY' && (
                    <div style={{ marginTop: '0.85rem', padding: '0.65rem 0.85rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#475569' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Lock size={12} color="#059669" /> Razorpay Test Key: <code style={{ color: '#4f46e5', fontWeight: 700 }}>rzp_test_TkZgFnCTwMLyUy</code>
                      </span>
                      <span style={{ color: '#059669', fontWeight: 700 }}>Active</span>
                    </div>
                  )}

                  {formData.paymentMethod === 'RAZORPAY' && finalTotal > 500000 && (
                    <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.85rem', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '0.76rem', color: '#92400e', lineHeight: 1.4 }}>
                      ⚠️ <strong>High Value Luxury Order ({formatINR(finalTotal)}):</strong> Standard Razorpay single-transaction limit is ₹5,00,000. In test mode, this authorization is automatically capped at ₹5,00,000 so you can test seamlessly, while your full order value is preserved.
                    </div>
                  )}
                </div>
              </label>

              {/* Cash on Delivery Option */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.25rem 1.5rem',
                  borderRadius: '16px',
                  border: formData.paymentMethod === 'COD' ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                  background: formData.paymentMethod === 'COD' ? '#f5f7ff' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={formData.paymentMethod === 'COD'}
                  onChange={handleChange}
                  style={{ accentColor: '#4f46e5', marginTop: '4px' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontWeight: 800, fontSize: '0.98rem', color: '#0f172a' }}>
                    <Banknote size={18} color="#475569" />
                    <span>Cash on Delivery (COD)</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                    Pay in cash or scan UPI QR upon physical receipt of order at your doorstep.
                  </div>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.65rem',
              background: formData.paymentMethod === 'RAZORPAY' ? 'linear-gradient(135deg, #4338ca 0%, #4f46e5 100%)' : '#0f172a',
              color: '#ffffff',
              padding: '1.15rem',
              borderRadius: '9999px',
              fontWeight: 800,
              fontSize: '1.05rem',
              border: 'none',
              cursor: submitting ? 'wait' : 'pointer',
              boxShadow: '0 6px 24px rgba(79, 70, 229, 0.35)',
              transition: 'all 0.2s ease',
            }}
          >
            <Lock size={18} />
            <span>
              {submitting
                ? 'Processing Transaction...'
                : formData.paymentMethod === 'RAZORPAY'
                  ? `Proceed to Pay with Razorpay (${formatINR(finalTotal)})`
                  : `Place Cash on Delivery Order (${formatINR(finalTotal)})`}
            </span>
          </button>
        </form>

        {/* Right Column: Order Overview Sidebar */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '2rem',
          boxShadow: '0 8px 30px -4px rgba(15, 23, 42, 0.05)',
          position: 'sticky',
          top: '90px',
        }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1.25rem 0' }}>
            Acquisition Summary ({cartItems.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '320px', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1.5rem' }}>
            {cartItems.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                <img
                  src={item.product?.imageUrl || item.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                  alt=""
                  style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'contain', background: '#f8fafc', padding: '4px' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.product?.name || item.productName}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Qty: {item.quantity}</div>
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                  {formatINR((item.price || item.product?.price || 0) * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Coupon Input or Applied Pill in Checkout */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <TicketPercent size={15} color="#4f46e5" /> Promotional Coupon
              </span>
              {appliedCoupon && (
                <button
                  type="button"
                  onClick={removeCoupon}
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  Remove
                </button>
              )}
            </div>

            {appliedCoupon ? (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#166534', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={14} color="#16a34a" /> {appliedCoupon.code}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#15803d' }}>
                    Savings: -{formatINR(discountAmount)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  title="Remove coupon"
                  style={{ background: '#fff', border: '1px solid #bbf7d0', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <input
                    type="text"
                    placeholder="Code (e.g. WELCOME10)"
                    value={checkoutCouponInput}
                    onChange={(e) => setCheckoutCouponInput(e.target.value.toUpperCase())}
                    style={{
                      flex: 1,
                      padding: '0.45rem 0.65rem',
                      fontSize: '0.8rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      textTransform: 'uppercase',
                      fontFamily: 'monospace',
                      fontWeight: 700
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCheckoutCoupon}
                    disabled={validatingCoupon}
                    style={{
                      background: '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0 0.85rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: validatingCoupon ? 'wait' : 'pointer',
                    }}
                  >
                    {validatingCoupon ? '...' : 'Apply'}
                  </button>
                </div>

                {/* Available Offers Quick Picker */}
                {availableCoupons.length > 0 && (
                  <div style={{ marginTop: '0.65rem' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Tap to Apply Available Coupon:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {availableCoupons.slice(0, 4).map((c) => {
                        const isEligible = !c.minOrderAmount || subtotal >= c.minOrderAmount;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              if (isEligible) {
                                applyCoupon(c.code);
                                toast.success(`Applied coupon ${c.code}!`);
                              } else {
                                toast.info(`Order min amount of ${formatINR(c.minOrderAmount)} required for ${c.code}`);
                              }
                            }}
                            style={{
                              background: isEligible ? '#eef2ff' : '#f8fafc',
                              border: isEligible ? '1px solid #c7d2fe' : '1px dashed #cbd5e1',
                              color: isEligible ? '#4f46e5' : '#64748b',
                              borderRadius: '6px',
                              padding: '0.25rem 0.55rem',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <span style={{ fontFamily: 'monospace' }}>{c.code}</span>
                            <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>
                              ({c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `₹${c.discountValue}`})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatINR(subtotal)}</span>
            </div>

            {appliedCoupon && discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 700 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Tag size={13} /> Coupon Discount ({appliedCoupon.code})
                </span>
                <span>-{formatINR(discountAmount)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Courier Delivery</span>
              <span style={{ fontWeight: 700, color: deliveryCharge === 0 ? '#059669' : '#0f172a' }}>
                {deliveryCharge === 0 ? 'Complimentary' : formatINR(deliveryCharge)}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '0.85rem', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Total Amount</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>
                {formatINR(finalTotal)}
              </div>
              {discountAmount > 0 && (
                <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700 }}>
                  You saved {formatINR(discountAmount)} with coupon!
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '1.75rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ShieldCheck size={20} color="#059669" />
            <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>
              <strong>Aura Authenticity Guarantee</strong><br />
              All acquisitions include direct factory warranty and verified provenance.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
