// src/lib/api.ts
// All API call functions. Every component uses these rather than calling
// axios directly — keeps API logic centralised and easy to mock in tests.

import api from "./axios";
import { ENDPOINTS } from "@/config/api";
import {
  ApiResponse, PaginatedResponse, User, AuthResponse,
  Address, Product, Category, Brand, Cart, WishlistItem,
  Order, Prescription, Notification, Blog, FAQ, Coupon,
  Review, AdminDashboard,
} from "@/types";

// ── Auth ──────────────────────────────────────────────────────────
export const authApi = {
  register: (data: {
    email: string; username: string; first_name: string;
    last_name: string; password: string; password2: string;
  }) => api.post<ApiResponse<AuthResponse>>(ENDPOINTS.auth.register, data),

  login: (email: string, password: string) =>
    api.post<ApiResponse<AuthResponse>>(ENDPOINTS.auth.login, { email, password }),

  logout: (refresh: string) =>
    api.post<ApiResponse<null>>(ENDPOINTS.auth.logout, { refresh }),

  getProfile: () =>
    api.get<ApiResponse<User>>(ENDPOINTS.auth.profile),

  updateProfile: (data: Partial<User>) =>
    api.patch<ApiResponse<User>>(ENDPOINTS.auth.profile, data),

  changePassword: (data: { old_password: string; new_password: string; new_password2: string }) =>
    api.post<ApiResponse<null>>(ENDPOINTS.auth.passwordChange, data),

  requestPasswordReset: (email: string) =>
    api.post<ApiResponse<null>>(ENDPOINTS.auth.passwordReset, { email }),

  getAddresses: () =>
    api.get<ApiResponse<Address[]>>(ENDPOINTS.auth.addresses),

  addAddress: (data: Partial<Address>) =>
    api.post<ApiResponse<Address>>(ENDPOINTS.auth.addresses, data),

  updateAddress: (id: string, data: Partial<Address>) =>
    api.patch<ApiResponse<Address>>(ENDPOINTS.auth.address(id), data),

  deleteAddress: (id: string) =>
    api.delete(ENDPOINTS.auth.address(id)),

  setDefaultAddress: (id: string) =>
    api.post<ApiResponse<null>>(ENDPOINTS.auth.setDefaultAddress(id), {}),
};

// ── Products ──────────────────────────────────────────────────────
export const productsApi = {
  getProducts: (params?: Record<string, string | number | boolean>) =>
    api.get<ApiResponse<PaginatedResponse<Product>>>(ENDPOINTS.products.list, { params }),

  getProduct: (slug: string) =>
    api.get<ApiResponse<Product>>(ENDPOINTS.products.detail(slug)),

  getFeatured: () =>
    api.get<ApiResponse<Product[]>>(ENDPOINTS.products.featured),

  getBestSellers: () =>
    api.get<ApiResponse<Product[]>>(ENDPOINTS.products.bestSellers),

  getRecent: () =>
    api.get<ApiResponse<Product[]>>(ENDPOINTS.products.recent),

  getRelated: (slug: string) =>
    api.get<ApiResponse<Product[]>>(ENDPOINTS.products.related(slug)),

  getReviews: (slug: string) =>
    api.get<ApiResponse<PaginatedResponse<Review>>>(ENDPOINTS.products.reviews(slug)),

  addReview: (slug: string, data: { rating: number; title: string; comment: string }) =>
    api.post<ApiResponse<Review>>(ENDPOINTS.products.reviews(slug), data),

  getCategories: () =>
    api.get<ApiResponse<Category[]>>(ENDPOINTS.products.categories),

  getFeaturedCategories: () =>
    api.get<ApiResponse<Category[]>>(ENDPOINTS.products.featuredCategories),

  getBrands: () =>
    api.get<ApiResponse<Brand[]>>(ENDPOINTS.products.brands),
};

// ── Cart ──────────────────────────────────────────────────────────
export const cartApi = {
  getCart: () =>
    api.get<ApiResponse<Cart>>(ENDPOINTS.cart.get),

  addToCart: (product_id: string, quantity: number) =>
    api.post<ApiResponse<Cart>>(ENDPOINTS.cart.add, { product_id, quantity }),

  updateCartItem: (itemId: string, quantity: number) =>
    api.patch<ApiResponse<Cart>>(ENDPOINTS.cart.updateItem(itemId), { quantity }),

  removeCartItem: (itemId: string) =>
    api.delete<ApiResponse<Cart>>(ENDPOINTS.cart.removeItem(itemId)),

  clearCart: () =>
    api.delete<ApiResponse<null>>(ENDPOINTS.cart.clear),

  getWishlist: () =>
    api.get<ApiResponse<WishlistItem[]>>(ENDPOINTS.cart.wishlist),

  addToWishlist: (product_id: string) =>
    api.post<ApiResponse<WishlistItem>>(ENDPOINTS.cart.wishlist, { product_id }),

  removeFromWishlist: (productId: string) =>
    api.delete<ApiResponse<null>>(ENDPOINTS.cart.removeWishlist(productId)),
};

// ── Orders ────────────────────────────────────────────────────────
export const ordersApi = {
  getOrders: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<PaginatedResponse<Order>>>(ENDPOINTS.orders.list, { params }),

  getOrder: (id: string) =>
    api.get<ApiResponse<Order>>(ENDPOINTS.orders.detail(id)),

  placeOrder: (data: {
    shipping_address_id: string;
    payment_method: string;
    coupon_code?: string;
    prescription_id?: string;
    customer_notes?: string;
  }) => api.post<ApiResponse<Order>>(ENDPOINTS.orders.place, data),

  cancelOrder: (orderNumber: string, reason?: string) =>
    api.post<ApiResponse<Order>>(ENDPOINTS.orders.cancel(orderNumber), { reason }),
};

// ── Prescriptions ─────────────────────────────────────────────────
export const prescriptionsApi = {
  getPrescriptions: () =>
    api.get<ApiResponse<PaginatedResponse<Prescription>>>(ENDPOINTS.prescriptions.list),

  getPrescription: (id: string) =>
    api.get<ApiResponse<Prescription>>(ENDPOINTS.prescriptions.detail(id)),

  uploadPrescription: (data: {
    file_url: string; file_type: string; file_size_bytes: number;
    doctor_name?: string; patient_name?: string; customer_notes?: string;
  }) => api.post<ApiResponse<Prescription>>(ENDPOINTS.prescriptions.upload, data),
};

// ── Payments ─────────────────────────────────────────────────────
export const paymentsApi = {
  createStripeIntent: (order_number: string) =>
    api.post<ApiResponse<{ client_secret: string; payment_intent_id: string; amount: string }>>(
      ENDPOINTS.payments.stripeIntent, { order_number }
    ),

  confirmCOD: (order_number: string) =>
    api.post<ApiResponse<null>>(ENDPOINTS.payments.codConfirm, { order_number }),

  getPaymentHistory: () =>
    api.get(ENDPOINTS.payments.history),
};

// ── Coupons ───────────────────────────────────────────────────────
export const couponsApi = {
  validateCoupon: (code: string) =>
    api.post<ApiResponse<Coupon>>(ENDPOINTS.coupons.validate, { code }),
};

// ── Notifications ─────────────────────────────────────────────────
export const notificationsApi = {
  getNotifications: () =>
    api.get<ApiResponse<{ unread_count: number; notifications: Notification[] }>>(
      ENDPOINTS.notifications.list
    ),

  markRead: (id: string) =>
    api.post<ApiResponse<null>>(ENDPOINTS.notifications.markRead(id), {}),

  markAllRead: () =>
    api.post<ApiResponse<null>>(ENDPOINTS.notifications.markAllRead, {}),
};

// ── Content ───────────────────────────────────────────────────────
export const contentApi = {
  getBlogs: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<PaginatedResponse<Blog>>>(ENDPOINTS.content.blog, { params }),

  getBlog: (slug: string) =>
    api.get<ApiResponse<Blog>>(ENDPOINTS.content.blogDetail(slug)),

  getFaqs: () =>
    api.get<ApiResponse<Record<string, FAQ[]>>>(ENDPOINTS.content.faqs),
};

// ── AI Assistant ──────────────────────────────────────────────────
export const aiApi = {
  searchMedicine: (query: string) =>
    api.post(ENDPOINTS.ai.search, { query }),

  getHealthInfo: (question: string, conversation_id?: string) =>
    api.post(ENDPOINTS.ai.healthInfo, { question, conversation_id }),

  getRecommendations: (query: string) =>
    api.post(ENDPOINTS.ai.recommend, { query }),
};

// ── Admin ─────────────────────────────────────────────────────────
export const adminApi = {
  getDashboard: () =>
    api.get<ApiResponse<AdminDashboard>>(ENDPOINTS.admin.dashboard),

  getUsers: (params?: Record<string, string>) =>
    api.get<ApiResponse<User[]>>(ENDPOINTS.auth.adminUsers, { params }),

  getAdminOrders: (params?: Record<string, string>) =>
    api.get<ApiResponse<PaginatedResponse<Order>>>(ENDPOINTS.orders.adminList, { params }),

  updateOrderStatus: (orderNumber: string, data: { status: string; note?: string }) =>
    api.patch<ApiResponse<Order>>(ENDPOINTS.orders.adminStatus(orderNumber), data),

  getAdminPrescriptions: (params?: Record<string, string>) =>
    api.get<ApiResponse<PaginatedResponse<Prescription>>>(ENDPOINTS.prescriptions.adminList, { params }),
};
