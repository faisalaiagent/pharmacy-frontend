"use client";
// src/app/admin/orders/page.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/api";
import { formatPrice, formatDate, getOrderStatusColor } from "@/lib/utils";
import { Order } from "@/types";
import { toast } from "sonner";

const ORDER_STATUSES = [
  "PENDING", "AWAITING_PRESCRIPTION", "CONFIRMED", "PROCESSING",
  "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "REFUNDED",
];

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", page, search, statusFilter],
    queryFn: () =>
      adminApi.getAdminOrders({
        page: String(page),
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      }).then((r) => r.data.data),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderNumber, status, note }: { orderNumber: string; status: string; note: string }) =>
      adminApi.updateOrderStatus(orderNumber, { status, note }),
    onSuccess: () => {
      toast.success("Order status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setSelectedOrder(null);
    },
    onError: () => toast.error("Failed to update order status"),
  });

  const orders = data?.results || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by order number or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-gray-900 border-gray-700 text-white">
            <Filter className="w-4 h-4 mr-2 text-gray-400" />
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg bg-gray-800" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No orders found</div>
      ) : (
        <>
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-800">
                <tr>
                  {["Order #", "Customer", "Items", "Total", "Status", "Payment", "Date", "Action"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-sky-400 text-xs">{order.order_number}</td>
                    <td className="px-4 py-3 text-gray-300 text-xs max-w-[120px] truncate">
                      {order.shipping_address_snapshot?.full_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{order.items.length}</td>
                    <td className="px-4 py-3 text-white font-semibold">{formatPrice(order.total_amount)}</td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs ${getOrderStatusColor(order.status)}`}>
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs ${order.payment_status === "PAID" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                        {order.payment_status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-gray-700 text-gray-300 hover:bg-gray-800 h-7"
                        onClick={() => {
                          setSelectedOrder(order);
                          setNewStatus(order.status);
                        }}
                      >
                        Update
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" className="border-gray-700 text-gray-300"
                onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
                Previous
              </Button>
              <span className="text-sm text-gray-400">Page {page} of {pagination.total_pages}</span>
              <Button variant="outline" size="sm" className="border-gray-700 text-gray-300"
                onClick={() => setPage((p) => p + 1)} disabled={page === pagination.total_pages}>
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Update Status Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-gray-400">Order: <span className="text-sky-400 font-mono">{selectedOrder?.order_number}</span></p>
            <div className="space-y-1.5">
              <label className="text-sm text-gray-300">New Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-gray-300">Note (optional)</label>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Add a note for this status change..."
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" className="border-gray-700 text-gray-300" onClick={() => setSelectedOrder(null)}>
                Cancel
              </Button>
              <Button
                className="bg-sky-500 hover:bg-sky-600 text-white"
                onClick={() => {
                  if (selectedOrder) {
                    updateStatusMutation.mutate({
                      orderNumber: selectedOrder.order_number,
                      status: newStatus,
                      note: statusNote,
                    });
                  }
                }}
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
