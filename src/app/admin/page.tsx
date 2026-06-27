"use client";
// src/app/admin/page.tsx
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp, ShoppingBag, Users, Package,
  FileText, AlertTriangle, ArrowUp, Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminApi.getDashboard().then((r) => r.data.data),
    refetchInterval: 60000, // refresh every minute
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  const d = data;

  const statCards = [
    {
      label: "Total Revenue",
      value: formatPrice(d?.revenue.total || 0),
      sub: `${formatPrice(d?.revenue.last_30_days || 0)} last 30 days`,
      icon: TrendingUp,
      color: "text-green-400 bg-green-400/10",
    },
    {
      label: "Total Orders",
      value: d?.orders.total || 0,
      sub: `${d?.orders.last_7_days || 0} this week`,
      icon: ShoppingBag,
      color: "text-sky-400 bg-sky-400/10",
    },
    {
      label: "Customers",
      value: d?.users.total_customers || 0,
      sub: `+${d?.users.new_last_30_days || 0} this month`,
      icon: Users,
      color: "text-violet-400 bg-violet-400/10",
    },
    {
      label: "Active Products",
      value: d?.products.total_active || 0,
      sub: `${d?.products.low_stock || 0} low stock`,
      icon: Package,
      color: "text-teal-400 bg-teal-400/10",
    },
  ];

  const alertCards = [
    {
      label: "Pending Orders",
      value: d?.orders.pending || 0,
      icon: Clock,
      color: "text-yellow-400",
      href: "/admin/orders?status=PENDING",
    },
    {
      label: "Prescriptions Pending",
      value: d?.prescriptions.pending_review || 0,
      icon: FileText,
      color: "text-orange-400",
      href: "/admin/prescriptions",
    },
    {
      label: "Out of Stock",
      value: d?.products.out_of_stock || 0,
      icon: AlertTriangle,
      color: "text-red-400",
      href: "/admin/products?stock_status=OUT_OF_STOCK",
    },
    {
      label: "Under Review",
      value: d?.prescriptions.under_review || 0,
      icon: FileText,
      color: "text-blue-400",
      href: "/admin/prescriptions?status=UNDER_REVIEW",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Dashboard Overview</h2>
        <p className="text-gray-400 text-sm">Live metrics from your pharmacy platform</p>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, sub, icon: Icon, color }) => (
          <Card key={label} className="bg-gray-900 border-gray-800">
            <CardContent className="p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-sm text-gray-400 mt-0.5">{label}</p>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <ArrowUp className="w-3 h-3 text-green-400" />
                {sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert cards */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
          Needs Attention
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {alertCards.map(({ label, value, icon: Icon, color, href }) => (
            <a key={label} href={href}>
              <Card className="bg-gray-900 border-gray-800 hover:border-gray-600 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <Icon className={`w-8 h-8 ${color}`} />
                  <div>
                    <p className="text-xl font-bold text-white">{value}</p>
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>

      {/* Order status breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">Order Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(d?.orders.status_breakdown || []).map(({ status, count }) => {
                const total = d?.orders.total || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{status.replace(/_/g, " ")}</span>
                      <span className="text-gray-400">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top products */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            {(d?.top_products || []).length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No sales data yet</p>
            ) : (
              <div className="space-y-3">
                {(d?.top_products || []).map(({ product_name_snapshot, total_sold }, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs text-gray-400 font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm text-gray-300 truncate">
                      {product_name_snapshot}
                    </span>
                    <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30">
                      {total_sold} sold
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
