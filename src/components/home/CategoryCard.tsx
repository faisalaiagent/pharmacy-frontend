"use client";
// src/components/home/CategoryCard.tsx
import Link from "next/link";
import Image from "next/image";
import { Category } from "@/types";
import { cn } from "@/lib/utils";

const categoryColors = [
  "from-sky-400 to-sky-600",
  "from-teal-400 to-teal-600",
  "from-green-400 to-green-600",
  "from-violet-400 to-violet-600",
  "from-orange-400 to-orange-600",
  "from-pink-400 to-pink-600",
];

interface CategoryCardProps {
  category: Category;
  index?: number;
}

export function CategoryCard({ category, index = 0 }: CategoryCardProps) {
  const gradient = categoryColors[index % categoryColors.length];

  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
    >
      <div
        className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden",
          "bg-gradient-to-br shadow-sm group-hover:shadow-md transition-shadow",
          gradient
        )}
      >
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : category.icon ? (
          <span className="text-2xl">{category.icon}</span>
        ) : (
          <span className="text-2xl">💊</span>
        )}
      </div>
      <span className="text-xs font-medium text-gray-700 text-center leading-tight line-clamp-2">
        {category.name}
      </span>
    </Link>
  );
}
