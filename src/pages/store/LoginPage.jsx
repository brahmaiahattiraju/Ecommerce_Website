import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Sparkles, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authAPI } from '../../services/api';
import '../../styles/store.css';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
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
    setLoading(true);
    try {
      const data = await authAPI.login(formData);
      // Block admin accounts from logging into the customer storefront
      if (data.role === 'ROLE_ADMIN') {
        const adminUrl = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174';
        toast.error(`Admin accounts must use the Admin Panel. Redirecting...`);
        setTimeout(() => { window.location.href = adminUrl + '/login'; }, 1500);
        return;
      }
      login(data);
      toast.success(`Welcome back, ${data.fullName}!`);
      // Directly navigate to the home page
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
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
      position: 'relative',
    }}>
      <div style={{ 
        maxWidth: '460px', 
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
            Member Sign In
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Access your private atelier orders, reservations & concierge.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.84rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                name="email"
                placeholder="Enter your registered email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ paddingLeft: '2.6rem' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.84rem' }}>
              Secret Passphrase
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ paddingLeft: '2.6rem' }}
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
              marginTop: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Atelier'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.88rem', color: '#64748b' }}>
          Don't have an Aura account?{' '}
          <Link to="/register" style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>
            Create Membership
          </Link>
        </div>
      </div>
    </div>
  );
}
