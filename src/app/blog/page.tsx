"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { contentApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { BookOpen } from "lucide-react";

export default function BlogPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["blogs"],
    queryFn: () => contentApi.getBlogs().then((r) => r.data.data),
  });

  const posts = data?.results || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Health Blog</h1>
          <p className="text-gray-500 mt-2">
            Expert health tips, medicine guides, and wellness advice
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">No blog posts yet</h3>
            <p className="text-gray-500 text-sm mt-2">
              Health articles and guides will appear here soon
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <div className="bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-shadow">
                  {post.featured_image ? (
                    <div className="relative h-48">
                      <Image
                        src={post.featured_image}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-sky-100 to-teal-100 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-sky-300" />
                    </div>
                  )}
                  <div className="p-5">
                    {post.category_name && (
                      <Badge className="bg-sky-100 text-sky-700 mb-2 text-xs">
                        {post.category_name}
                      </Badge>
                    )}
                    <h2 className="font-bold text-gray-900 line-clamp-2 mb-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{post.author_name}</span>
                      <span>{post.published_at ? formatDate(post.published_at) : ""}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}