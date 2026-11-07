import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, User, ShoppingCart, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import '../styles/store.css';

export default function MobileBottomNav({ onCartOpen }) {
  const { isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const location = useLocation();

  // Don't show inside checkout to keep checkout flow completely distraction-free
  if (location.pathname === '/checkout') {
    return null;
  }

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <NavLink
        to="/"
        className={({ isActive }) => `mobile-nav-item ${isActive && location.pathname === '/' ? 'active' : ''}`}
      >
        <div className="mobile-nav-icon-wrap">
          <Home size={20} />
        </div>
        <span className="mobile-nav-label">Home</span>
      </NavLink>

      <NavLink
        to="/shop"
        className={({ isActive }) => `mobile-nav-item ${isActive && location.pathname === '/shop' ? 'active' : ''}`}
      >
        <div className="mobile-nav-icon-wrap">
          <Compass size={20} />
        </div>
        <span className="mobile-nav-label">Explore</span>
      </NavLink>

      <NavLink
        to="/wishlist"
        className={({ isActive }) => `mobile-nav-item ${isActive || location.pathname.includes('wish') ? 'active' : ''}`}
        aria-label="Wishlist"
      >
        <div className="mobile-nav-icon-wrap" style={{ position: 'relative' }}>
          <Heart 
            size={20} 
            color={wishlistCount > 0 ? "#f43f5e" : "currentColor"} 
            fill={wishlistCount > 0 ? "#f43f5e" : "none"} 
          />
          {wishlistCount > 0 && (
            <span className="mobile-nav-badge" style={{ background: '#e11d48' }}>
              {wishlistCount > 99 ? '99+' : wishlistCount}
            </span>
          )}
        </div>
        <span className="mobile-nav-label" style={{ color: wishlistCount > 0 ? '#f43f5e' : 'inherit' }}>
          Wishlist
        </span>
      </NavLink>

      <button
        type="button"
        onClick={onCartOpen}
        className="mobile-nav-item"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
        aria-label="Open Cart"
      >
        <div className="mobile-nav-icon-wrap" style={{ position: 'relative' }}>
          <ShoppingCart size={20} />
          {itemCount > 0 && (
            <span className="mobile-nav-badge">{itemCount > 99 ? '99+' : itemCount}</span>
          )}
        </div>
        <span className="mobile-nav-label">Bag</span>
      </button>

      <NavLink
        to={isAuthenticated ? "/account" : "/login"}
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <div className="mobile-nav-icon-wrap">
          <User size={20} />
        </div>
        <span className="mobile-nav-label">{isAuthenticated ? 'Account' : 'Sign In'}</span>
      </NavLink>
    </nav>
  );
}
