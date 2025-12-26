"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { favoritesApi, fixImageUrl } from "@/lib/api";
import toast from "react-hot-toast";
import ImageModal from "@/components/common/ImageModal";

interface Product {
  id: number;
  name_Ar: string;
  name_En: string;
  price: number;
  effectivePrice: number;
  hasDiscount: boolean;
  firstImageUrl: string;
  isFavorite: boolean;
  isInCart: boolean;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { token } = useAuth();
  const [isFavorite, setIsFavorite] = useState(product.isFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debug: اطبع بيانات المنتج لمعرفة هيكل الصور
  React.useEffect(() => {
    if (product.id === (product as any).id) {
      console.log(`Product ${product.id} image data:`, {
        firstImageUrl: product.firstImageUrl,
        images: (product as any).images,
        fullProduct: product
      });
    }
  }, [product]);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorite) {
        await favoritesApi.remove(product.id);
        setIsFavorite(false);
        toast.success("تم الحذف من المفضلة");
      } else {
        await favoritesApi.add(product.id);
        setIsFavorite(true);
        toast.success("تمت الإضافة للمفضلة");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    await addToCart(product.id, 1);
  };

  const handleImageClick = (e: React.MouseEvent, imageUrl: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  return (
    <>
      <Link href={`/products/${product.id}`}>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-smooth group border border-secondary-dark/50">
          <div className="relative h-48 sm:h-56 md:h-64 bg-secondary overflow-hidden flex items-center justify-center">
            {(() => {
              const rawImageUrl = product.firstImageUrl || 
                              (product as any).images?.[0]?.imageUrl ||
                              (product as any).images?.[0]?.ImageUrl;
              
              // استخدام دالة fixImageUrl لتصحيح الـ URL
              const imageUrl = fixImageUrl(rawImageUrl);
              
              return imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.name_Ar}
                  className="w-full h-full object-contain group-hover:scale-105 transition-smooth cursor-pointer"
                  onClick={(e) => handleImageClick(e, imageUrl)}
                  onError={(e) => {
                    console.warn(`⚠️ Image not found for product ${product.id}: ${imageUrl}`);
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector(".image-placeholder")) {
                      const placeholder = document.createElement("div");
                      placeholder.className = "image-placeholder w-full h-full flex items-center justify-center text-primary bg-gray-100";
                      placeholder.textContent = "لا توجد صورة";
                      parent.appendChild(placeholder);
                    }
                  }}
                  onLoad={() => {
                    console.log(`✅ Image loaded: Product ${product.id}`);
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary bg-gray-100">
                  لا توجد صورة
                </div>
              );
            })()}
          <button
            onClick={handleFavorite}
            disabled={isLoading}
            className="absolute top-2 left-2 p-2 bg-white rounded-full shadow-md hover:bg-secondary transition-smooth z-10"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? "fill-red-500 text-red-500" : "text-primary"
              }`}
            />
          </button>
          {product.hasDiscount && (
            <span className="absolute top-2 right-2 bg-accent text-white px-2 py-1 rounded text-sm">
              خصم
            </span>
          )}
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="font-bold text-base sm:text-lg mb-2 text-primary line-clamp-2">{product.name_Ar}</h3>
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              {product.hasDiscount ? (
                <>
                  <span className="text-accent font-bold text-lg sm:text-xl">
                    {product.effectivePrice} ج.م
                  </span>
                  <span className="text-gray-400 line-through text-sm sm:text-base">
                    {product.price} ج.م
                  </span>
                </>
              ) : (
                <span className="text-primary font-bold text-lg sm:text-xl">
                  {product.price} ج.م
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            className="w-full bg-primary text-white py-2 sm:py-3 rounded-lg hover:bg-primary-light transition-smooth flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <ShoppingCart className="w-4 h-4" />
            إضافة للسلة
          </button>
        </div>
      </div>
    </Link>

    {/* Image Modal */}
    {selectedImage && (
      <ImageModal
        imageUrl={selectedImage}
        alt={product.name_Ar}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedImage(null);
        }}
      />
    )}
    </>
  );
}

