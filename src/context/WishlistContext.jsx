import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);
const WISHLIST_STORAGE_KEY = 'aura_wishlist_items';

export function WishlistProvider({ children }) {
  const toast = useToast();
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Failed to save wishlist', e);
    }
  }, [wishlist]);

  const isInWishlist = useCallback((productId) => {
    if (!productId) return false;
    return wishlist.some((item) => String(item.id) === String(productId));
  }, [wishlist]);

  const toggleWishlist = useCallback((product) => {
    if (!product || !product.id) return;
    const exists = wishlist.some((item) => String(item.id) === String(product.id));

    if (exists) {
      setWishlist((prev) => prev.filter((item) => String(item.id) !== String(product.id)));
      toast?.info?.(`Removed ${product.name?.slice(0, 24) || 'Item'}... from your Wishlist`);
    } else {
      const newItem = {
        id: product.id,
        name: product.name || 'Luxury Product',
        price: Number(product.price) || 0,
        comparePrice: Number(product.comparePrice) || Math.round((Number(product.price) || 0) * 1.25),
        imageUrl: product.imageUrl || '',
        rating: product.rating || 4.8,
        category: product.category || { name: 'Exclusive' },
        stockQuantity: product.stockQuantity,
        addedAt: new Date().toISOString()
      };
      setWishlist((prev) => [newItem, ...prev.filter((item) => String(item.id) !== String(product.id))]);
      toast?.success?.(`Saved ${product.name?.slice(0, 24) || 'Item'}... to your Wishlist ❤️`);
    }
  }, [wishlist, toast]);

  const removeFromWishlist = useCallback((productId) => {
    const item = wishlist.find((p) => String(p.id) === String(productId));
    setWishlist((prev) => prev.filter((p) => String(p.id) !== String(productId)));
    if (item) {
      toast?.info?.(`Removed ${item.name?.slice(0, 24) || 'Item'}... from Wishlist`);
    }
  }, [wishlist, toast]);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
    toast?.info?.('Cleared your Wishlist');
  }, [toast]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
