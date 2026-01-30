"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { searchApi, categoriesApi } from "@/lib/api";
import ProductCard from "@/components/products/ProductCard";
import Link from "next/link";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(query);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      if (response.data?.data?.items) {
        setCategories(response.data.data.items);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const performSearch = async (q: string, areas?: string[]) => {
    if (!q || !q.trim()) {
      setResults(null);
      return;
    }
    
    setLoading(true);
    try {
      const response = await searchApi.search({ q: q.trim(), areas, page: 1, pageSize: 20 });
      if (response.data?.data) {
        setResults(response.data.data);
      } else {
        setResults(null);
      }
    } catch (error: any) {
      console.error("Error searching:", error);
      setResults(null);
      // Don't show error toast for search - just log it
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  const handleCategoryFilter = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      router.push(`/products?categoryId=${categoryId}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">البحث</h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن هدية أو قطعة ديكور..."
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-light"
          >
            بحث
          </button>
        </div>
      </form>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-primary">تصفية حسب القسم</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryFilter(null)}
              className={`px-4 py-2 rounded-lg transition-smooth ${
                selectedCategory === null
                  ? "bg-primary text-white"
                  : "bg-secondary-light text-primary border border-secondary-dark hover:bg-secondary"
              }`}
            >
              الكل
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryFilter(category.id)}
                className={`px-4 py-2 rounded-lg transition-smooth ${
                  selectedCategory === category.id
                    ? "bg-primary text-white"
                    : "bg-secondary-light text-primary border border-secondary-dark hover:bg-secondary"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">جاري البحث...</div>
      ) : results ? (
        <div>
          {results.products && results.products.items.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">المنتجات</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {results.products.items.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}

          {results.categories && results.categories.items.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">الأقسام</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.categories.items.map((category: any) => (
                  <Link
                    key={category.id}
                    href={`/products?categoryId=${category.id}`}
                    className="bg-secondary-light p-4 rounded-lg shadow-md hover:shadow-lg transition-smooth border border-secondary-dark"
                  >
                    <h3 className="font-bold">{category.name}</h3>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {(!results.products || results.products.items.length === 0) &&
            (!results.categories || results.categories.items.length === 0) && (
              <div className="text-center py-12">
                <p className="text-xl text-primary-dark">لا توجد نتائج</p>
              </div>
            )}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-primary-dark">ابدأ بالبحث عن هدية أو قطعة ديكور</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">جاري التحميل...</div>}>
      <SearchContent />
    </Suspense>
  );
}

