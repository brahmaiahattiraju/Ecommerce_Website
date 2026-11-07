import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, Globe, Share2, MessageCircle, Mail, ShieldCheck, 
  Truck, RefreshCw, Headphones, ArrowRight, CheckCircle2, CreditCard, Lock
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import '../styles/store.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const toast = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setSubscribed(true);
    toast.success('Welcome to the AURA Insiders Circle! Enjoy 15% off your first order.');
    setEmail('');
  };

  return (
    <footer className="footer" style={{ borderTop: 'none' }}>
      {/* Amazon Back to Top Bar */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          width: '100%',
          background: '#1e293b',
          color: '#ffffff',
          border: 'none',
          padding: '0.9rem',
          fontSize: '0.85rem',
          fontWeight: 700,
          cursor: 'pointer',
          textAlign: 'center',
          transition: 'background 0.2s ease',
        }}
        onMouseOver={(e) => e.currentTarget.style.background = '#334155'}
        onMouseOut={(e) => e.currentTarget.style.background = '#1e293b'}
      >
        Back to top ↑
      </button>

      {/* 1. VIP Newsletter Box Strip */}
      <div className="footer-newsletter-banner">
        <div className="container">
          <div className="footer-newsletter-card">
            <div className="newsletter-text-content">
              <span className="newsletter-tag">EXCLUSIVE PRIVILEGES</span>
              <h3 className="newsletter-headline">Join the AURA Insiders Circle</h3>
              <p className="newsletter-desc">
                Subscribe for private showcase access, seasonal drop notifications, and 15% savings on your initial acquisition.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="newsletter-form">
              {subscribed ? (
                <div className="newsletter-success">
                  <CheckCircle2 size={20} color="var(--accent-emerald)" />
                  <span>You're on the list! Check your inbox for your welcome code.</span>
                </div>
              ) : (
                <div className="newsletter-input-group">
                  <input
                    type="email"
                    placeholder="Enter your VIP email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary">
                    Subscribe <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      <div className="container">
        {/* 2. Main Footer Navigation Grid */}
        <div className="footer-grid">
          {/* Brand Col */}
          <div className="footer-col brand-col">
            <Link to="/" className="brand-logo" style={{ marginBottom: '1.25rem' }}>
              <div className="brand-icon-box">
                <Zap size={22} color="#fff" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="brand-text">AURA<span style={{ color: 'var(--primary)' }}>.</span></span>
                <span className="brand-subtext">MODERN LUXURY</span>
              </div>
            </Link>
            <p className="footer-brand-bio">
              Architecting tomorrow's lifestyle essentials through meticulous material engineering, bespoke digital experiences, and timeless aesthetic integrity.
            </p>
            <div className="footer-social-icons">
              {[Globe, Share2, MessageCircle].map((Icon, i) => (
                <a key={i} href="#" className="footer-social-btn" aria-label="Social Link">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Departments */}
          <div className="footer-col">
            <h4>Boutique Departments</h4>
            <ul className="footer-links">
              <li><Link to="/shop">Complete Catalog</Link></li>
              <li><Link to="/shop?category=electronics">Flagship Tech & Audio</Link></li>
              <li><Link to="/shop?category=audio">Acoustic Wearables</Link></li>
              <li><Link to="/shop?category=fashion">Artisanal Apparel</Link></li>
              <li><Link to="/shop?category=home-living">Architectural Living</Link></li>
              <li><Link to="/shop?sort=price_asc">Limited Archive Drops</Link></li>
            </ul>
          </div>

          {/* Client Concierge */}
          <div className="footer-col">
            <h4>Client Concierge</h4>
            <ul className="footer-links">
              <li><Link to="/account">My Client Portal</Link></li>
              <li><Link to="/orders">Real-Time Dispatch Tracking</Link></li>
              <li><Link to="/cart">Review Shopping Bag</Link></li>
              <li><a href="#returns">30-Day Express Returns</a></li>
              <li><a href="#warranty">2-Year International Warranty</a></li>
              <li><a href="#support">24/7 Concierge Hotline</a></li>
            </ul>
          </div>

          {/* Security & Authentication */}
          <div className="footer-col">
            <h4>Certified Quality</h4>
            <div className="footer-trust-list">
              <div className="footer-trust-badge">
                <ShieldCheck size={18} color="var(--primary)" />
                <div>
                  <strong>Authenticity Guaranteed</strong>
                  <p>100% verified original luxury wares</p>
                </div>
              </div>
              <div className="footer-trust-badge">
                <Truck size={18} color="var(--accent-emerald)" />
                <div>
                  <strong>Global Insured Transit</strong>
                  <p>Signature delivery protection</p>
                </div>
              </div>
              <div className="footer-trust-badge">
                <Lock size={18} color="var(--accent-cyan)" />
                <div>
                  <strong>256-Bit SSL Protection</strong>
                  <p>Encrypted frictionless checkout</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Payment Methods & Guarantee Strip */}
        <div className="footer-payments-strip">
          <div className="payment-badges-row">
            <span className="payment-label">SECURE ENCRYPTED GATEWAYS:</span>
            <div className="payment-chips">
              <span className="pay-chip">VISA</span>
              <span className="pay-chip">MASTERCARD</span>
              <span className="pay-chip">AMEX</span>
              <span className="pay-chip">APPLE PAY</span>
              <span className="pay-chip">GOOGLE PAY</span>
              <span className="pay-chip">PAYPAL</span>
            </div>
          </div>
        </div>

        {/* 4. Bottom Copyright Bar */}
        <div className="footer-bottom">
          <p>© 2026 AURA International Luxury Commerce Ltd. All rights reserved.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
              <Mail size={14} color="var(--primary)" /> concierge@aura-luxury.com
            </span>
            <span style={{ color: 'var(--text-dim)' }}>•</span>
            <span style={{ color: 'var(--text-muted)' }}>Security Grade A+</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

