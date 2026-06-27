"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { productsApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesPage() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["all-categories"],
    queryFn: () => productsApi.getCategories().then((r) => r.data.data),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900">All Categories</h1>
          <p className="text-gray-500 mt-2">Browse medicines and health products by category</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : (categories || []).length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">💊</p>
            <h3 className="text-lg font-semibold text-gray-700">No categories yet</h3>
            <p className="text-gray-500 text-sm mt-2">
              Categories will appear here once added by the admin
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {(categories || []).map((cat, i) => {
              const colors = [
                "from-sky-400 to-sky-600",
                "from-teal-400 to-teal-600",
                "from-green-400 to-green-600",
                "from-violet-400 to-violet-600",
                "from-orange-400 to-orange-600",
                "from-pink-400 to-pink-600",
              ];
              return (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="group flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border hover:shadow-md transition-all"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center text-2xl shadow-sm`}>
                    {cat.icon || "💊"}
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-center leading-tight">
                    {cat.name}
                  </span>
                  {cat.children && cat.children.length > 0 && (
                    <span className="text-xs text-gray-400">{cat.children.length} sub-categories</span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}