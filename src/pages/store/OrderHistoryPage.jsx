import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, ArrowRight, ExternalLink,
  CreditCard, Smartphone, Banknote,
  Clock, MapPin, ChevronDown, ChevronUp,
  Truck, ShieldCheck, RotateCcw, Search, Sparkles, FileText
} from 'lucide-react';
import { orderAPI } from '../../services/api';
import { formatINR } from '../../utils/currency';
import { generateTaxInvoice } from '../../utils/invoiceGenerator';
import '../../styles/store.css';

/* ── Payment method config ───────────────────────────── */
const PAYMENT_CONFIG = {
  CARD: {
    label: 'Card',
    fullLabel: 'Credit / Debit Card',
    icon: CreditCard,
    color: '#4f46e5',
    bg: '#eef2ff',
    border: 'rgba(79,70,229,0.2)',
  },
  UPI: {
    label: 'UPI',
    fullLabel: 'UPI / NetBanking',
    icon: Smartphone,
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: 'rgba(124,58,237,0.2)',
  },
  COD: {
    label: 'COD',
    fullLabel: 'Cash on Delivery',
    icon: Banknote,
    color: '#059669',
    bg: '#ecfdf5',
    border: 'rgba(5,150,105,0.2)',
  },
};

function PaymentBadge({ method, compact = false }) {
  const cfg = PAYMENT_CONFIG[method] || PAYMENT_CONFIG.CARD;
  const Icon = cfg.icon;
  return (
    <span
      title={cfg.fullLabel}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
        padding: compact ? '0.25rem 0.6rem' : '0.3rem 0.75rem',
        borderRadius: '9999px',
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        color: cfg.color, fontWeight: 700,
        fontSize: compact ? '0.72rem' : '0.78rem',
        letterSpacing: '0.01em', whiteSpace: 'nowrap',
      }}
    >
      <Icon size={compact ? 12 : 13} strokeWidth={2.3} />
      {compact ? cfg.label : cfg.fullLabel}
    </span>
  );
}

/* ── Status badge ────────────────────────────────────── */
function StatusBadge({ status }) {
  const s = status?.toLowerCase() || 'pending';
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
      padding: '0.28rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      background: bg,
      color: color,
      border: `1px solid ${border}`,
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }}></span>
      {status}
    </span>
  );
}

/* ── Single order card ───────────────────────────────── */
function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);

  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'N/A';

  const estimatedDelivery = (() => {
    if (!order.createdAt) return 'Within 3 business days';
    const d = new Date(order.createdAt);
    d.setDate(d.getDate() + 3);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  })();

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '18px',
      overflow: 'hidden',
      transition: 'all 0.25s ease',
      boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
    }}>
      {/* ── Card header ─────────────────────────────────── */}
      <div style={{
        padding: '1.25rem 1.75rem',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
      }}>
        {/* Left: order number + date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', fontWeight: 700, marginBottom: '0.15rem' }}>Order Number</div>
            <div style={{ fontWeight: 800, color: '#0f172a', letterSpacing: '0.02em', fontSize: '0.98rem' }}>
              #{order.orderNumber}
            </div>
          </div>
          <div style={{ width: '1px', height: '30px', background: '#e2e8f0' }} />
          <div>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', fontWeight: 700, marginBottom: '0.15rem' }}>Date Placed</div>
            <div style={{ fontSize: '0.88rem', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={13} color="#64748b" /> {date}
            </div>
          </div>
          <div style={{ width: '1px', height: '30px', background: '#e2e8f0' }} />
          <div>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', fontWeight: 700, marginBottom: '0.15rem' }}>Courier Status</div>
            <div style={{ fontSize: '0.88rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Truck size={13} /> Est. Delivery by {estimatedDelivery}
            </div>
          </div>
        </div>

        {/* Right: badges + amount */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <StatusBadge status={order.status} />
          <PaymentBadge method={order.paymentMethod} compact />
          <div style={{ fontWeight: 900, fontSize: '1.15rem', color: '#0f172a', marginLeft: '0.25rem' }}>
            {formatINR(order.totalAmount)}
          </div>
        </div>
      </div>

      {/* ── Collapsed preview (first item) ───────────────── */}
      <div style={{ padding: '1.25rem 1.75rem' }}>
        {!expanded && order.items?.[0] && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '10px', overflow: 'hidden',
                background: '#f8fafc', border: '1px solid #e2e8f0', flexShrink: 0, padding: '4px',
              }}>
                <img
                  src={order.items[0].imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                  alt={order.items[0].productName}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>{order.items[0].productName}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                  Qty: {order.items[0].quantity}
                  {order.items.length > 1 && ` + ${order.items.length - 1} more curated creation${order.items.length - 1 > 1 ? 's' : ''}`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Expanded items list ───────────────────────── */}
        {expanded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {order.items?.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.85rem 1rem', borderRadius: '12px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '10px', overflow: 'hidden',
                    background: '#ffffff', border: '1px solid #e2e8f0', flexShrink: 0, padding: '4px',
                  }}>
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                      alt={item.productName}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{item.productName}</div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                      Qty: {item.quantity} × {formatINR(item.price || item.productPrice || (item.subtotal ? item.subtotal / item.quantity : 0))}
                    </div>
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                  {formatINR(item.subtotal || ((item.price || item.productPrice) * item.quantity))}
                </div>
              </div>
            ))}

            {/* Expanded: payment + address row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem',
            }}>
              <div style={{
                padding: '1rem', borderRadius: '12px',
                background: '#ffffff', border: '1px solid #e2e8f0',
              }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldCheck size={13} color="#4f46e5" /> Payment Method
                </div>
                <PaymentBadge method={order.paymentMethod} />
              </div>
              <div style={{
                padding: '1rem', borderRadius: '12px',
                background: '#ffffff', border: '1px solid #e2e8f0',
              }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={13} color="#4f46e5" /> Delivery Destination
                </div>
                <div style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 500, lineHeight: 1.5 }}>
                  {order.shippingCity ? `${order.shippingCity}${order.shippingZip ? ', ' + order.shippingZip : ''}` : order.shippingAddress || '—'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Card footer: actions ──────────────────────── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9',
        }}>
          <button
            onClick={() => setExpanded(v => !v)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              fontSize: '0.84rem', color: '#4f46e5', fontWeight: 700,
              cursor: 'pointer', background: 'none', border: 'none', padding: 0,
            }}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {expanded ? 'Hide Breakdown' : `View All ${order.items?.length || 0} Items`}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={() => generateTaxInvoice(order)}
              style={{
                fontSize: '0.82rem',
                padding: '0.45rem 1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: '#ffffff',
                color: '#059669',
                border: '1px solid #a7f3d0',
                borderRadius: '9999px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Download Official Tax Invoice PDF"
            >
              <FileText size={14} />
              <span>Tax Invoice</span>
            </button>

            <Link
              to={`/order-confirmation/${order.orderNumber}`}
              style={{
                fontSize: '0.84rem',
                padding: '0.5rem 1.15rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#0f172a',
                color: '#ffffff',
                borderRadius: '9999px',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.1)',
              }}
            >
              <span>Live Transit Tracker</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────── */
export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    orderAPI.myOrders()
      .then((data) => setOrders(data || []))
      .catch((err) => console.error('Error fetching orders', err))
      .finally(() => setLoading(false));
  }, []);

  const statuses = ['ALL', ...new Set(orders.map(o => o.status).filter(Boolean))];

  const filtered = orders.filter(o => {
    const matchesSearch = !search ||
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.items?.some(i => i.productName?.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = filterStatus === 'ALL' || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '8rem 2rem' }}>
        <div className="luxury-spinner" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: '#64748b', fontWeight: 600 }}>Loading your reservations & orders...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1040px', padding: '3rem 1.5rem 6rem' }}>
      
      {/* Page header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
          Your Order History
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
          Manage your past acquisitions, live courier tracking, invoices, and concierge support.
        </p>
      </div>

      {/* Search and filter toolbar */}
      <div style={{
        display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '2rem', background: '#ffffff', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by order # or creation name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '0.6rem 0.85rem 0.6rem 2.4rem', borderRadius: '10px',
              border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '0.88rem', color: '#0f172a', outline: 'none',
            }}
          />
        </div>

        {/* Status filter pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {statuses.map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                padding: '0.45rem 0.95rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 700,
                border: filterStatus === st ? '1px solid #0f172a' : '1px solid #e2e8f0',
                background: filterStatus === st ? '#0f172a' : '#f8fafc',
                color: filterStatus === st ? '#ffffff' : '#64748b',
                cursor: 'pointer', transition: 'all 0.15s ease',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <Package size={30} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
            No matching orders found
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            You haven't placed any orders matching your search query.
          </p>
          <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#0f172a', color: '#ffffff', padding: '0.75rem 1.6rem', borderRadius: '9999px', fontWeight: 700, textDecoration: 'none' }}>
            Explore Creations <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filtered.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

    </div>
  );
}
