"use client";
// src/components/products/ProductCard.tsx
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Star, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { cartApi } from "@/lib/api";
import { formatPrice, getStockStatusColor, cn } from "@/lib/utils";
import { Product } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { isAuthenticated } = useAuthStore();
  const { setCart, openCart } = useCartStore();
  const queryClient = useQueryClient();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const addToCartMutation = useMutation({
    mutationFn: () => cartApi.addToCart(product.id, 1).then((r) => r.data.data),
    onSuccess: (data) => {
      setCart(data);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success(`${product.name} added to cart`);
      openCart();
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg || "Failed to add to cart");
    },
  });

  const wishlistMutation = useMutation({
    mutationFn: () =>
      isWishlisted
        ? cartApi.removeFromWishlist(product.id)
        : cartApi.addToWishlist(product.id),
    onSuccess: () => {
      setIsWishlisted((prev) => !prev);
      toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please log in to add items to cart");
      return;
    }
    if (product.stock_status === "OUT_OF_STOCK") {
      toast.error("This product is out of stock");
      return;
    }
    addToCartMutation.mutate();
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please log in to save to wishlist");
      return;
    }
    wishlistMutation.mutate();
  };

  const isOutOfStock = product.stock_status === "OUT_OF_STOCK" || product.stock_status === "DISCONTINUED";

  return (
    <div
      className={cn(
        "group relative bg-white rounded-xl border border-gray-100 hover:border-sky-200 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col",
        className
      )}
    >
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="relative block overflow-hidden bg-gray-50">
        <div className="aspect-square">
          {product.primary_image ? (
            <Image
              src={product.primary_image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <div className="text-center">
                <div className="text-4xl mb-1">💊</div>
                <p className="text-xs text-gray-400">No image</p>
              </div>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.discount_percentage > 0 && (
            <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5">
              -{product.discount_percentage}%
            </Badge>
          )}
          {product.is_best_seller && (
            <Badge className="bg-amber-500 text-white text-xs px-1.5 py-0.5">
              Best Seller
            </Badge>
          )}
          {product.requires_prescription && (
            <Badge className="bg-sky-600 text-white text-xs px-1.5 py-0.5 flex items-center gap-0.5">
              <AlertCircle className="w-2.5 h-2.5" /> Rx
            </Badge>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={cn(
            "absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all",
            "opacity-0 group-hover:opacity-100",
            isWishlisted
              ? "bg-red-50 text-red-500"
              : "bg-white/80 text-gray-400 hover:text-red-500"
          )}
        >
          <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
        </button>
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <Link href={`/products/${product.slug}`} className="flex-1">
          {product.brand_name && (
            <p className="text-xs text-gray-400 mb-0.5">{product.brand_name}</p>
          )}
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-sky-600 transition-colors leading-snug">
            {product.name}
          </h3>
          {product.strength && (
            <p className="text-xs text-gray-500 mt-0.5">{product.strength}</p>
          )}
        </Link>

        {/* Rating */}
        {product.review_count > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3 h-3",
                    i < Math.round(parseFloat(product.average_rating))
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-200"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">({product.review_count})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold text-gray-900">
            {formatPrice(product.final_price)}
          </span>
          {product.discount_price && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Stock status */}
        <span className={cn(
          "text-xs px-2 py-0.5 rounded-full w-fit mt-1.5 font-medium",
          getStockStatusColor(product.stock_status)
        )}>
          {product.stock_status.replace("_", " ")}
        </span>

        {/* Add to cart */}
        <Button
          size="sm"
          className={cn(
            "w-full mt-3 text-xs h-8",
            isOutOfStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-sky-500 hover:bg-sky-600 text-white"
          )}
          onClick={handleAddToCart}
          disabled={isOutOfStock || addToCartMutation.isPending}
        >
          {addToCartMutation.isPending ? (
            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
          ) : isOutOfStock ? (
            "Out of Stock"
          ) : (
            <>
              <ShoppingCart className="w-3 h-3 mr-1" />
              {product.requires_prescription ? "View (Rx)" : "Add to Cart"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
