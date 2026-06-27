"use client";
// src/app/checkout/page.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ShoppingBag, MapPin, Tag, CreditCard, Truck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { authApi, cartApi, ordersApi, couponsApi, paymentsApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { toast } from "sonner";

type PaymentMethod = "STRIPE" | "PAYPAL" | "COD";

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { cart } = useCartStore();

  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: string } | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  const { data: addresses } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => authApi.getAddresses().then((r) => r.data.data),
    enabled: isAuthenticated,
  });

  const { data: cartData } = useQuery({
    queryKey: ["cart"],
    queryFn: () => cartApi.getCart().then((r) => r.data.data),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    const defaultAddr = addresses?.find((a) => a.is_default);
    if (defaultAddr) setSelectedAddress(defaultAddr.id);
    else if (addresses?.[0]) setSelectedAddress(addresses[0].id);
  }, [addresses]);

  const validateCouponMutation = useMutation({
    mutationFn: () => couponsApi.validateCoupon(couponCode),
    onSuccess: (res) => {
      const coupon = res.data.data;
      setAppliedCoupon({ code: coupon.code, discount: coupon.discount_value });
      toast.success(`Coupon "${coupon.code}" applied!`);
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Invalid coupon code");
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: () =>
      ordersApi.placeOrder({
        shipping_address_id: selectedAddress,
        payment_method: paymentMethod,
        ...(appliedCoupon && { coupon_code: appliedCoupon.code }),
        ...(notes && { customer_notes: notes }),
      }),
    onSuccess: async (res) => {
      const order = res.data.data;
      if (paymentMethod === "COD") {
        await paymentsApi.confirmCOD(order.order_number);
        router.push(`/checkout/success?order=${order.order_number}`);
      } else {
        router.push(`/checkout/payment?order=${order.order_number}`);
      }
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to place order. Please try again.");
    },
  });

  const items = cartData?.items || [];
  const subtotal = parseFloat(String(cartData?.subtotal || 0));
  const shipping = subtotal > 50 ? 0 : 5;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-sky-500" />
          Checkout
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left — Form */}
          <div className="lg:col-span-2 space-y-5">
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl border p-5">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-sky-500" />
                Delivery Address
              </h2>
              {(addresses || []).length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">No saved addresses</p>
                  <Button asChild size="sm" variant="outline" className="mt-2">
                    <a href="/dashboard/addresses">Add Address</a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {(addresses || []).map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                        selectedAddress === addr.id ? "border-sky-500 bg-sky-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        className="mt-1 accent-sky-500"
                      />
                      <div className="text-sm">
                        <p className="font-medium text-gray-800">{addr.full_name}</p>
                        <p className="text-gray-500">{addr.address_line_1}</p>
                        {addr.address_line_2 && <p className="text-gray-500">{addr.address_line_2}</p>}
                        <p className="text-gray-500">{addr.city}, {addr.state_province} {addr.postal_code}</p>
                        <p className="text-gray-500">{addr.country}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{addr.phone_number}</p>
                        {addr.is_default && (
                          <Badge className="mt-1 text-xs bg-sky-100 text-sky-700">Default</Badge>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl border p-5">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4 text-sky-500" />
                Payment Method
              </h2>
              <div className="space-y-3">
                {[
                  { value: "COD", label: "Cash on Delivery", icon: "💵", desc: "Pay when your order arrives" },
                  { value: "STRIPE", label: "Credit / Debit Card", icon: "💳", desc: "Secure payment via Stripe" },
                  { value: "PAYPAL", label: "PayPal", icon: "🅿️", desc: "Pay with your PayPal account" },
                ].map(({ value, label, icon, desc }) => (
                  <label
                    key={value}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                      paymentMethod === value ? "border-sky-500 bg-sky-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === value}
                      onChange={() => setPaymentMethod(value as PaymentMethod)}
                      className="accent-sky-500"
                    />
                    <span className="text-xl">{icon}</span>
                    <div>
                      <p className="font-medium text-sm text-gray-800">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-2xl border p-5">
              <h2 className="font-semibold text-gray-800 mb-3">Order Notes (optional)</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special delivery instructions?"
                rows={2}
                className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            </div>
          </div>

          {/* Right — Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border p-5 sticky top-24">
              <h2 className="font-semibold text-gray-800 mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 truncate flex-1 mr-2">
                      {item.product.name}
                      <span className="text-gray-400 ml-1">×{item.quantity}</span>
                    </span>
                    <span className="font-medium shrink-0">{formatPrice(item.line_total)}</span>
                  </div>
                ))}
              </div>

              <Separator className="my-3" />

              {/* Coupon */}
              {!appliedCoupon ? (
                <div className="flex gap-2 mb-3">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="h-9 text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => validateCouponMutation.mutate()}
                    disabled={!couponCode || validateCouponMutation.isPending}
                    className="shrink-0 h-9"
                  >
                    <Tag className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between mb-3 p-2 bg-green-50 rounded-lg">
                  <span className="text-sm text-green-700 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    {appliedCoupon.code} applied
                  </span>
                  <button
                    onClick={() => setAppliedCoupon(null)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-600">Free</span> : formatPrice(shipping)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(appliedCoupon.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-gray-900 text-base">
                  <span>Total</span>
                  <span>{formatPrice(subtotal + shipping - (appliedCoupon ? parseFloat(appliedCoupon.discount) : 0))}</span>
                </div>
              </div>

              {shipping === 0 && (
                <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
                  <Truck className="w-3 h-3" /> Free delivery on orders over $50
                </p>
              )}

              <Button
                className="w-full mt-4 bg-sky-500 hover:bg-sky-600 text-white h-11 font-semibold"
                onClick={() => placeOrderMutation.mutate()}
                disabled={!selectedAddress || items.length === 0 || placeOrderMutation.isPending}
              >
                {placeOrderMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  `Place Order · ${formatPrice(subtotal + shipping)}`
                )}
              </Button>

              <p className="text-xs text-center text-gray-400 mt-2">
                🔒 Your payment information is secure
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
