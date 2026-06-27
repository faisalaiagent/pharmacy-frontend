// src/config/api.ts
// All API base URLs and endpoints in one place.
// Change NEXT_PUBLIC_API_URL in .env.local to point at production backend.

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const API_URL = `${API_BASE_URL}/api/v1`;

export const ENDPOINTS = {
  // Auth
  auth: {
    register: "/auth/register/",
    login: "/auth/login/",
    logout: "/auth/logout/",
    profile: "/auth/profile/",
    tokenRefresh: "/auth/token/refresh/",
    passwordChange: "/auth/password/change/",
    passwordReset: "/auth/password/reset/",
    addresses: "/auth/addresses/",
    address: (id: string) => `/auth/addresses/${id}/`,
    setDefaultAddress: (id: string) => `/auth/addresses/${id}/set-default/`,
    adminUsers: "/auth/admin/users/",
    adminUser: (id: string) => `/auth/admin/users/${id}/`,
    verifyPharmacist: (id: string) => `/auth/admin/pharmacists/${id}/verify/`,
  },

  // Products
  products: {
    list: "/products/",
    detail: (slug: string) => `/products/${slug}/`,
    featured: "/products/featured/",
    bestSellers: "/products/best-sellers/",
    recent: "/products/recent/",
    related: (slug: string) => `/products/${slug}/related/`,
    reviews: (slug: string) => `/products/${slug}/reviews/`,
    categories: "/products/categories/all/",
    featuredCategories: "/products/categories/featured/",
    brands: "/products/brands/all/",
    manufacturers: "/products/manufacturers/all/",
    adminList: "/products/admin/products/",
    adminDetail: (id: string) => `/products/admin/products/${id}/`,
  },

  // Cart & Wishlist
  cart: {
    get: "/cart/",
    add: "/cart/add/",
    updateItem: (id: string) => `/cart/items/${id}/`,
    removeItem: (id: string) => `/cart/items/${id}/remove/`,
    clear: "/cart/clear/",
    wishlist: "/cart/wishlist/",
    removeWishlist: (productId: string) => `/cart/wishlist/${productId}/remove/`,
  },

  // Orders
  orders: {
    list: "/orders/",
    place: "/orders/place/",
    detail: (id: string) => `/orders/${id}/`,
    cancel: (orderNumber: string) => `/orders/${orderNumber}/cancel/`,
    adminList: "/orders/admin/",
    adminStatus: (orderNumber: string) => `/orders/admin/${orderNumber}/status/`,
  },

  // Prescriptions
  prescriptions: {
    list: "/prescriptions/",
    upload: "/prescriptions/upload/",
    detail: (id: string) => `/prescriptions/${id}/`,
    pharmacistQueue: "/prescriptions/pharmacist/queue/",
    claim: (id: string) => `/prescriptions/pharmacist/${id}/claim/`,
    review: (id: string) => `/prescriptions/pharmacist/${id}/review/`,
    adminList: "/prescriptions/admin/",
    adminAssign: (id: string) => `/prescriptions/admin/${id}/assign/`,
  },

  // Payments
  payments: {
    stripeIntent: "/payments/stripe/create-intent/",
    stripeWebhook: "/payments/stripe/webhook/",
    codConfirm: "/payments/cod/confirm/",
    history: "/payments/history/",
  },

  // Coupons
  coupons: {
    validate: "/coupons/validate/",
    adminList: "/coupons/admin/",
  },

  // Notifications
  notifications: {
    list: "/notifications/",
    markRead: (id: string) => `/notifications/${id}/read/`,
    markAllRead: "/notifications/read-all/",
  },

  // Content
  content: {
    blog: "/content/blog/",
    blogDetail: (slug: string) => `/content/blog/${slug}/`,
    faqs: "/content/faqs/",
  },

  // AI Assistant
  ai: {
    search: "/ai/search/",
    healthInfo: "/ai/health-info/",
    recommend: "/ai/recommend/",
  },

  // Admin
  admin: {
    dashboard: "/admin/dashboard/",
  },
};
