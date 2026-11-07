import { useAuth } from '../context/AuthContext';

const BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let errMessage = res.statusText || 'Request failed';
    try {
      const err = await res.json();
      if (err.errors && typeof err.errors === 'object') {
        errMessage = Object.entries(err.errors)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
      } else if (err.message) {
        errMessage = err.message;
      } else if (err.error) {
        errMessage = err.error;
      }
    } catch {
      // Body was not JSON
    }

    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      errMessage = 'Session expired or invalid credentials. Please log in again.';
    } else if (res.status === 403) {
      errMessage = 'Access denied. Administrator privileges required.';
    }

    throw new Error(errMessage);
  }

  if (res.status === 204) return null;
  return res.json();
}

// Media Upload (Cloudinary)
export const uploadAPI = {
  uploadImage: (file, folder = 'ecommerce/products') => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    return request('/upload/image', {
      method: 'POST',
      body: formData,
    });
  },
};

// Auth
export const authAPI = {
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/auth/me'),
};

// Products (public & admin endpoints)
export const productAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products?${qs}`);
  },
  byId: (id) => request(`/products/${id}`),
  featured: () => request('/products/featured'),
  create: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  toggleFeatured: (id) => request(`/products/${id}/toggle-featured`, { method: 'PATCH' }),
  adjustStock: (id, delta) => request(`/products/${id}/adjust-stock?delta=${delta}`, { method: 'PATCH' }),
};

// Categories (public)
export const categoryAPI = {
  list: () => request('/categories'),
};

// Cart (auth required)
export const cartAPI = {
  get: () => request('/cart'),
  addItem: (data) => request('/cart/items', { method: 'POST', body: JSON.stringify(data) }),
  updateItem: (id, quantity) => request(`/cart/items/${id}?quantity=${quantity}`, { method: 'PUT' }),
  removeItem: (id) => request(`/cart/items/${id}`, { method: 'DELETE' }),
  clear: () => request('/cart', { method: 'DELETE' }),
};

// Orders (auth required)
export const orderAPI = {
  place: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  myOrders: () => request('/orders/my-orders'),
  byNumber: (num) => request(`/orders/${num}`),
};

// Admin Endpoints (with seamless fallback between /admin/* and /* endpoints)
export const adminAPI = {
  stats: () => request('/admin/dashboard/stats'),
  // Products
  getAllProducts: async () => {
    try {
      const res = await request('/admin/products');
      return Array.isArray(res) ? res : (res?.content || []);
    } catch {
      const res = await request('/products?size=100');
      return Array.isArray(res) ? res : (res?.content || []);
    }
  },
  createProduct: async (data) => {
    try {
      return await request('/admin/products', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      return await request('/products', { method: 'POST', body: JSON.stringify(data) });
    }
  },
  updateProduct: async (id, data) => {
    try {
      return await request(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    } catch {
      return await request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    }
  },
  deleteProduct: async (id) => {
    try {
      return await request(`/admin/products/${id}`, { method: 'DELETE' });
    } catch {
      return await request(`/products/${id}`, { method: 'DELETE' });
    }
  },
  toggleFeatured: async (id) => {
    try {
      return await request(`/admin/products/${id}/toggle-featured`, { method: 'PATCH' });
    } catch {
      return await request(`/products/${id}/toggle-featured`, { method: 'PATCH' });
    }
  },
  adjustStock: async (id, delta) => {
    try {
      return await request(`/admin/products/${id}/adjust-stock?delta=${delta}`, { method: 'PATCH' });
    } catch {
      return await request(`/products/${id}/adjust-stock?delta=${delta}`, { method: 'PATCH' });
    }
  },
  // Categories
  createCategory: (data) => request('/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) => request(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/admin/categories/${id}`, { method: 'DELETE' }),
  // Orders
  getAllOrders: async () => {
    try {
      const res = await request('/admin/orders');
      return Array.isArray(res) ? res : (res?.content || []);
    } catch {
      const res = await request('/orders');
      return Array.isArray(res) ? res : (res?.content || []);
    }
  },
  updateOrderStatus: async (id, status) => {
    try {
      return await request(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    } catch {
      return await request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    }
  },
  // Users
  getAllUsers: () => request('/admin/users'),
  // Coupons
  getAllCoupons: () => request('/admin/coupons'),
  createCoupon: (data) => request('/admin/coupons', { method: 'POST', body: JSON.stringify(data) }),
  updateCoupon: (id, data) => request(`/admin/coupons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleCoupon: (id) => request(`/admin/coupons/${id}/toggle`, { method: 'PATCH' }),
  deleteCoupon: (id) => request(`/admin/coupons/${id}`, { method: 'DELETE' }),
};

// Public & Customer Coupon API
export const couponAPI = {
  getActive: () => request('/coupons/active'),
  getCustomerCoupons: (email) => request(email ? `/coupons/customer?email=${encodeURIComponent(email)}` : '/coupons/customer'),
  validate: (code, amount = 0) => request('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, orderAmount: amount }) }),
  getAll: () => request('/admin/coupons'),
  create: (data) => request('/admin/coupons', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/admin/coupons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggle: (id) => request(`/admin/coupons/${id}/toggle`, { method: 'PATCH' }),
  delete: (id) => request(`/admin/coupons/${id}`, { method: 'DELETE' }),
};

// Razorpay Payment Gateway API
export const paymentAPI = {
  getConfig: () => request('/payment/config'),
  createOrder: (amount, receipt = '', currency = 'INR') =>
    request('/payment/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount, receipt, currency }),
    }),
  verifyPayment: (data) =>
    request('/payment/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};


