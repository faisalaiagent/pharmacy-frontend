"use client";
// src/app/dashboard/page.tsx
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Package, FileText, Heart, MapPin, ChevronRight, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth.store";
import { ordersApi, prescriptionsApi, cartApi } from "@/lib/api";
import { formatPrice, formatDate, getOrderStatusColor, getPrescriptionStatusColor } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => ordersApi.getOrders({ page_size: 3 }).then((r) => r.data.data),
  });

  const { data: prescriptions, isLoading: rxLoading } = useQuery({
    queryKey: ["my-prescriptions"],
    queryFn: () => prescriptionsApi.getPrescriptions().then((r) => r.data.data),
  });

  const { data: wishlist } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => cartApi.getWishlist().then((r) => r.data.data),
  });

  const stats = [
    { label: "Total Orders", value: orders?.pagination?.count ?? "—", icon: Package, href: "/dashboard/orders", color: "text-sky-600 bg-sky-50" },
    { label: "Prescriptions", value: prescriptions?.pagination?.count ?? "—", icon: FileText, href: "/dashboard/prescriptions", color: "text-teal-600 bg-teal-50" },
    { label: "Wishlist Items", value: Array.isArray(wishlist) ? wishlist.length : "—", icon: Heart, href: "/dashboard/wishlist", color: "text-pink-600 bg-pink-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-sky-500 to-teal-500 text-white rounded-2xl p-6">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.first_name || user?.username}! 👋
        </h1>
        <p className="text-sky-100 mt-1 text-sm">
          Manage your orders, prescriptions, and health products from here.
        </p>
        <Button asChild className="mt-4 bg-white text-sky-600 hover:bg-sky-50" size="sm">
          <Link href="/shop">Browse Shop <ChevronRight className="w-4 h-4 ml-1" /></Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Recent Orders</CardTitle>
          <Link href="/dashboard/orders" className="text-sm text-sky-600 hover:underline flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : (orders?.results || []).length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No orders yet</p>
              <Button asChild size="sm" className="mt-3 bg-sky-500 hover:bg-sky-600 text-white">
                <Link href="/shop">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {(orders?.results || []).map((order) => (
                <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium text-sm text-gray-800">{order.order_number}</p>
                      <p className="text-xs text-gray-500">{formatDate(order.created_at)} · {order.items.length} item(s)</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{formatPrice(order.total_amount)}</span>
                      <Badge className={`text-xs ${getOrderStatusColor(order.status)}`}>
                        {order.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Prescriptions */}
      {(prescriptions?.results || []).some((p) => p.status === "PENDING" || p.status === "UNDER_REVIEW") && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-800 text-sm">Prescriptions Pending Review</p>
              <p className="text-xs text-amber-600 mt-0.5">
                You have prescriptions awaiting pharmacist review.
              </p>
            </div>
            <Button asChild size="sm" variant="outline" className="border-amber-400 text-amber-700 hover:bg-amber-100 shrink-0">
              <Link href="/dashboard/prescriptions">View</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { href: "/prescriptions/upload", label: "Upload Prescription", icon: FileText, color: "bg-sky-500" },
          { href: "/ai-assistant", label: "AI Health Assistant", icon: AlertCircle, color: "bg-teal-500" },
          { href: "/dashboard/addresses", label: "Manage Addresses", icon: MapPin, color: "bg-violet-500" },
          { href: "/shop", label: "Browse Products", icon: Heart, color: "bg-pink-500" },
        ].map(({ href, label, icon: Icon, color }) => (
          <Link key={href} href={href}>
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border hover:shadow-sm transition-shadow">
              <div className={`w-9 h-9 ${color} rounded-lg flex items-center justify-center shrink-0`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
