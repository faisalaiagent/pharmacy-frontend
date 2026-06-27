import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: string | number): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(num);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function getStockStatusColor(status: string): string {
  switch (status) {
    case "IN_STOCK": return "text-green-600 bg-green-50";
    case "LOW_STOCK": return "text-yellow-600 bg-yellow-50";
    case "OUT_OF_STOCK": return "text-red-600 bg-red-50";
    case "DISCONTINUED": return "text-gray-600 bg-gray-50";
    default: return "text-gray-600 bg-gray-50";
  }
}

export function getOrderStatusColor(status: string): string {
  switch (status) {
    case "DELIVERED": return "text-green-700 bg-green-100";
    case "SHIPPED":
    case "OUT_FOR_DELIVERY": return "text-blue-700 bg-blue-100";
    case "CONFIRMED":
    case "PROCESSING": return "text-sky-700 bg-sky-100";
    case "PENDING":
    case "AWAITING_PRESCRIPTION": return "text-yellow-700 bg-yellow-100";
    case "CANCELLED": return "text-red-700 bg-red-100";
    case "REFUNDED":
    case "RETURNED": return "text-purple-700 bg-purple-100";
    default: return "text-gray-700 bg-gray-100";
  }
}

export function getPrescriptionStatusColor(status: string): string {
  switch (status) {
    case "APPROVED": return "text-green-700 bg-green-100";
    case "PENDING": return "text-yellow-700 bg-yellow-100";
    case "UNDER_REVIEW": return "text-blue-700 bg-blue-100";
    case "REJECTED": return "text-red-700 bg-red-100";
    case "EXPIRED": return "text-gray-700 bg-gray-100";
    default: return "text-gray-700 bg-gray-100";
  }
}

export function getInitials(name: string): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function buildQueryString(
  params: Record<string, string | number | boolean | undefined>
): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      query.append(key, String(value));
    }
  });
  return query.toString();
}