import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';

// Store Components
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import MobileBottomNav from './components/MobileBottomNav';
import Footer from './components/Footer';
import AuraConcierge from './components/AuraConcierge';
import { ProtectedRoute } from './components/ProtectedRoute';

// Store Pages
import HomePage from './pages/store/HomePage';
import ShopPage from './pages/store/ShopPage';
import ProductDetails from './pages/store/ProductDetails';
import CartPage from './pages/store/CartPage';
import WishlistPage from './pages/store/WishlistPage';
import CheckoutPage from './pages/store/CheckoutPage';
import OrderConfirmation from './pages/store/OrderConfirmation';
import OrderHistoryPage from './pages/store/OrderHistoryPage';
import LoginPage from './pages/store/LoginPage';
import RegisterPage from './pages/store/RegisterPage';
import CustomerDashboard from './pages/store/CustomerDashboard';

// Scroll to top on route change or navigation
function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, search]);

  return null;
}

// Store Layout Wrapper
function StoreLayout() {
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  return (
    <div className="store-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar onCartOpen={() => setCartDrawerOpen(true)} />
      {cartDrawerOpen && <CartDrawer onClose={() => setCartDrawerOpen(false)} />}
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
      <Footer />
      <MobileBottomNav onCartOpen={() => setCartDrawerOpen(true)} />
      <AuraConcierge />
    </div>
  );
}

// External Admin Redirect
function AdminRedirect() {
  const adminUrl = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174';
  window.location.href = adminUrl;
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Routes>
                {/* Storefront Layout & Public Routes */}
                <Route element={<StoreLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/products/:id" element={<ProductDetails />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/wish-list" element={<WishlistPage />} />
                  <Route path="/whislist" element={<WishlistPage />} />
                  <Route path="/whis-list" element={<WishlistPage />} />
                  <Route path="/wish" element={<WishlistPage />} />
                  <Route path="/saved" element={<WishlistPage />} />
                  <Route path="/favorites" element={<WishlistPage />} />
                  <Route path="/my-wishlist" element={<WishlistPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                {/* Customer Authenticated Routes */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/order-confirmation/:orderNumber"
                  element={
                    <ProtectedRoute>
                      <OrderConfirmation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrderHistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute>
                      <CustomerDashboard />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Seamless redirect to standalone Admin Panel */}
              <Route path="/admin/*" element={<AdminRedirect />} />
              <Route path="/admin" element={<AdminRedirect />} />
              
              {/* 404 Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
