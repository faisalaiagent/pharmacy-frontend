"use client";
// src/components/layout/Navbar.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Search, Menu, X, Bell, User, LogOut, Heart, Package, FileText, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { authApi } from "@/lib/api";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";

export function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, clearAuth, refreshToken } = useAuthStore() as {
    user: import("@/types").User | null;
    isAuthenticated: boolean;
    clearAuth: () => void;
    refreshToken: string | null;
  };
  const { cart, toggleCart } = useCartStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {}
    clearAuth();
    toast.success("Logged out successfully.");
    router.push("/");
  };

  const cartCount = cart?.total_items || 0;

  const navLinks = [
    { href: "/shop", label: "Shop" },
    { href: "/categories", label: "Categories" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled
          ? "bg-white shadow-md border-b border-gray-100"
          : "bg-white border-b border-gray-100"
      }`}
    >
      {/* Top bar */}
      <div className="bg-sky-500 text-white text-xs py-1.5 text-center">
        Free delivery on orders over $50 • Prescription medicines require valid prescription
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Rx</span>
            </div>
            <span className="font-bold text-gray-900 text-lg hidden sm:block">
              PharmaCare
            </span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search medicines, health products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 h-10 rounded-full border-gray-200 focus:border-sky-400 focus:ring-sky-400 w-full"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={toggleCart}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-sky-500">
                  {cartCount > 99 ? "99+" : cartCount}
                </Badge>
              )}
            </Button>

            {/* Auth */}
            {isAuthenticated && user ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/dashboard/notifications">
                    <Bell className="w-5 h-5" />
                  </Link>
                </Button>

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-sky-100 text-sky-700 text-xs">
                          {getInitials(`${user.first_name} ${user.last_name}`)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">
                        {user.first_name || user.username}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    {user.role === "ADMIN" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2">
                        <User className="w-4 h-4" /> My Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/orders" className="flex items-center gap-2">
                        <Package className="w-4 h-4" /> My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/wishlist" className="flex items-center gap-2">
                        <Heart className="w-4 h-4" /> Wishlist
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/prescriptions" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Prescriptions
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600 focus:text-red-600 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Log In</Link>
                </Button>
                <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white" asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="flex flex-col gap-6 pt-4">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                    <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">Rx</span>
                    </div>
                    <span className="font-bold text-gray-900 text-lg">PharmaCare</span>
                  </Link>

                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search medicines..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </form>

                  <nav className="flex flex-col gap-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>

                  {!isAuthenticated && (
                    <div className="flex flex-col gap-2">
                      <Button asChild>
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/register" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-6 pb-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-600 hover:text-sky-600 font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/ai-assistant"
            className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
          >
            ✨ AI Health Assistant
          </Link>
        </nav>
      </div>
    </header>
  );
}
