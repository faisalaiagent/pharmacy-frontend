"use client";
// src/app/dashboard/addresses/page.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

interface AddressForm {
  full_name: string;
  phone_number: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

const emptyForm: AddressForm = {
  full_name: "",
  phone_number: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state_province: "",
  postal_code: "",
  country: "Pakistan",
  is_default: false,
};

export default function AddressesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressForm>(emptyForm);

  const { data: addresses, isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => authApi.getAddresses().then((r) => r.data.data),
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      editingId
        ? authApi.updateAddress(editingId, form)
        : authApi.addAddress(form),
    onSuccess: () => {
      toast.success(editingId ? "Address updated" : "Address added");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to save address");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => authApi.deleteAddress(id),
    onSuccess: () => {
      toast.success("Address removed");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: () => toast.error("Failed to remove address"),
  });

  const openAddDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (addr: AddressForm & { id: string }) => {
    setEditingId(addr.id);
    setForm({
      full_name: addr.full_name,
      phone_number: addr.phone_number,
      address_line_1: addr.address_line_1,
      address_line_2: addr.address_line_2 || "",
      city: addr.city,
      state_province: addr.state_province,
      postal_code: addr.postal_code,
      country: addr.country,
      is_default: addr.is_default,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.phone_number || !form.address_line_1 || !form.city) {
      toast.error("Please fill in all required fields");
      return;
    }
    saveMutation.mutate();
  };

  const list = addresses || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">My Addresses</h1>
        <Button className="bg-sky-500 hover:bg-sky-600 text-white" onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Address
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700">No addresses saved</h3>
          <p className="text-gray-500 text-sm mt-1">
            Add a delivery address to speed up checkout
          </p>
          <Button className="mt-4 bg-sky-500 hover:bg-sky-600 text-white" onClick={openAddDialog}>
            Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {list.map((addr) => (
            <div key={addr.id} className="bg-white rounded-xl border p-4 relative">
              {addr.is_default && (
                <Badge className="absolute top-3 right-3 bg-sky-100 text-sky-700 flex items-center gap-1 text-xs">
                  <Star className="w-3 h-3 fill-current" /> Default
                </Badge>
              )}
              <p className="font-semibold text-gray-800">{addr.full_name}</p>
              <p className="text-sm text-gray-500 mt-1">{addr.address_line_1}</p>
              {addr.address_line_2 && <p className="text-sm text-gray-500">{addr.address_line_2}</p>}
              <p className="text-sm text-gray-500">
                {addr.city}, {addr.state_province} {addr.postal_code}
              </p>
              <p className="text-sm text-gray-500">{addr.country}</p>
              <p className="text-sm text-gray-400 mt-1">{addr.phone_number}</p>

              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => openEditDialog(addr)}
                >
                  <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-500 border-red-200 hover:bg-red-50"
                  onClick={() => deleteMutation.mutate(addr.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Address" : "Add New Address"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Full Name *</label>
                <input
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Phone Number *</label>
                <input
                  value={form.phone_number}
                  onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                  placeholder="+92 300 1234567"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Address Line 1 *</label>
              <input
                value={form.address_line_1}
                onChange={(e) => setForm({ ...form, address_line_1: e.target.value })}
                placeholder="House / Street / Area"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Address Line 2</label>
              <input
                value={form.address_line_2}
                onChange={(e) => setForm({ ...form, address_line_2: e.target.value })}
                placeholder="Apartment, landmark (optional)"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">City *</label>
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Karachi"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">State / Province</label>
                <input
                  value={form.state_province}
                  onChange={(e) => setForm({ ...form, state_province: e.target.value })}
                  placeholder="Sindh"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Postal Code</label>
                <input
                  value={form.postal_code}
                  onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                  placeholder="75500"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Country</label>
                <input
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                className="accent-sky-500"
              />
              <span className="text-sm text-gray-600">Set as default delivery address</span>
            </label>

            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-sky-500 hover:bg-sky-600 text-white"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? "Saving..." : editingId ? "Update Address" : "Save Address"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
