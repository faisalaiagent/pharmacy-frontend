"use client";
// src/components/layout/CartSidebar.tsx
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { cartApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function CartSidebar() {
  const { isOpen, closeCart, setCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => cartApi.getCart().then((r) => r.data.data),
    enabled: isAuthenticated && isOpen,
  });

  useEffect(() => {
    if (data) setCart(data);
  }, [data, setCart]);

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateCartItem(itemId, quantity).then((r) => r.data.data),
    onSuccess: (data) => { setCart(data); queryClient.invalidateQueries({ queryKey: ["cart"] }); },
    onError: () => toast.error("Failed to update cart."),
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: string) =>
      cartApi.removeCartItem(itemId).then((r) => r.data.data),
    onSuccess: (data) => { setCart(data); queryClient.invalidateQueries({ queryKey: ["cart"] }); },
    onError: () => toast.error("Failed to remove item."),
  });

  const cart = data;
  const items = cart?.items || [];

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col p-0">
        <SheetHeader className="px-4 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-sky-500" />
            Shopping Cart
            {items.length > 0 && (
              <span className="ml-auto text-sm font-normal text-gray-500">
                {cart?.total_items} item{cart?.total_items !== 1 ? "s" : ""}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-300" />
            <div>
              <p className="font-medium text-gray-700">Sign in to view your cart</p>
              <p className="text-sm text-gray-500 mt-1">Your items will be saved for later</p>
            </div>
            <Button asChild onClick={closeCart}>
              <Link href="/login">Log In</Link>
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-300" />
            <div>
              <p className="font-medium text-gray-700">Your cart is empty</p>
              <p className="text-sm text-gray-500 mt-1">Add medicines and health products</p>
            </div>
            <Button asChild onClick={closeCart}>
              <Link href="/shop">Browse Shop</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {item.product.primary_image ? (
                        <Image
                          src={item.product.primary_image}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-1">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.product.slug}`}
                        onClick={closeCart}
                        className="text-sm font-medium text-gray-800 hover:text-sky-600 line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      {item.product.strength && (
                        <p className="text-xs text-gray-500">{item.product.strength}</p>
                      )}
                      <p className="text-sm font-semibold text-sky-600 mt-1">
                        {formatPrice(item.product.final_price)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-6 h-6"
                          onClick={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                          disabled={item.quantity <= 1 || updateMutation.isPending}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-6 h-6"
                          onClick={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                          disabled={updateMutation.isPending}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 text-red-500 hover:text-red-600 ml-auto"
                          onClick={() => removeMutation.mutate(item.id)}
                          disabled={removeMutation.isPending}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-lg">{formatPrice(cart?.subtotal || 0)}</span>
              </div>
              <p className="text-xs text-gray-400">Shipping and taxes calculated at checkout</p>
              <Button
                className="w-full bg-sky-500 hover:bg-sky-600 text-white"
                asChild
                onClick={closeCart}
              >
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
              <Button variant="outline" className="w-full" onClick={closeCart} asChild>
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
