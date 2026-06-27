"use client";
// src/app/products/[slug]/page.tsx
import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ShoppingCart, Heart, Star, AlertCircle, Shield, ChevronRight,
  Minus, Plus, Share2, Check, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProductCard } from "@/components/products/ProductCard";
import { productsApi, cartApi } from "@/lib/api";
import { formatPrice, formatDate, getStockStatusColor, getInitials, cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuthStore();
  const { setCart, openCart } = useCartStore();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => productsApi.getProduct(slug).then((r) => r.data.data),
    enabled: !!slug,
  });

  const { data: reviews } = useQuery({
    queryKey: ["reviews", slug],
    queryFn: () => productsApi.getReviews(slug).then((r) => r.data.data),
    enabled: !!slug,
  });

  const { data: related } = useQuery({
    queryKey: ["related", slug],
    queryFn: () => productsApi.getRelated(slug).then((r) => r.data.data),
    enabled: !!slug,
  });

  const addToCartMutation = useMutation({
    mutationFn: () => cartApi.addToCart(product!.id, quantity).then((r) => r.data.data),
    onSuccess: (data) => {
      setCart(data);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success(`${product?.name} added to cart`);
      openCart();
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to add to cart");
    },
  });

  const reviewMutation = useMutation({
    mutationFn: () =>
      productsApi.addReview(slug, { rating: reviewRating, title: reviewTitle, comment: reviewComment }),
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["reviews", slug] });
      setReviewTitle("");
      setReviewComment("");
      setReviewRating(5);
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Failed to submit review");
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-700">Product not found</h2>
        <Button asChild className="mt-4"><Link href="/shop">Back to Shop</Link></Button>
      </div>
    );
  }

  const images = product.images?.length > 0
    ? product.images
    : [{ id: "0", image_url: "", alt_text: product.name, is_primary: true, display_order: 0 }];

  const isOutOfStock = product.stock_status === "OUT_OF_STOCK" || product.stock_status === "DISCONTINUED";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-sky-600">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/shop" className="hover:text-sky-600">Shop</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-800 font-medium line-clamp-1">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 bg-white rounded-2xl p-6 shadow-sm">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50">
              {images[selectedImage]?.image_url ? (
                <Image
                  src={images[selectedImage].image_url}
                  alt={images[selectedImage].alt_text || product.name}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mb-2">💊</div>
                    <p className="text-gray-400 text-sm">No image available</p>
                  </div>
                </div>
              )}
              {product.requires_prescription && (
                <div className="absolute top-3 left-3 bg-sky-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Prescription Required
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      "w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-colors",
                      selectedImage === i ? "border-sky-500" : "border-gray-200 hover:border-sky-300"
                    )}
                  >
                    {img.image_url ? (
                      <Image src={img.image_url} alt={img.alt_text} width={64} height={64} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xl">💊</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="space-y-4">
            {product.brand_name && (
              <p className="text-sm text-sky-600 font-medium">{product.brand_name}</p>
            )}
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

            {(product.generic_name || product.strength) && (
              <p className="text-gray-500 text-sm">
                {[product.generic_name, product.strength, product.dosage_form]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}

            {/* Rating */}
            {product.review_count > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("w-4 h-4", i < Math.round(parseFloat(product.average_rating)) ? "fill-amber-400 text-amber-400" : "text-gray-200")} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">{product.average_rating} ({product.review_count} reviews)</span>
              </div>
            )}

            <Separator />

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.final_price)}
              </span>
              {product.discount_price && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>
                  <Badge className="bg-red-100 text-red-600">
                    Save {product.discount_percentage}%
                  </Badge>
                </>
              )}
            </div>

            {/* Stock */}
            <span className={cn("text-sm px-3 py-1 rounded-full w-fit font-medium", getStockStatusColor(product.stock_status))}>
              {product.stock_status.replace("_", " ")}
            </span>

            {product.requires_prescription && (
              <div className="flex items-start gap-2 p-3 bg-sky-50 rounded-lg text-sm text-sky-700">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <p>This medicine requires a valid prescription. Please upload your prescription before ordering.</p>
              </div>
            )}

            {/* Quantity & Add to cart */}
            {!isOutOfStock && (
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium text-gray-800 border-x">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Button
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white h-10"
                  onClick={() => {
                    if (!isAuthenticated) { toast.error("Please log in to add items to cart"); return; }
                    addToCartMutation.mutate();
                  }}
                  disabled={addToCartMutation.isPending}
                >
                  {addToCartMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart</>
                  )}
                </Button>
              </div>
            )}

            {isOutOfStock && (
              <Button disabled className="w-full h-10 bg-gray-100 text-gray-400">
                Out of Stock
              </Button>
            )}

            {/* SKU */}
            <p className="text-xs text-gray-400">SKU: {product.sku}</p>
          </div>
        </div>

        {/* Tabs: Details, Reviews */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm overflow-hidden">
          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              {[
                { value: "description", label: "Description" },
                { value: "clinical", label: "Clinical Info" },
                { value: "reviews", label: `Reviews (${reviews?.pagination?.count || 0})` },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-sky-500 data-[state=active]:text-sky-600 px-6 py-4"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="description" className="p-6">
              <div className="prose prose-sm max-w-none text-gray-600">
                <p className="whitespace-pre-line">{product.description || product.short_description || "No description available."}</p>
                {product.ingredients && (
                  <><h4 className="font-semibold text-gray-800 mt-4 mb-2">Ingredients</h4>
                  <p className="whitespace-pre-line">{product.ingredients}</p></>
                )}
                {product.storage_instructions && (
                  <><h4 className="font-semibold text-gray-800 mt-4 mb-2">Storage</h4>
                  <p>{product.storage_instructions}</p></>
                )}
              </div>
            </TabsContent>

            <TabsContent value="clinical" className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: "Usage Instructions", content: product.usage_instructions },
                  { title: "Dosage Information", content: product.dosage_information },
                  { title: "Side Effects", content: product.side_effects },
                  { title: "Precautions", content: product.precautions },
                  { title: "Contraindications", content: product.contraindications },
                ].map(({ title, content }) =>
                  content ? (
                    <div key={title}>
                      <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-line">{content}</p>
                    </div>
                  ) : null
                )}
              </div>
              <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                <p className="text-sm text-amber-700 flex items-start gap-2">
                  <Shield className="w-4 h-4 mt-0.5 shrink-0" />
                  ⚕️ Medical Disclaimer: This information is for educational purposes only.
                  Always consult a licensed pharmacist or doctor before taking any medication.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="p-6">
              <div className="space-y-6">
                {/* Write review */}
                {isAuthenticated && (
                  <div className="border rounded-xl p-4 space-y-3">
                    <h3 className="font-semibold text-gray-800">Write a Review</h3>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button key={i} onClick={() => setReviewRating(i + 1)}>
                          <Star className={cn("w-6 h-6 transition-colors", i < reviewRating ? "fill-amber-400 text-amber-400" : "text-gray-300 hover:text-amber-300")} />
                        </button>
                      ))}
                    </div>
                    <input
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="Review title"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                    />
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience..."
                      rows={3}
                      className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-300"
                    />
                    <Button
                      size="sm"
                      className="bg-sky-500 hover:bg-sky-600 text-white"
                      onClick={() => reviewMutation.mutate()}
                      disabled={reviewMutation.isPending}
                    >
                      {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                )}

                {/* Review list */}
                {(reviews?.results || []).length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">No reviews yet. Be the first to review!</p>
                ) : (
                  <div className="space-y-4">
                    {(reviews?.results || []).map((review) => (
                      <div key={review.id} className="flex gap-3 border-b pb-4 last:border-0">
                        <Avatar className="w-9 h-9">
                          <AvatarFallback className="bg-sky-100 text-sky-700 text-xs">
                            {getInitials(review.user_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{review.user_name}</span>
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={cn("w-3 h-3", i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200")} />
                              ))}
                            </div>
                            {review.is_verified_purchase && (
                              <Badge variant="secondary" className="text-xs flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" /> Verified
                              </Badge>
                            )}
                            <span className="text-xs text-gray-400 ml-auto">{formatDate(review.created_at)}</span>
                          </div>
                          {review.title && <p className="font-medium text-sm mt-1">{review.title}</p>}
                          <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related products */}
        {(related?.length || 0) > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {(related || []).slice(0, 5).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
