"use client";
// src/app/page.tsx — Homepage
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Truck, Clock, Award, Search, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/products/ProductCard";
import { CategoryCard } from "@/components/home/CategoryCard";
import { productsApi } from "@/lib/api";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function HomePage() {
  const { data: featured, isLoading: featuredLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => productsApi.getFeatured().then((r) => r.data.data),
  });

  const { data: bestSellers, isLoading: bsLoading } = useQuery({
    queryKey: ["best-sellers"],
    queryFn: () => productsApi.getBestSellers().then((r) => r.data.data),
  });

  const { data: categories, isLoading: catsLoading } = useQuery({
    queryKey: ["featured-categories"],
    queryFn: () => productsApi.getFeaturedCategories().then((r) => r.data.data),
  });

  const { data: recent } = useQuery({
    queryKey: ["recent-products"],
    queryFn: () => productsApi.getRecent().then((r) => r.data.data),
  });

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ─────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-sky-600 via-sky-500 to-teal-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-300 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                🏥 Licensed Online Pharmacy
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Your Health,
                <br />
                <span className="text-teal-200">Our Priority</span>
              </h1>
              <p className="text-lg text-sky-100 max-w-md leading-relaxed">
                Genuine medicines, expert pharmacists, and AI-powered health guidance
                — delivered to your door with care.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="bg-white text-sky-600 hover:bg-sky-50 font-semibold"
                  asChild
                >
                  <Link href="/shop">
                    Shop Now <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/50 text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="/ai-assistant">
                    <Sparkles className="mr-2 w-4 h-4" />
                    AI Assistant
                  </Link>
                </Button>
              </div>
              <div className="flex items-center gap-6 text-sm text-sky-100">
                <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> Verified Medicines</span>
                <span className="flex items-center gap-1"><Truck className="w-4 h-4" /> Fast Delivery</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 24/7 Support</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden md:block"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 space-y-4">
                <p className="text-sm font-medium text-sky-100">Quick Search</p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search medicines, brands..."
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-white text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = (e.target as HTMLInputElement).value;
                        if (val) window.location.href = `/shop?search=${encodeURIComponent(val)}`;
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Paracetamol", "Vitamins", "Antibiotics", "Cough Syrup", "Blood Pressure"].map((term) => (
                    <Link
                      key={term}
                      href={`/shop?search=${encodeURIComponent(term)}`}
                      className="text-xs bg-white/20 hover:bg-white/30 text-white rounded-full px-3 py-1 transition-colors"
                    >
                      {term}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Trust Features ────────────────────────────────────────── */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Shield, title: "100% Genuine", desc: "All medicines verified" },
              { icon: Truck, title: "Fast Delivery", desc: "Same day in city" },
              { icon: Award, title: "Licensed", desc: "Certified pharmacists" },
              { icon: Clock, title: "24/7 Support", desc: "Always here to help" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-sky-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Categories ───────────────────────────────────── */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
            <p className="text-gray-500 text-sm mt-1">Find exactly what you need</p>
          </div>
          <Button variant="ghost" asChild className="text-sky-600 hover:text-sky-700">
            <Link href="/categories">
              View All <ChevronRight className="ml-1 w-4 h-4" />
            </Link>
          </Button>
        </div>

        {catsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
          >
            {(categories || []).slice(0, 6).map((cat) => (
              <motion.div key={cat.id} variants={fadeUp}>
                <CategoryCard category={cat} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* ── Featured Products ─────────────────────────────────────── */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Medicines</h2>
              <p className="text-gray-500 text-sm mt-1">Handpicked by our pharmacists</p>
            </div>
            <Button variant="ghost" asChild className="text-sky-600 hover:text-sky-700">
              <Link href="/shop?is_featured=true">
                View All <ChevronRight className="ml-1 w-4 h-4" />
              </Link>
            </Button>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : (
            <motion.div
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            >
              {(featured || []).slice(0, 10).map((product) => (
                <motion.div key={product.id} variants={fadeUp}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── AI Health Assistant Banner ────────────────────────────── */}
      <section className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-teal-500 to-sky-600 rounded-2xl p-8 md:p-12 text-white overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Sparkles className="w-6 h-6 text-teal-200" />
                <Badge className="bg-white/20 text-white border-white/30">
                  AI-Powered
                </Badge>
              </div>
              <h2 className="text-3xl font-bold">Not sure what medicine you need?</h2>
              <p className="text-teal-100 max-w-md">
                Our AI health assistant can help you find the right medicines,
                explain side effects, and answer your health questions — instantly.
              </p>
              <p className="text-xs text-teal-200">
                ⚕️ Always consult a licensed doctor for medical decisions.
              </p>
            </div>
            <Button
              size="lg"
              className="bg-white text-teal-600 hover:bg-teal-50 font-semibold shrink-0"
              asChild
            >
              <Link href="/ai-assistant">
                Try AI Assistant <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ── Best Sellers ──────────────────────────────────────────── */}
      {(bestSellers?.length || 0) > 0 && (
        <section className="bg-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Best Sellers</h2>
                <p className="text-gray-500 text-sm mt-1">Most trusted by our customers</p>
              </div>
              <Button variant="ghost" asChild className="text-sky-600 hover:text-sky-700">
                <Link href="/shop?is_best_seller=true">
                  View All <ChevronRight className="ml-1 w-4 h-4" />
                </Link>
              </Button>
            </div>
            <motion.div
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            >
              {(bestSellers || []).slice(0, 10).map((product) => (
                <motion.div key={product.id} variants={fadeUp}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Recently Added ────────────────────────────────────────── */}
      {(recent?.length || 0) > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recently Added</h2>
              <p className="text-gray-500 text-sm mt-1">New arrivals in our catalog</p>
            </div>
            <Button variant="ghost" asChild className="text-sky-600 hover:text-sky-700">
              <Link href="/shop?ordering=-created_at">
                View All <ChevronRight className="ml-1 w-4 h-4" />
              </Link>
            </Button>
          </div>
          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {(recent || []).slice(0, 10).map((product) => (
              <motion.div key={product.id} variants={fadeUp}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}
    </div>
  );
}
