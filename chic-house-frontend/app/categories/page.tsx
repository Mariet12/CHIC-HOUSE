"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { categoriesApi } from "@/lib/api";
import { ClipboardList } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await categoriesApi.getAll("", 1, 100);
        const data = res.data?.data;
        if (data?.items) {
          setCategories(data.items);
        } else if (Array.isArray(data)) {
          setCategories(data);
        }
      } catch (e) {
        setError("تعذر تحميل الأقسام");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-primary text-right">
        جاري التحميل...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 text-right">
      <h1 className="text-3xl font-bold mb-8 text-primary flex items-center gap-2">
        <ClipboardList className="w-8 h-8" />
        الأقسام
      </h1>
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.length === 0 && !error && (
          <p className="col-span-full text-primary-dark">لا توجد أقسام.</p>
        )}
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products${cat.id != null ? `?categoryId=${cat.id}` : ""}`}
            className="bg-white p-6 rounded-xl shadow-sm border border-secondary-dark/50 hover:shadow-md transition-shadow block text-primary"
          >
            <h2 className="font-bold text-lg">{cat.name ?? cat.name_Ar ?? cat.name_En ?? "—"}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
