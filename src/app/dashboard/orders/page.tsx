"use client";
// src/app/dashboard/orders/page.tsx
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Package, ChevronRight, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ordersApi } from "@/lib/api";
import { formatPrice, formatDate, getOrderStatusColor } from "@/lib/utils";

export default function OrdersPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["my-orders", page],
    queryFn: () => ordersApi.getOrders({ page, page_size: 10 }).then((r) => r.data.data),
  });

  const orders = data?.results || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
        <Badge variant="secondary">{pagination?.count || 0} total</Badge>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="font-semibold text-gray-700">No orders yet</h3>
            <p className="text-gray-500 text-sm mt-1">Start shopping to see your orders here</p>
            <Button asChild className="mt-4 bg-sky-500 hover:bg-sky-600 text-white">
              <Link href="/shop">Browse Shop</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-800">{order.order_number}</span>
                        <Badge className={`text-xs ${getOrderStatusColor(order.status)}`}>
                          {order.status.replace(/_/g, " ")}
                        </Badge>
                        {order.requires_prescription_verification && (
                          <Badge variant="outline" className="text-xs text-sky-600 border-sky-300">
                            Rx Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(order.created_at)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {order.items.length} item(s) ·{" "}
                        {order.items.slice(0, 2).map((i) => i.product_name_snapshot).join(", ")}
                        {order.items.length > 2 && ` +${order.items.length - 2} more`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-gray-900">{formatPrice(order.total_amount)}</p>
                      <Badge variant="outline" className={`text-xs mt-1 ${order.payment_status === "PAID" ? "text-green-600 border-green-300" : "text-yellow-600 border-yellow-300"}`}>
                        {order.payment_status}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-gray-400 mt-1 ml-auto" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
                Previous
              </Button>
              <span className="text-sm text-gray-500">Page {page} of {pagination.total_pages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page === pagination.total_pages}>
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
