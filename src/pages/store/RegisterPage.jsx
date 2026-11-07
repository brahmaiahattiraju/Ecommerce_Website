import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, MapPin, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authAPI } from '../../services/api';
import '../../styles/store.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
  });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // If already authenticated, redirect immediately to home page
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const data = await authAPI.register(formData);
      login(data);
      toast.success(`Account created! Welcome, ${data.fullName}`);
      // Directly navigate to the home page
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: 'calc(100vh - 180px)', 
      padding: '3rem 1.5rem',
    }}>
      <div style={{ 
        maxWidth: '560px', 
        width: '100%', 
        padding: 'clamp(1.5rem, 5vw, 3rem) clamp(1.2rem, 4vw, 2.5rem)',
        background: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 20px 50px -10px rgba(15, 23, 42, 0.08)',
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 8px 25px rgba(79, 70, 229, 0.25)',
          }}>
            <Sparkles size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
            Aura Privilege Membership
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Join our private circle for complimentary courier, direct warranty & concierge.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-responsive-row">
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.84rem' }}>Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Marcus Vance"
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.84rem' }}>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="marcus@example.com"
              />
            </div>
          </div>

          <div className="form-responsive-row">
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.84rem' }}>Password * (min 6 chars)</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.84rem' }}>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.84rem' }}>Delivery Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Suite, Building, Area"
            />
          </div>

          <div className="form-responsive-row">
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.84rem' }}>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Mumbai, Bengaluru"
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.84rem' }}>Postal Pincode</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="560001"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              background: '#0f172a',
              color: '#ffffff',
              padding: '0.9rem',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: 'none',
              cursor: loading ? 'wait' : 'pointer',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.2)',
              marginTop: '0.75rem',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{loading ? 'Creating Membership...' : 'Register Atelier Account'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.88rem', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
