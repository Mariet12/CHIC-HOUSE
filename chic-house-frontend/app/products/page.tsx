"use client";

import React, { useState, useEffect } from "react";
import { productsApi, categoriesApi } from "@/lib/api";
import ProductCard from "@/components/products/ProductCard";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    categoryId: null as number | null,
    search: "",
    priceFrom: "",
    priceTo: "",
    sortBy: "new",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = {
        sortBy: filters.sortBy,
        pageNumber: 1,
        pageSize: 20,
      };
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.search) params.search = filters.search;
      if (filters.priceFrom) params.priceFrom = Number(filters.priceFrom);
      if (filters.priceTo) params.priceTo = Number(filters.priceTo);

      const response = await productsApi.getAll(params);
      if (response.data?.data?.items) {
        setProducts(response.data.data.items);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 bg-brandSand min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-primary text-center">المنتجات</h1>
      
      {/* Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm mb-4 sm:mb-8 border border-secondary-dark/50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="md:col-span-2 lg:col-span-2">
            <input
              type="text"
              placeholder="ابحث عن هدية أو قطعة ديكور..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-right text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={filters.categoryId || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                categoryId: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-right text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">كل الأقسام</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <input
              type="number"
              placeholder="أقل سعر"
              value={filters.priceFrom}
              onChange={(e) =>
                setFilters({ ...filters, priceFrom: e.target.value })
              }
              className="px-2 sm:px-3 py-2 sm:py-3 border rounded-lg text-right text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="number"
              placeholder="أعلى سعر"
              value={filters.priceTo}
              onChange={(e) =>
                setFilters({ ...filters, priceTo: e.target.value })
              }
              className="px-2 sm:px-3 py-2 sm:py-3 border rounded-lg text-right text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-8 sm:py-12 text-base sm:text-lg">جاري التحميل...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-base sm:text-lg text-gray-600">لا توجد منتجات</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

