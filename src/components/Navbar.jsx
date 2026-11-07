import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, Search, User, LogOut, LayoutDashboard, 
  Menu, X, ChevronDown, Sparkles, Package, Compass, ArrowRight, ShieldCheck,
  MapPin, Flame, Globe, HelpCircle, Heart, Tag
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { categoryAPI } from '../services/api';
import { formatINR } from '../utils/currency';
import LocationPicker from './LocationPicker';
import EnhancedSearchBox from './EnhancedSearchBox';
import '../styles/store.css';

export default function Navbar({ onCartOpen }) {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { itemCount, subtotal } = useCart();
  const { wishlistCount } = useWishlist();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    categoryAPI.list()
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.content || []);
        setCategories(list);
      })
      .catch((err) => console.error('Failed to load nav categories', err));
  }, []);

  // Sync selectedCategory and search from URL query
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat) {
      setSelectedCategory(cat);
    } else {
      setSelectedCategory('all');
    }

    const q = params.get('search');
    if (q) {
      setSearch(q);
    } else if (location.pathname === '/shop' && !q) {
      setSearch('');
    }
  }, [location.search, location.pathname]);

  const navigateToSearchOrCategory = (categoryVal, searchTerm) => {
    const trimmed = (searchTerm || '').trim();
    const params = new URLSearchParams();
    if (trimmed) params.set('search', trimmed);
    if (categoryVal && categoryVal !== 'all') params.set('category', categoryVal);

    const queryString = params.toString();
    navigate(queryString ? `/shop?${queryString}` : '/shop');
  };

  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    setSelectedCategory(newCat);
    navigateToSearchOrCategory(newCat, search);
  };

  const handleCategoryKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      navigateToSearchOrCategory(e.target.value || selectedCategory, search);
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    navigateToSearchOrCategory(selectedCategory, search);
  };

  const handleLogout = () => {
    logout();
    toast.success('Signed out of AURA');
    navigate('/');
  };

  return (
    <>
      <header
        className={`amz-navbar-container ${isScrolled ? 'is-scrolled' : ''}`}
        style={{ position: 'sticky', top: 0, zIndex: 1000 }}
      >
        {/* 1. Main Amazon/Flipkart Header Bar with Luxury Palette */}
        <div className="amz-main-header">
          
          {/* Left: Brand Logo */}
          <div className="amz-header-left">
            {/* Brand Logo */}
            <Link to="/" className="amz-brand" title="AURA Online Store">
              <div className="amz-brand-logo-icon">
                <Sparkles size={18} />
              </div>
              <div className="amz-brand-text-wrap">
                <div className="amz-brand-text">
                  AURA<span className="amz-brand-dot">.store</span>
                </div>
                <div className="amz-brand-tagline">Electronics & Lifestyle</div>
              </div>
            </Link>
          </div>

          {/* Deliver to Pin/City Selector */}
          <div className="amz-location-wrapper">
            <LocationPicker />
          </div>

          {/* Intelligent Central Search Box with Live Autocomplete & Recent Searches */}
          <EnhancedSearchBox
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            initialQuery={search}
            onSearchSubmit={navigateToSearchOrCategory}
          />

          {/* Right Nav Actions (Language, Account, Orders, Cart) */}
          <div className="amz-nav-actions">
            
            {/* Region / Currency */}
            <div className="amz-nav-pill-btn" style={{ display: 'none', lg: 'flex' }}>
              <span className="amz-nav-pill-small">Region</span>
              <span className="amz-nav-pill-bold">
                🇮🇳 EN • ₹
              </span>
            </div>

            {/* Account & Lists with Interactive Dropdown */}
            <div 
              style={{ position: 'relative' }}
              onMouseEnter={() => setAccountMenuOpen(true)}
              onMouseLeave={() => setAccountMenuOpen(false)}
            >
              {isAuthenticated ? (
                <Link to={isAdmin ? "/admin" : "/account"} className="amz-nav-pill-btn" id="nav-account-btn">
                  <span className="amz-nav-pill-small">Hello, {user?.fullName?.split(' ')[0] || 'Member'}</span>
                  <span className="amz-nav-pill-bold">
                    Account & Lists <ChevronDown size={13} />
                  </span>
                </Link>
              ) : (
                <Link to="/login" className="amz-nav-pill-btn" id="nav-account-btn">
                  <span className="amz-nav-pill-small">Hello, sign in</span>
                  <span className="amz-nav-pill-bold">
                    Account & Lists <ChevronDown size={13} />
                  </span>
                </Link>
              )}

              {/* Luxury Amazon-Style Account & Lists Popover */}
              {accountMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  width: '280px',
                  background: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 15px rgba(79, 70, 229, 0.25)',
                  padding: '1rem',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  {/* Lists Section */}
                  <div>
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.45rem' }}>
                      Your Lists
                    </div>
                    <Link
                      to="/wishlist"
                      onClick={() => setAccountMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.65rem',
                        borderRadius: '6px',
                        background: 'rgba(244, 63, 94, 0.1)',
                        border: '1px solid rgba(244, 63, 94, 0.25)',
                        color: '#fecdd3',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Heart size={16} color="#f43f5e" fill={wishlistCount > 0 ? "#f43f5e" : "none"} />
                        <span>Wishlist & Saved Items</span>
                      </div>
                      <span style={{
                        background: '#e11d48',
                        color: '#fff',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '999px'
                      }}>
                        {wishlistCount}
                      </span>
                    </Link>
                  </div>

                  <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />

                  {/* Account Section */}
                  <div>
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.45rem' }}>
                      Your Account
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <Link
                        to="/orders"
                        onClick={() => setAccountMenuOpen(false)}
                        style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '0.82rem', padding: '0.35rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
                      >
                        <Package size={14} color="#38bdf8" />
                        <span>Your Orders & Tracking</span>
                      </Link>
                      <Link
                        to="/account"
                        onClick={() => setAccountMenuOpen(false)}
                        style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '0.82rem', padding: '0.35rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
                      >
                        <User size={14} color="#818cf8" />
                        <span>Account & Security</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setAccountMenuOpen(false)}
                          style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '0.82rem', padding: '0.35rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700 }}
                        >
                          <LayoutDashboard size={14} />
                          <span>Admin Studio Console</span>
                        </Link>
                      )}
                    </div>
                  </div>

                  <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />

                  {isAuthenticated ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        handleLogout();
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#f43f5e',
                        padding: '0.35rem 0.5rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem'
                      }}
                    >
                      <LogOut size={14} /> Sign Out of AURA
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setAccountMenuOpen(false)}
                      style={{
                        background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                        color: '#ffffff',
                        textAlign: 'center',
                        padding: '0.45rem',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '0.82rem',
                        fontWeight: 700
                      }}
                    >
                      Sign In to AURA
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Returns & Orders */}
            <Link 
              to={isAuthenticated ? "/orders" : "/login?redirect=/orders"} 
              className="amz-nav-pill-btn"
            >
              <span className="amz-nav-pill-small">Returns</span>
              <span className="amz-nav-pill-bold">& Orders</span>
            </Link>

            {/* Wishlist Link & Counter Badge */}
            <Link 
              to="/wishlist" 
              className="amz-nav-pill-btn amz-nav-wishlist-pill amz-nav-desktop-only"
              title="View My Wishlist"
              id="nav-wishlist-btn"
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Heart 
                  size={20} 
                  color={wishlistCount > 0 ? "#f43f5e" : "#ffffff"} 
                  fill={wishlistCount > 0 ? "#f43f5e" : "none"} 
                />
                {wishlistCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-7px',
                    right: '-8px',
                    background: '#e11d48',
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    minWidth: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 2px',
                    boxShadow: '0 2px 5px rgba(225, 29, 72, 0.4)'
                  }}>
                    {wishlistCount}
                  </span>
                )}
              </div>
              <div className="amz-nav-wishlist-text" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: '1.1' }}>
                <span className="amz-nav-pill-small">Saved</span>
                <span className="amz-nav-pill-bold">Wishlist</span>
              </div>
            </Link>

            {/* Shopping Cart Button */}
            <button 
              type="button" 
              className="amz-nav-cart-btn amz-nav-desktop-only" 
              onClick={onCartOpen}
              id="cart-toggle-btn"
              title="View Shopping Cart"
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginRight: '6px' }}>
                <ShoppingCart size={22} color="#ffffff" />
                {itemCount > 0 && (
                  <span className="amz-cart-badge">{itemCount}</span>
                )}
              </div>
              <div className="amz-cart-text-wrap" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: '1.1' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Cart</span>
                <span style={{ fontSize: '0.86rem', color: '#ffffff', fontWeight: 800 }}>
                  {formatINR(subtotal)}
                </span>
              </div>
            </button>

          {/* Sign Out (if logged in) */}
          {isAuthenticated && (
            <button 
              onClick={handleLogout} 
              className="amz-nav-pill-btn" 
              title="Sign Out"
              style={{ padding: '0.4rem', color: '#94a3b8' }}
            >
              <LogOut size={16} />
            </button>
          )}

        </div>

        {/* Mobile Hamburger Menu Toggle (Right Side on Mobile) */}
        <button
          type="button"
          className="amz-mobile-menu-btn"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open mobile menu"
          title="Open Menu"
        >
          <Menu size={22} />
        </button>

      </div>

      {/* 2. Amazon / Flipkart Sub-Nav Category Strip */}
      <div className="amz-subnav-bar">
        <div className="amz-subnav-inner">
          <div className="amz-subnav-links">
            <NavLink to="/shop" className={({ isActive }) => `amz-subnav-item ${isActive && !location.search ? 'active' : ''}`}>
              <Menu size={15} /> All Categories
            </NavLink>
            <NavLink to="/shop?sort=discount,desc" className="amz-subnav-item amz-subnav-deal">
              <Flame size={15} color="#38bdf8" /> Today's Deals
            </NavLink>
            {categories.map((c) => {
              const slug = c.slug || c.id;
              const isCurrent = location.pathname === '/shop' && location.search.includes(`category=${slug}`);
              return (
                <Link
                  key={c.id}
                  to={`/shop?category=${slug}`}
                  className={`amz-subnav-item ${isCurrent ? 'active' : ''}`}
                >
                  {c.name}
                </Link>
              );
            })}
            <Link to="/shop?sort=rating,desc" className="amz-subnav-item">
              <Sparkles size={14} color="#f59e0b" /> Best Sellers
            </Link>
            <Link to="/orders" className="amz-subnav-item">
              Customer Service
            </Link>
            {isAdmin && (
              <Link to="/admin" className="amz-subnav-item" style={{ color: '#06b6d4', fontWeight: 700 }}>
                <LayoutDashboard size={14} /> Admin Studio
              </Link>
            )}
          </div>

          {/* Right Trust Banner */}
          <div className="amz-subnav-assured-banner">
            <ShieldCheck size={14} color="#38bdf8" />
            <span>AURA ASSURED • 100% Genuine • Free Express Dispatch</span>
          </div>
        </div>
      </div>
    </header>

    {/* 3. Mobile Slide-Out Navigation Drawer */}
    {mobileMenuOpen && (
      <>
        <div
          className="amz-mobile-drawer-overlay"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu backdrop"
        />
        <aside className="amz-mobile-drawer">
          {/* Drawer User Header */}
          <div className="amz-mobile-drawer-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="amz-mobile-drawer-avatar">
                <User size={22} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                  Hello, {isAuthenticated ? (user?.fullName || 'Member') : 'Sign In'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {isAuthenticated ? (user?.email || 'Aura Privilege Member') : 'Access orders & concierge'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="amz-mobile-drawer-close"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Auth Action if not logged in */}
          {!isAuthenticated && (
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #1e293b' }}>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                  color: '#ffffff',
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                }}
              >
                <span>Sign In / Create Account</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          )}

          {/* Drawer Links Sections */}
          <div className="amz-mobile-drawer-body">
            <div className="amz-mobile-drawer-section-title">Shop By Department</div>
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="amz-mobile-drawer-link">
              <Menu size={16} /> All Categories
            </Link>
            <Link to="/shop?sort=discount,desc" onClick={() => setMobileMenuOpen(false)} className="amz-mobile-drawer-link" style={{ color: '#38bdf8' }}>
              <Flame size={16} /> Today's Lightning Deals
            </Link>
            <Link to="/shop?sort=rating,desc" onClick={() => setMobileMenuOpen(false)} className="amz-mobile-drawer-link" style={{ color: '#f59e0b' }}>
              <Sparkles size={16} /> Best Sellers
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/shop?category=${c.slug || c.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="amz-mobile-drawer-link"
              >
                <Tag size={15} color="#94a3b8" /> {c.name}
              </Link>
            ))}

            <div className="amz-mobile-drawer-divider" />

            <div className="amz-mobile-drawer-section-title">Programs & Features</div>
            <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="amz-mobile-drawer-link">
              <Heart size={16} color="#f43f5e" fill={wishlistCount > 0 ? "#f43f5e" : "none"} /> 
              <span>My Wishlist ({wishlistCount})</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onCartOpen();
              }}
              className="amz-mobile-drawer-link"
              style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <ShoppingCart size={16} color="#38bdf8" />
                <span>My Shopping Bag</span>
              </div>
              {itemCount > 0 && (
                <span style={{ background: '#4f46e5', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '999px' }}>
                  {itemCount}
                </span>
              )}
            </button>
            <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="amz-mobile-drawer-link">
              <Package size={16} /> Your Orders & Tracking
            </Link>
            <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="amz-mobile-drawer-link">
              <User size={16} /> Your Account & Addresses
            </Link>
            <div className="amz-mobile-drawer-link" style={{ opacity: 0.85, fontSize: '0.82rem' }}>
              <ShieldCheck size={16} color="#06b6d4" /> AURA ASSURED 100% Genuine
            </div>

            {isAdmin && (
              <>
                <div className="amz-mobile-drawer-divider" />
                <div className="amz-mobile-drawer-section-title">Administration</div>
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="amz-mobile-drawer-link" style={{ color: '#06b6d4', fontWeight: 700 }}>
                  <LayoutDashboard size={16} /> Admin Studio Dashboard
                </Link>
              </>
            )}

            {isAuthenticated && (
              <>
                <div className="amz-mobile-drawer-divider" />
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="amz-mobile-drawer-link"
                  style={{ color: '#f43f5e', background: 'transparent', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
                >
                  <LogOut size={16} /> Sign Out of AURA
                </button>
              </>
            )}
          </div>
        </aside>
      </>
    )}
  </>
);
}
