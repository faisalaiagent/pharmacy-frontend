// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartSidebar } from "@/components/layout/CartSidebar";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "PharmaCare — Your Trusted Online Pharmacy",
    template: "%s | PharmaCare",
  },
  description:
    "Shop genuine medicines, health products, and get AI-powered health guidance from licensed pharmacists. Fast delivery, secure payments.",
  keywords: ["pharmacy", "medicine", "health products", "online pharmacy", "prescription"],
  openGraph: {
    title: "PharmaCare — Your Trusted Online Pharmacy",
    description: "Genuine medicines, licensed pharmacists, AI health assistant.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={`${inter.className} antialiased bg-gray-50 min-h-screen flex flex-col`}>
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartSidebar />
        </Providers>
      </body>
    </html>
  );
}
