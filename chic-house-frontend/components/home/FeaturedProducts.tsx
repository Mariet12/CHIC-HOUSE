"use client";

import React, { useEffect, useState } from "react";
import { productsApi } from "@/lib/api";
import ProductCard from "@/components/products/ProductCard";
import Link from "next/link";

interface Product {
  id: number;
  name_Ar?: string;
  name_En?: string;
  Name_Ar?: string;
  Name_En?: string;
  price: number;
  Price?: number;
  effectivePrice: number;
  EffectivePrice?: number;
  hasDiscount: boolean;
  HasDiscount?: boolean;
  firstImageUrl?: string;
  FirstImageUrl?: string;
  isFavorite: boolean;
  IsFavorite?: boolean;
  isInCart: boolean;
  IsInCart?: boolean;
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsApi.getLatest(8);
        const productsData = response.data?.data;
        if (Array.isArray(productsData)) {
          const normalizedProducts = productsData.map((p: any) => ({
            id: p.id || p.Id,
            name_Ar: p.name_Ar || p.Name_Ar || "",
            name_En: p.name_En || p.Name_En || "",
            price: p.price || p.Price || 0,
            effectivePrice: p.effectivePrice || p.EffectivePrice || p.price || p.Price || 0,
            hasDiscount: p.hasDiscount || p.HasDiscount || false,
            firstImageUrl: p.firstImageUrl || p.FirstImageUrl || "",
            isFavorite: p.isFavorite || p.IsFavorite || false,
            isInCart: p.isInCart || p.IsInCart || false,
          }));
          setProducts(normalizedProducts);
        } else {
          setProducts([]);
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="container mx-auto px-4 py-12">جاري التحميل...</div>;
  }

  return (
    <section className="container mx-auto px-4 py-12 bg-white">
      <h2 className="text-3xl font-bold mb-8 text-primary text-center">أحدث الهدايا والديكورات</h2>
      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              // Ensure product has all required fields
              const normalizedProduct = {
                id: product.id,
                name_Ar: product.name_Ar || product.Name_Ar || "",
                name_En: product.name_En || product.Name_En || "",
                price: product.price || product.Price || 0,
                effectivePrice: product.effectivePrice || product.EffectivePrice || product.price || product.Price || 0,
                hasDiscount: product.hasDiscount || product.HasDiscount || false,
                firstImageUrl: product.firstImageUrl || product.FirstImageUrl || "",
                isFavorite: product.isFavorite || product.IsFavorite || false,
                isInCart: product.isInCart || product.IsInCart || false,
              };
              return <ProductCard key={product.id} product={normalizedProduct} />;
            })}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/products"
              className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-light transition-smooth shadow-md"
            >
              عرض جميع المنتجات
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-primary-dark text-lg mb-4">لا توجد منتجات متاحة حالياً</p>
          <Link
            href="/products"
            className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-light transition-smooth shadow-md"
          >
            عرض جميع المنتجات
          </Link>
        </div>
      )}
    </section>
  );
}

