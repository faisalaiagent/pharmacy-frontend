"use client";
// src/app/admin/prescriptions/page.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Eye, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/api";
import { formatDate, getPrescriptionStatusColor } from "@/lib/utils";
import { Prescription } from "@/types";

export default function AdminPrescriptionsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Prescription | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-prescriptions", page, statusFilter],
    queryFn: () =>
      adminApi.getAdminPrescriptions({
        page: String(page),
        ...(statusFilter && { status: statusFilter }),
      }).then((r) => r.data.data),
  });

  const prescriptions = data?.results || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-52 bg-gray-900 border-gray-700 text-white">
            <Filter className="w-4 h-4 mr-2 text-gray-400" />
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            {["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "EXPIRED"].map((s) => (
              <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-gray-400 text-sm">{pagination?.count || 0} total</span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg bg-gray-800" />
          ))}
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          No prescriptions found
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800">
              <tr>
                {["ID", "Customer", "Doctor", "Type", "Status", "Submitted", "Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-400 font-medium text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {prescriptions.map((rx) => (
                <tr key={rx.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-sky-400 text-xs">{rx.id.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-gray-300 text-xs">{rx.uploaded_by}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{rx.doctor_name || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">{rx.file_type}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`text-xs ${getPrescriptionStatusColor(rx.status)}`}>
                      {rx.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(rx.created_at)}</td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs border-gray-700 text-gray-300 hover:bg-gray-800 h-7 flex items-center gap-1"
                      onClick={() => setSelected(rx)}
                    >
                      <Eye className="w-3 h-3" /> View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" className="border-gray-700 text-gray-300"
            onClick={() => setPage((p) => p - 1)} disabled={page === 1}>Previous</Button>
          <span className="text-sm text-gray-400">Page {page} of {pagination.total_pages}</span>
          <Button variant="outline" size="sm" className="border-gray-700 text-gray-300"
            onClick={() => setPage((p) => p + 1)} disabled={page === pagination.total_pages}>Next</Button>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 mt-2 text-sm">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Customer", value: selected.uploaded_by },
                  { label: "Patient Name", value: selected.patient_name || "—" },
                  { label: "Doctor", value: selected.doctor_name || "—" },
                  { label: "Issued Date", value: selected.issued_date ? formatDate(selected.issued_date) : "—" },
                  { label: "File Type", value: selected.file_type },
                  { label: "Status", value: selected.status },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                    <p className="text-gray-200 font-medium">{value}</p>
                  </div>
                ))}
              </div>
              {selected.customer_notes && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Customer Notes</p>
                  <p className="text-gray-300 bg-gray-800 rounded-lg p-3 text-xs">{selected.customer_notes}</p>
                </div>
              )}
              {selected.file_url && (
                <a
                  href={selected.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sky-400 hover:text-sky-300 text-sm"
                >
                  <FileText className="w-4 h-4" />
                  View Prescription File
                </a>
              )}
              {selected.reviews.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Review History</p>
                  <div className="space-y-2">
                    {selected.reviews.map((review) => (
                      <div key={review.id} className="bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400">{review.pharmacist_name}</span>
                          <Badge className={`text-xs ${getPrescriptionStatusColor(review.decision)}`}>
                            {review.decision.replace("_", " ")}
                          </Badge>
                        </div>
                        {review.comments && <p className="text-xs text-gray-300">{review.comments}</p>}
                        {review.rejection_reason && <p className="text-xs text-red-400 mt-1">Reason: {review.rejection_reason}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
