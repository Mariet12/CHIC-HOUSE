"use client";

import React, { useEffect, useState } from "react";
import { categoriesApi } from "@/lib/api";
import Link from "next/link";

export default function CategoriesSection() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesApi.getAll();
        if (response.data?.data?.items) {
          setCategories(response.data.data.items);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <div className="container mx-auto px-4 py-12">جاري التحميل...</div>;
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-12 bg-white">
      <h2 className="text-3xl font-bold mb-8 text-primary text-center">الفئات</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?categoryId=${category.id}`}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-smooth text-center border-2 border-secondary-dark hover:border-primary"
          >
            <h3 className="font-bold text-primary">{category.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}

