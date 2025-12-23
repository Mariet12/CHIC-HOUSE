"use client";

import React, { useState, useEffect } from "react";
import { favoritesApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/products/ProductCard";
import toast from "react-hot-toast";

export default function FavoritesPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchFavorites();
  }, [token, page]);

  const fetchFavorites = async () => {
    try {
      const response = await favoritesApi.getAll(page, 20);
      if (response.data?.data?.items) {
        setProducts(response.data.data.items);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: number) => {
    try {
      await favoritesApi.remove(productId);
      toast.success("تم الحذف من المفضلة");
      fetchFavorites();
    } catch (error) {
      toast.error("فشل الحذف");
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12">جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">Favorites</h1>
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-primary-dark mb-4">No favorite products</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="relative">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

