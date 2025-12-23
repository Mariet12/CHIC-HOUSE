"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { productsApi, fixImageUrl } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { favoritesApi } from "@/lib/api";
import { Heart, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = Number(params.id);
  const { addToCart } = useCart();
  const { token } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await productsApi.getById(productId);
      if (response.data?.data) {
        setProduct(response.data.data);
        setIsFavorite(response.data.data.isFavorite || false);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!token) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }

    try {
      if (isFavorite) {
        await favoritesApi.remove(productId);
        setIsFavorite(false);
        toast.success("تم الحذف من المفضلة");
      } else {
        await favoritesApi.add(productId);
        setIsFavorite(true);
        toast.success("تمت الإضافة للمفضلة");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleAddToCart = async () => {
    await addToCart(productId, quantity);
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12">جاري التحميل...</div>;
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-12">المنتج غير موجود</div>;
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 bg-secondary-light">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {/* Images */}
        <div className="space-y-3 sm:space-y-4">
          {(() => {
            const rawFirstImageUrl = product.firstImageUrl || 
                                 (product.images && product.images.length > 0 && product.images[0]?.imageUrl) ||
                                 (product.images && product.images.length > 0 && product.images[0]?.ImageUrl);
            
            // استخدام دالة fixImageUrl لتصحيح الـ URL
            const firstImageUrl = fixImageUrl(rawFirstImageUrl);
            
            return firstImageUrl ? (
              <div className="relative w-full h-64 sm:h-80 md:h-96 bg-secondary-light rounded-lg overflow-hidden border border-secondary-dark flex items-center justify-center">
                <img
                  src={firstImageUrl}
                  alt={product.name_Ar}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.warn(`⚠️ Image not found: ${firstImageUrl}`);
                    const target = e.target as HTMLImageElement;
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="h-full flex items-center justify-center text-primary">لا توجد صورة</div>';
                    }
                  }}
                  onLoad={() => {
                    console.log(`✅ Image loaded successfully`);
                  }}
                />
              </div>
            ) : (
              <div className="h-96 bg-secondary rounded-lg flex items-center justify-center">
                لا توجد صورة
              </div>
            );
          })()}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((img: any) => {
                const rawImgUrl = img.imageUrl || img.ImageUrl;
                
                // استخدام دالة fixImageUrl لتصحيح الـ URL
                const imgUrl = fixImageUrl(rawImgUrl);
                
                return imgUrl ? (
                  <div key={img.id} className="relative h-16 sm:h-20 bg-secondary rounded overflow-hidden flex items-center justify-center">
                    <img
                      src={imgUrl}
                      alt={product.name_Ar}
                      className="w-full h-full object-contain rounded"
                      onError={(e) => {
                        console.warn(`⚠️ Thumbnail image not found: ${imgUrl}`);
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                      onLoad={() => {
                        console.log(`✅ Thumbnail loaded successfully`);
                      }}
                    />
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-primary">{product.name_Ar}</h1>
            <p className="text-sm sm:text-base text-primary-light">{product.name_En}</p>
          </div>

          <div>
            {product.hasDiscount ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <span className="text-accent font-bold text-2xl sm:text-3xl">
                  {product.effectivePrice} ج.م
                </span>
                <span className="text-primary-light line-through text-lg sm:text-xl">
                  {product.price} ج.م
                </span>
              </div>
            ) : (
              <span className="text-primary font-bold text-2xl sm:text-3xl">
                {product.price} ج.م
              </span>
            )}
          </div>

          <div>
            <h3 className="font-bold mb-2 text-lg sm:text-xl">الوصف</h3>
            <p className="text-sm sm:text-base text-primary-dark leading-relaxed">{product.description || "لا يوجد وصف"}</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <label className="font-bold text-base sm:text-lg">الكمية:</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 text-lg border rounded hover:bg-secondary transition-colors"
              >
                -
              </button>
              <span className="w-12 text-center text-lg font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 text-lg border rounded hover:bg-secondary transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-primary text-white py-3 sm:py-3 rounded-lg hover:bg-primary-light flex items-center justify-center gap-2 text-base sm:text-lg transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              أضف للسلة
            </button>
            <button
              onClick={handleFavorite}
              className={`p-3 sm:p-4 rounded-lg border transition-colors ${
                isFavorite ? "bg-red-50 border-red-500" : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Heart
                className={`w-6 h-6 ${
                  isFavorite ? "fill-red-500 text-red-500" : "text-primary"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

