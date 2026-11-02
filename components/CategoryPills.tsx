"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Category, getCategories } from "@/lib/categories";

export default function CategoryPills() {
  const path = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
      <Link
        href="/"
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
          path === "/" ? "bg-brand text-white border-brand" : "bg-white text-gray-500 border-gray-200 hover:border-brand/40"
        }`}
      >
        🏠 Todo
      </Link>
      {categories.map((cat) => {
        const active = path === `/categoria/${cat.slug}`;
        return (
          <Link
            key={cat.id || cat.slug}
            href={`/categoria/${cat.slug}`}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
              active ? "bg-brand text-white border-brand" : "bg-white text-gray-500 border-gray-200 hover:border-brand/40"
            }`}
          >
            {cat.icon} {cat.label}
          </Link>
        );
      })}
    </div>
  );
}
