"use client";

import React, { useState, useEffect, lazy, Suspense } from "react";
import { useParams } from "next/navigation";
import { productsApi, fixImageUrl } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { favoritesApi } from "@/lib/api";
import { Heart, ShoppingCart, ChevronRight, ChevronLeft, ZoomIn } from "lucide-react";
import toast from "react-hot-toast";

const ImageModal = lazy(() => import("@/components/common/ImageModal"));

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = Number(params.id);
  const { addToCart } = useCart();
  const { token } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [allImages, setAllImages] = useState<string[]>([]);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await productsApi.getById(productId);
      if (response.data?.data) {
        const productData = response.data.data;
        setProduct(productData);
        setIsFavorite(productData.isFavorite || false);
        
        // تجميع جميع الصور في مصفوفة واحدة
        const images: string[] = [];
        const firstImageUrl = fixImageUrl(
          productData.firstImageUrl || 
          (productData.images && productData.images.length > 0 && (productData.images[0]?.imageUrl || productData.images[0]?.ImageUrl))
        );
        if (firstImageUrl) {
          images.push(firstImageUrl);
        }
        if (productData.images && Array.isArray(productData.images)) {
          productData.images.forEach((img: any) => {
            const imgUrl = fixImageUrl(img.imageUrl || img.ImageUrl);
            if (imgUrl && !images.includes(imgUrl)) {
              images.push(imgUrl);
            }
          });
        }
        setAllImages(images);
        setMainImageIndex(0);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModalAt = (index: number) => {
    setCurrentImageIndex(index);
    setSelectedImage(allImages[index] || null);
    setIsModalOpen(true);
  };

  const goPrev = () => {
    if (allImages.length <= 1) return;
    const next = mainImageIndex <= 0 ? allImages.length - 1 : mainImageIndex - 1;
    setMainImageIndex(next);
  };

  const goNext = () => {
    if (allImages.length <= 1) return;
    const next = mainImageIndex >= allImages.length - 1 ? 0 : mainImageIndex + 1;
    setMainImageIndex(next);
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
        {/* صور المنتج — كاروسيل + تقليب + تكبير */}
        <div className="space-y-3 sm:space-y-4">
          {allImages.length > 0 ? (
            <>
              <div className="relative w-full h-64 sm:h-80 md:h-96 bg-secondary-light rounded-xl overflow-hidden border border-secondary-dark flex items-center justify-center group">
                <img
                  src={allImages[mainImageIndex]}
                  alt={product.name_Ar}
                  className="w-full h-full object-contain transition-opacity duration-200 cursor-zoom-in"
                  onClick={() => openModalAt(mainImageIndex)}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="h-full flex items-center justify-center text-primary">لا توجد صورة</div>';
                    }
                  }}
                />
                {/* أزرار التقليب */}
                {allImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goPrev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-all shadow-lg"
                      aria-label="الصورة السابقة"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-all shadow-lg"
                      aria-label="الصورة التالية"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
                {/* زر فتح التكبير/المودال */}
                <button
                  type="button"
                  onClick={() => openModalAt(mainImageIndex)}
                  className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary-dark transition-colors"
                  title="تكبير وتصفح الصور"
                  aria-label="تكبير"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                {allImages.length > 1 && (
                  <span className="absolute bottom-2 left-2 text-sm text-primary bg-white/90 px-2 py-1 rounded">
                    {mainImageIndex + 1} / {allImages.length}
                  </span>
                )}
              </div>
              {/* الثامبنيلز — كل الصور */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMainImageIndex(idx)}
                      className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === mainImageIndex
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-secondary-dark hover:border-primary/60"
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${product.name_Ar} - ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="h-96 bg-secondary rounded-xl flex items-center justify-center text-primary">
              لا توجد صورة
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

      {/* Image Modal — lazy loaded */}
      {selectedImage && (
        <Suspense fallback={null}>
          <ImageModal
            imageUrl={selectedImage}
            alt={product.name_Ar}
            isOpen={isModalOpen}
            images={allImages}
            currentIndex={currentImageIndex}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedImage(null);
              setCurrentImageIndex(0);
            }}
            onImageChange={(index) => {
              setCurrentImageIndex(index);
              setSelectedImage(allImages[index]);
            }}
          />
        </Suspense>
      )}
    </div>
  );
}

