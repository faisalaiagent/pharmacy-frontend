"use client";
// src/app/checkout/success/page.tsx
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle className="w-10 h-10 text-green-500" />
      </motion.div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
      <p className="text-gray-500 mb-4">
        Thank you for your order. We&apos;ll process it right away.
      </p>

      {orderNumber && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-500">Order Number</p>
          <p className="font-bold text-lg text-sky-600 font-mono mt-0.5">
            {orderNumber}
          </p>
        </div>
      )}

      <div className="space-y-2 text-sm text-gray-500 mb-6">
        <p>✅ Order confirmation sent</p>
        <p>✅ Our team will process your order shortly</p>
        <p>✅ You&apos;ll receive delivery updates via notifications</p>
      </div>

      <div className="flex flex-col gap-2">
        <Button asChild className="bg-sky-500 hover:bg-sky-600 text-white">
          <Link href="/dashboard/orders">
            <Package className="w-4 h-4 mr-2" />
            Track My Order
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/shop">
            Continue Shopping <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/">
            <Home className="w-4 h-4 mr-2" /> Back to Home
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6 animate-pulse" />
            <div className="h-6 bg-gray-100 rounded mx-auto w-48 animate-pulse" />
          </div>
        }
      >
        <OrderSuccessContent />
      </Suspense>
    </div>
  );
}