import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { 
  CheckCircle, Package, ArrowRight, Truck, Mail, Copy, 
  Clock, ShieldCheck, ChevronRight, ArrowLeft, Download, Check, FileText
} from 'lucide-react';
import { orderAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/currency';
import OrderTrackingTimeline from '../../components/OrderTrackingTimeline';
import { generateTaxInvoice } from '../../utils/invoiceGenerator';
import '../../styles/store.css';

const STAGES = [
  { key: 'PENDING', label: 'Order Reserved', desc: 'Verified by atelier' },
  { key: 'PROCESSING', label: 'Processing', desc: 'Quality audit' },
  { key: 'SHIPPED', label: 'In Transit', desc: 'Courier dispatched' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Handed to client' },
];

function getStageIndex(status) {
  const s = (status || 'PENDING').toUpperCase();
  if (s === 'DELIVERED' || s === 'COMPLETED') return 3;
  if (s === 'SHIPPED') return 2;
  if (s === 'PROCESSING') return 1;
  return 0; // PENDING or default
}

export default function OrderConfirmation() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const toast = useToast();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const isNewOrder = Boolean(location.state?.isNewOrder);

  useEffect(() => {
    if (!order && orderNumber) {
      orderAPI.byNumber(orderNumber)
        .then((data) => setOrder(data))
        .catch((err) => console.error('Failed to load order', err))
        .finally(() => setLoading(false));
    }
  }, [orderNumber, order]);

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    toast.success('Order reservation ID copied to clipboard');
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '8rem 2rem' }}>
        <div className="luxury-spinner" style={{ margin: '0 auto 1rem' }}></div>
        <p style={{ color: '#64748b', fontWeight: 600 }}>Loading reservation itinerary...</p>
      </div>
    );
  }

  const currentStageIdx = order ? getStageIndex(order.status) : 0;

  return (
    <div className="container" style={{ maxWidth: '860px', padding: '3rem 1.5rem 6rem' }}>
      
      {/* Navigation Breadcrumb */}
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: '#4f46e5', fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Return to Order History
        </Link>
      </div>

      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          backgroundColor: isNewOrder ? '#ecfdf5' : '#eef2ff', 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginBottom: '1.25rem', 
          border: isNewOrder ? '2px solid #a7f3d0' : '2px solid #c7d2fe',
          boxShadow: '0 8px 25px rgba(0,0,0,0.06)',
        }}>
          {isNewOrder ? (
            <CheckCircle size={44} color="#059669" />
          ) : (
            <Package size={44} color="#4f46e5" />
          )}
        </div>
        
        <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          {isNewOrder ? 'Acquisition Confirmed!' : 'Order Summary & Transit Tracker'}
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '540px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
          {isNewOrder 
            ? "Your reservation has been confirmed. Our atelier specialists are preparing your creation for insured white-glove dispatch."
            : 'Review your order status, itemized invoice, courier tracking, and destination details.'
          }
        </p>

        {/* Order Number Capsule */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.55rem 1.4rem',
          borderRadius: '9999px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Reservation ID:</span>
          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>#{orderNumber}</span>
          <button
            onClick={copyOrderNumber}
            style={{ background: 'transparent', border: 'none', color: '#4f46e5', cursor: 'pointer', padding: '2px', display: 'flex' }}
            title="Copy Order ID"
          >
            <Copy size={15} />
          </button>
        </div>

        {/* 1-Click Tax Invoice Button Header */}
        <div style={{ marginTop: '1.25rem' }}>
          <button
            type="button"
            onClick={() => generateTaxInvoice(order)}
            id="download-invoice-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#ffffff',
              color: '#059669',
              border: '1.5px solid #a7f3d0',
              padding: '0.6rem 1.4rem',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(5, 150, 105, 0.08)',
              transition: 'all 0.15s ease'
            }}
          >
            <FileText size={16} />
            <span>Download Official Tax Invoice (PDF)</span>
          </button>
        </div>
      </div>

      {/* Feature 2: Animated Order Tracking Timeline */}
      <div style={{ marginBottom: '2rem' }}>
        <OrderTrackingTimeline order={order} interactive={true} />
      </div>

      {/* Items & Invoice Breakdown */}
      <div className="order-card-panel" style={{
        background: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        marginBottom: '2rem',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
      }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1.5rem 0' }}>
          Reserved Items ({order?.items?.length || 0})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.75rem' }}>
          {order?.items?.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                  alt=""
                  style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'contain', background: '#ffffff', padding: '4px' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{item.productName}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>Quantity: {item.quantity}</div>
                </div>
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                {formatINR(item.subtotal || ((item.price || item.productPrice || 0) * item.quantity))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', fontSize: '0.9rem', color: '#64748b' }}>
          {order?.subtotalAmount && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Items Subtotal</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatINR(order.subtotalAmount)}</span>
            </div>
          )}
          {order?.discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 700 }}>
              <span>Coupon Discount ({order.couponCode || 'Promo'}):</span>
              <span>-{formatINR(order.discountAmount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Courier Dispatch</span>
            <span style={{ fontWeight: 700, color: '#059669' }}>Complimentary White Glove</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Payment Method</span>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>
              {order?.paymentMethod === 'RAZORPAY' ? 'Razorpay Secure' : (order?.paymentMethod || 'Razorpay Secure')}
            </span>
          </div>
          {order?.razorpayPaymentId && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Razorpay Payment ID</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#4f46e5', fontSize: '0.85rem' }}>
                {order.razorpayPaymentId}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Payment Status</span>
            <span style={{
              fontWeight: 800,
              fontSize: '0.82rem',
              padding: '2px 8px',
              borderRadius: '6px',
              background: order?.paymentStatus === 'PAID' ? '#ecfdf5' : '#fef3c7',
              color: order?.paymentStatus === 'PAID' ? '#047857' : '#b45309',
            }}>
              {order?.paymentStatus || 'PAID'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '0.85rem', borderTop: '1px solid #f1f5f9', fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
            <span>Total Amount Paid</span>
            <span>{formatINR(order?.totalAmount || 0)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => generateTaxInvoice(order)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '0.85rem 1.8rem',
            borderRadius: '9999px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
          }}
        >
          <FileText size={16} />
          <span>Download Tax Invoice (PDF)</span>
        </button>
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
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.15)',
          }}
        >
          <span>Continue Exploring Creations</span>
          <ArrowRight size={16} />
        </Link>
        <Link
          to="/orders"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #cbd5e1',
            padding: '0.85rem 1.8rem',
            borderRadius: '9999px',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          <span>View All Orders</span>
        </Link>
      </div>

    </div>
  );
}
