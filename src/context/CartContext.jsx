import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { productAPI, couponAPI } from '../services/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { token, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_guest_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [cartId, setCartId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !token) {
      try {
        const saved = localStorage.getItem('aura_guest_cart');
        setCartItems(saved ? JSON.parse(saved) : []);
      } catch {
        setCartItems([]);
      }
      return;
    }
    try {
      // Sync guest cart to backend if any
      const guestSaved = localStorage.getItem('aura_guest_cart');
      if (guestSaved) {
        const guestItems = JSON.parse(guestSaved);
        if (guestItems && guestItems.length > 0) {
          for (const it of guestItems) {
            const pid = it.product?.id || it.productId || it.id;
            if (pid) {
              await fetch('/api/cart/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ productId: pid, quantity: it.quantity || 1 })
              }).catch(() => {});
            }
          }
          localStorage.removeItem('aura_guest_cart');
        }
      }

      const res = await fetch('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCartId(data.id);
        setCartItems(data.items || []);
      }
    } catch (e) {
      console.error('Failed to fetch cart', e);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1, productDetails = null) => {
    if (isAuthenticated && token) {
      try {
        const res = await fetch('/api/cart/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ productId, quantity })
        });
        if (res.ok) {
          const data = await res.json();
          setCartItems(data.items || []);
          return true;
        }
      } catch (e) {
        console.error('Failed to add to backend cart', e);
      }
      return false;
    }

    // Guest Cart support
    try {
      let product = productDetails;
      if (!product) {
        product = await productAPI.byId(productId).catch(() => null);
      }
      if (!product) {
        product = { id: productId, name: 'Curated Luxury Item', price: 999.00 };
      }

      setCartItems((prev) => {
        const existingIdx = prev.findIndex((it) => (it.product?.id || it.productId || it.id) === productId);
        let updated;
        if (existingIdx >= 0) {
          updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + quantity
          };
        } else {
          updated = [
            ...prev,
            {
              id: Date.now() + Math.random(),
              productId,
              product,
              productName: product.name,
              price: product.price,
              quantity,
              imageUrl: product.imageUrl,
            }
          ];
        }
        localStorage.setItem('aura_guest_cart', JSON.stringify(updated));
        return updated;
      });
      return true;
    } catch (e) {
      console.error('Failed to add to guest cart', e);
      return false;
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity <= 0) {
      return removeItem(cartItemId);
    }

    if (isAuthenticated && token) {
      try {
        const res = await fetch(`/api/cart/items/${cartItemId}?quantity=${quantity}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCartItems(data.items || []);
        }
      } catch (e) {
        console.error('Failed to update quantity', e);
      }
      return;
    }

    // Guest cart update
    setCartItems((prev) => {
      const updated = prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item));
      localStorage.setItem('aura_guest_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeItem = async (cartItemId) => {
    if (isAuthenticated && token) {
      try {
        const res = await fetch(`/api/cart/items/${cartItemId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCartItems(data.items || []);
        }
      } catch (e) {
        console.error('Failed to remove item', e);
      }
      return;
    }

    // Guest cart remove
    setCartItems((prev) => {
      const updated = prev.filter((item) => item.id !== cartItemId);
      localStorage.setItem('aura_guest_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_applied_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('aura_guest_cart');
    removeCoupon();
  };

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.price || item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon || !appliedCoupon.valid) return 0;
    if (appliedCoupon.minOrderAmount && subtotal < appliedCoupon.minOrderAmount) {
      return 0;
    }
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      const pct = (subtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscountAmount && pct > appliedCoupon.maxDiscountAmount) {
        return Math.round(appliedCoupon.maxDiscountAmount);
      }
      return Math.round(pct);
    }
    return Math.min(Math.round(appliedCoupon.discountValue), subtotal);
  }, [appliedCoupon, subtotal]);

  const finalTotal = Math.max(0, subtotal - discountAmount);

  const applyCoupon = async (code) => {
    if (!code || !code.trim()) {
      return { success: false, message: 'Please enter a coupon code' };
    }
    try {
      const res = await couponAPI.validate(code.trim().toUpperCase(), subtotal);
      if (res.valid) {
        setAppliedCoupon(res);
        localStorage.setItem('aura_applied_coupon', JSON.stringify(res));
        return { success: true, message: res.message, data: res };
      } else {
        return { success: false, message: res.message };
      }
    } catch (err) {
      return { success: false, message: err.message || 'Failed to validate coupon' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem('aura_applied_coupon');
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartId,
        itemCount,
        subtotal,
        appliedCoupon,
        discountAmount,
        finalTotal,
        applyCoupon,
        removeCoupon,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        fetchCart,
        drawerOpen,
        setDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

