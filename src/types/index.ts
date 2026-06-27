// src/types/index.ts
// Shared TypeScript interfaces matching Django model serializers exactly.

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  date_of_birth: string | null;
  avatar: string;
  role: "CUSTOMER" | "PHARMACIST" | "ADMIN";
  email_verified: boolean;
  phone_verified: boolean;
  accepts_marketing_emails: boolean;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse extends User, AuthTokens {}

export interface Address {
  id: string;
  address_type: "SHIPPING" | "BILLING" | "BOTH";
  full_name: string;
  phone_number: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  delivery_instructions: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  parent: string | null;
  is_featured: boolean;
  display_order: number;
  children: Category[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
}

export interface Manufacturer {
  id: string;
  name: string;
  slug: string;
  country: string;
  logo: string;
  website: string;
}

export interface ProductImage {
  id: string;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  display_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  product_type: "MEDICINE" | "HEALTH_PRODUCT" | "MEDICAL_DEVICE" | "SUPPLEMENT";
  generic_name: string;
  strength: string;
  dosage_form: string;
  brand_name: string;
  brand: Brand | null;
  manufacturer: Manufacturer | null;
  categories: Category[];
  images: ProductImage[];
  primary_image: string | null;
  short_description: string;
  description: string;
  ingredients: string;
  usage_instructions: string;
  dosage_information: string;
  side_effects: string;
  precautions: string;
  contraindications: string;
  storage_instructions: string;
  requires_prescription: boolean;
  is_controlled_substance: boolean;
  price: string;
  discount_price: string | null;
  final_price: string;
  discount_percentage: number;
  tax_rate: string;
  stock_status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "DISCONTINUED";
  stock_quantity: number;
  average_rating: string;
  review_count: number;
  is_featured: boolean;
  is_best_seller: boolean;
  expiry_date: string | null;
  meta_title: string;
  meta_description: string;
  created_at: string;
}

export interface Review {
  id: string;
  user_name: string;
  user_avatar: string;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  line_total: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  total_items: number;
}

export interface WishlistItem {
  id: string;
  product: Product;
  created_at: string;
}

export interface OrderItem {
  id: string;
  product: string;
  product_name_snapshot: string;
  product_sku_snapshot: string;
  unit_price: string;
  quantity: number;
  line_total: string;
  required_prescription: boolean;
}

export interface OrderStatusHistory {
  status: string;
  note: string;
  changed_by_name: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  items: OrderItem[];
  status_history: OrderStatusHistory[];
  shipping_address: Address | null;
  shipping_address_snapshot: Record<string, string>;
  subtotal: string;
  discount_amount: string;
  tax_amount: string;
  shipping_amount: string;
  total_amount: string;
  coupon_code: string;
  requires_prescription_verification: boolean;
  tracking_number: string;
  courier_name: string;
  estimated_delivery_date: string | null;
  customer_notes: string;
  created_at: string;
}

export interface Prescription {
  id: string;
  uploaded_by: string;
  file_url: string;
  file_type: "IMAGE" | "PDF";
  file_size_bytes: number;
  patient_name: string;
  doctor_name: string;
  issued_date: string | null;
  customer_notes: string;
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "EXPIRED";
  assigned_pharmacist: string | null;
  valid_until: string | null;
  items: PrescriptionItem[];
  reviews: PrescriptionReview[];
  created_at: string;
}

export interface PrescriptionItem {
  id: string;
  product: string | null;
  medicine_name: string;
  dosage: string;
  quantity: number;
  instructions: string;
}

export interface PrescriptionReview {
  id: string;
  pharmacist_name: string;
  decision: "APPROVED" | "REJECTED" | "NEEDS_CLARIFICATION";
  comments: string;
  rejection_reason: string;
  created_at: string;
}

export interface Notification {
  id: string;
  notification_type: string;
  channel: string;
  title: string;
  message: string;
  link_url: string;
  is_read: boolean;
  created_at: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  author_name: string;
  category_name: string;
  featured_image: string;
  excerpt: string;
  content: string;
  published_at: string;
  view_count: number;
  tags: string[];
  meta_title: string;
  meta_description: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: "PERCENTAGE" | "FIXED";
  discount_value: string;
  min_order_amount: string;
  is_valid_now: boolean;
}

export interface Pagination {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  page_size: number;
}

export interface PaginatedResponse<T> {
  results: T[];
  pagination: Pagination;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AdminDashboard {
  revenue: { total: number; last_30_days: number };
  orders: {
    total: number;
    pending: number;
    last_7_days: number;
    status_breakdown: { status: string; count: number }[];
  };
  users: { total_customers: number; new_last_30_days: number };
  products: { total_active: number; low_stock: number; out_of_stock: number };
  prescriptions: { pending_review: number; under_review: number };
  top_products: { product_name_snapshot: string; total_sold: number }[];
}
