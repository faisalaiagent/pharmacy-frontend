"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/products/ProductCard";
import { productsApi } from "@/lib/api";

function ShopContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [inStock, setInStock] = useState(searchParams.get("in_stock") || "");
  const [rxOnly, setRxOnly] = useState(searchParams.get("requires_prescription") || "");
  const [ordering, setOrdering] = useState(searchParams.get("ordering") || "-created_at");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const queryParams = {
    ...(search && { search }),
    ...(category && { category }),
    ...(minPrice && { min_price: minPrice }),
    ...(maxPrice && { max_price: maxPrice }),
    ...(inStock && { in_stock: inStock }),
    ...(rxOnly && { requires_prescription: rxOnly }),
    ordering,
    page,
    page_size: 20,
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["products", queryParams],
    queryFn: () => productsApi.getProducts(queryParams).then((r) => r.data.data),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productsApi.getCategories().then((r) => r.data.data),
  });

  useEffect(() => { setPage(1); }, [search, category, minPrice, maxPrice, inStock, rxOnly, ordering]);

  const activeFiltersCount = [category, minPrice, maxPrice, inStock, rxOnly].filter(Boolean).length;
  const clearFilters = () => { setCategory(""); setMinPrice(""); setMaxPrice(""); setInStock(""); setRxOnly(""); };
  const products = data?.results || [];
  const pagination = data?.pagination;

  const FilterPanel = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">Category</h3>
        <div className="space-y-1.5">
          <button onClick={() => setCategory("")}
            className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${!category ? "bg-sky-50 text-sky-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
            All Categories
          </button>
          {(categories || []).map((cat) => (
            <button key={cat.id} onClick={() => setCategory(cat.slug)}
              className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${category === cat.slug ? "bg-sky-50 text-sky-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>
      <Separator />
      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">Price Range</h3>
        <div className="flex gap-2 items-center">
          <Input placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="h-8 text-sm" type="number" />
          <span className="text-gray-400 text-sm">—</span>
          <Input placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="h-8 text-sm" type="number" />
        </div>
      </div>
      <Separator />
      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">Availability</h3>
        <div className="space-y-2">
          {[{ label: "All Products", value: "" }, { label: "In Stock Only", value: "true" }].map((opt) => (
            <label key={opt.label} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="stock" checked={inStock === opt.value} onChange={() => setInStock(opt.value)} className="accent-sky-500" />
              <span className="text-sm text-gray-600">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
      <Separator />
      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-3">Prescription</h3>
        <div className="space-y-2">
          {[
            { label: "All Medicines", value: "" },
            { label: "OTC Only", value: "false" },
            { label: "Prescription Only", value: "true" },
          ].map((opt) => (
            <label key={opt.label} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="rx" checked={rxOnly === opt.value} onChange={() => setRxOnly(opt.value)} className="accent-sky-500" />
              <span className="text-sm text-gray-600">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
      {activeFiltersCount > 0 && (
        <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
          <X className="w-4 h-4 mr-1" /> Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Medicine Shop</h1>
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search medicines..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={ordering} onValueChange={setOrdering}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-created_at">Newest First</SelectItem>
                <SelectItem value="price">Price: Low to High</SelectItem>
                <SelectItem value="-price">Price: High to Low</SelectItem>
                <SelectItem value="-average_rating">Top Rated</SelectItem>
                <SelectItem value="name">Name A–Z</SelectItem>
              </SelectContent>
            </Select>
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="sm:hidden flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFiltersCount > 0 && <Badge className="bg-sky-500 text-white text-xs w-5 h-5 p-0 flex items-center justify-center">{activeFiltersCount}</Badge>}
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                <div className="mt-4"><FilterPanel /></div>
              </SheetContent>
            </Sheet>
          </div>
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {category && <Badge variant="secondary" className="flex items-center gap-1">{category}<X className="w-3 h-3 cursor-pointer ml-1" onClick={() => setCategory("")} /></Badge>}
              {inStock && <Badge variant="secondary" className="flex items-center gap-1">In Stock<X className="w-3 h-3 cursor-pointer ml-1" onClick={() => setInStock("")} /></Badge>}
              {rxOnly === "false" && <Badge variant="secondary" className="flex items-center gap-1">OTC Only<X className="w-3 h-3 cursor-pointer ml-1" onClick={() => setRxOnly("")} /></Badge>}
              {rxOnly === "true" && <Badge variant="secondary" className="flex items-center gap-1">Prescription Only<X className="w-3 h-3 cursor-pointer ml-1" onClick={() => setRxOnly("")} /></Badge>}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="hidden sm:block w-56 shrink-0">
            <div className="bg-white rounded-xl border p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">Filters</h2>
                {activeFiltersCount > 0 && <Badge className="bg-sky-500 text-white">{activeFiltersCount}</Badge>}
              </div>
              <FilterPanel />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{isLoading ? "Loading..." : `${pagination?.count || 0} products found`}</p>
              {isFetching && !isLoading && <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-700">No products found</h3>
                <p className="text-gray-500 mt-2 text-sm">Try adjusting your search or filters</p>
                <Button variant="outline" onClick={clearFilters} className="mt-4">Clear All Filters</Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
                {pagination && pagination.total_pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                    <span className="text-sm text-gray-500">Page {page} of {pagination.total_pages}</span>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))} disabled={page === pagination.total_pages}>Next</Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}