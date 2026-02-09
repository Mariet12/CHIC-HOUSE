"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { productsApi, categoriesApi, fixImageUrl } from "@/lib/api";
import toast from "react-hot-toast";
import ImageModal from "@/components/common/ImageModal";

interface ProductForm {
  id?: number | null;
  name: string;
  price: string;
  categoryId: string;
  description: string;
  discount: string;
  images: FileList | null;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>({
    id: null,
    name: "",
    price: "",
    categoryId: "",
    description: "",
    discount: "",
    images: null,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        productsApi.getAll({ pageNumber: 1, pageSize: 50 }),
        categoriesApi.getAll("", 1, 100),
      ]);

      const prodItems =
        prodRes.data?.data?.items ??
        prodRes.data?.data ??
        prodRes.data ??
        [];
      const catItems =
        catRes.data?.data?.items ??
        catRes.data?.data ??
        catRes.data ??
        [];

      setProducts(prodItems);
      setCategories(catItems);
      // اختر أول قسم تلقائياً إذا لم يكن محدداً
      if (!form.categoryId && catItems.length > 0) {
        setForm((prev) => ({ ...prev, categoryId: (catItems[0].id ?? "").toString() }));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getErrorMessage = (error: any) => {
    const apiData = error?.response?.data;
    const errors =
      apiData?.errors &&
      (typeof apiData.errors === "string"
        ? apiData.errors
        : JSON.stringify(apiData.errors));
    const apiDataString =
      apiData && typeof apiData !== "string" ? JSON.stringify(apiData) : apiData;
    return (
      apiData?.message ||
      apiData?.title ||
      errors ||
      apiDataString ||
      error?.message ||
      "فشل حفظ المنتج"
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceValue = parseFloat(form.price);
    const categoryValue = parseInt(form.categoryId, 10);
    const discountValue = form.discount ? parseFloat(form.discount) : 0;

    if (!form.name || !form.price) {
      toast.error("برجاء إدخال اسم المنتج والسعر");
      return;
    }
    if (Number.isNaN(priceValue) || priceValue <= 0) {
      toast.error("السعر غير صحيح");
      return;
    }
    if (Number.isNaN(discountValue) || discountValue < 0) {
      toast.error("الخصم غير صحيح");
      return;
    }
    if (Number.isNaN(categoryValue) || categoryValue <= 0) {
      toast.error("اختر قسم صحيح (القسم مطلوب)");
      return;
    }
    if (!categories.length) {
      toast.error("لم يتم تحميل الأقسام، برجاء إعادة المحاولة أو التحقق من صلاحياتك");
      return;
    }

    setSubmitting(true);
    setLastError(null);
    try {
      const fd = new FormData();
      fd.append("Name_Ar", form.name);
      fd.append("Name_En", form.name); // نرسل نفس الاسم للإنجليزي للتوافق مع الـ API
      fd.append("Price", priceValue.toString());
      fd.append("CategoryId", categoryValue.toString());
      fd.append("Description", form.description || "");
      // إرسال الحقول المطلوبة من الباك بقيم افتراضية (لأن الباك يطلبهم لكن المستخدم لا يريدهم في الفورم)
      fd.append("CountryOfOrigin", "غير محدد");
      fd.append("Brand", "غير محدد");
      fd.append("Warranty", "غير محدد");
      // الخصم اختياري، نرسله بصفر لو فاضي
      fd.append("Discount", discountValue.toString());
      if (form.images && form.images.length > 0) {
        Array.from(form.images).forEach((file) => fd.append("Images", file));
      }

      if (form.id) {
        await productsApi.update(form.id, fd);
        toast.success("تم تحديث المنتج");
      } else {
        await productsApi.create(fd);
        toast.success("تم إضافة المنتج");
      }
      setForm({
        id: null,
        name: "",
        price: "",
        categoryId: "",
        description: "",
        discount: "",
        images: null,
      });
      fetchData();
    } catch (error: any) {
      const msg = getErrorMessage(error);
      setLastError(msg);
      // لو السيرفر رجّع 400، نعرض رسالة توضيحية + الرسالة الخام من الباك لمساعدتك في معرفة السبب الحقيقي
      if (error?.response?.status === 400) {
        toast.error(
          `برجاء التأكد من إدخال كل البيانات المطلوبة (الاسم، السعر، القسم على الأقل)، ثم المحاولة مرة أخرى.\nتفاصيل من الخادم: ${msg}`
        );
      } else {
        toast.error(`خطأ: ${msg}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleEdit = (p: any) => {
    setForm({
      id: p.id,
      name: p.name_Ar || p.nameAr || p.name_En || p.nameEn || "",
      price: (p.price ?? "").toString(),
      categoryId: (p.categoryId ?? "").toString(),
      description: p.description || "",
      discount: p.discount?.toString?.() || "",
      images: null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("تأكيد حذف المنتج؟")) return;
    try {
      await productsApi.delete(id);
      toast.success("تم حذف المنتج");
      fetchData();
    } catch (error: any) {
      console.error("Delete error:", error);
      const msg = getErrorMessage(error);
      setLastError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 text-right">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="text-3xl font-bold text-primary">إدارة المنتجات</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/products/add"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
          >
            إضافة منتج
          </Link>
          <button
            onClick={scrollToForm}
            className="px-4 py-2 bg-secondary text-primary rounded-lg hover:bg-secondary-dark/50 transition-colors"
          >
            إضافة هنا
          </button>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-sm border border-secondary-dark/50 space-y-4 mb-8"
        encType="multipart/form-data"
        ref={formRef}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">اسم المنتج *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">السعر *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الخصم (اختياري)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.discount}
              onChange={(e) => setForm({ ...form, discount: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">القسم *</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">اختر القسم</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.name_Ar || c.name_En}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الصور</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setForm({ ...form, images: e.target.files })}
              className="w-full"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">الوصف</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-light disabled:opacity-50"
          >
            {submitting ? "جاري الحفظ..." : form.id ? "تحديث المنتج" : "إضافة المنتج"}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={() =>
                setForm({
                  id: null,
                  name: "",
                  price: "",
                  categoryId: "",
                  description: "",
                  discount: "",
                  images: null,
                })
              }
              className="px-5 py-2 bg-gray-200 text-primary rounded-lg hover:bg-gray-300"
            >
              إلغاء التعديل
            </button>
          )}
        </div>
      </form>

      {lastError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 break-words">
          {lastError}
        </div>
      )}

      {/* List */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-dark/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-primary">المنتجات</h2>
          <span className="text-sm text-gray-600">الإجمالي: {products.length}</span>
        </div>
        {loading ? (
          <p className="text-primary">جاري التحميل...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-600">لا توجد منتجات.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b">
                  <th className="p-2">الصورة</th>
                  <th className="p-2">الاسم</th>
                  <th className="p-2">السعر</th>
                  <th className="p-2">القسم</th>
                  <th className="p-2">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="p-2">
                      {(() => {
                        // محاولة الحصول على URL الصورة بكل الطرق الممكنة
                        const imageUrl = p.firstImageUrl || 
                                        (p.images && Array.isArray(p.images) && p.images.length > 0 && (p.images[0]?.imageUrl || p.images[0]?.ImageUrl)) ||
                                        (p.images && !Array.isArray(p.images) && (p.images.imageUrl || p.images.ImageUrl)) ||
                                        null;
                        
                        if (!imageUrl) {
                          return (
                            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500" title={`Product ID: ${p.id}`}>
                              لا توجد صورة
                            </div>
                          );
                        }

                        // استخدام دالة fixImageUrl لتصحيح الـ URL
                        const fullImageUrl = fixImageUrl(imageUrl);
                        
                        if (!fullImageUrl) {
                          return (
                            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500" title={`Product ID: ${p.id}`}>
                              لا توجد صورة
                            </div>
                          );
                        }

                        return (
                          <div 
                            className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded border border-gray-200 overflow-hidden flex items-center justify-center relative cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                              setSelectedImage(fullImageUrl);
                              setIsModalOpen(true);
                            }}
                          >
                            <img
                              src={fullImageUrl}
                              alt={p.name_Ar || p.nameAr || p.name_En || p.nameEn || "Product"}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                const parent = target.parentElement;
                                if (parent && !parent.querySelector(".error-placeholder")) {
                                  const errorDiv = document.createElement("div");
                                  errorDiv.className = "error-placeholder w-full h-full bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500";
                                  errorDiv.textContent = "لا توجد صورة";
                                  errorDiv.title = `الملف غير موجود على السيرفر: ${fullImageUrl}`;
                                  parent.appendChild(errorDiv);
                                }
                              }}
                            />
                          </div>
                        );
                      })()}
                    </td>
                    <td className="p-2">{p.name_Ar || p.nameAr || p.name_En || p.nameEn}</td>
                    <td className="p-2">{p.price} ج.م</td>
                    <td className="p-2">{p.categoryName || p.category?.name || p.categoryId}</td>
                    <td className="p-2 flex gap-2 justify-end">
                      <button
                        onClick={() => handleEdit(p)}
                        className="px-3 py-1 bg-secondary text-primary rounded-lg hover:bg-secondary-dark/50"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          alt="صورة المنتج"
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedImage(null);
          }}
        />
      )}
    </div>
  );
}



