"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { productsApi, categoriesApi } from "@/lib/api";
import toast from "react-hot-toast";

interface ProductForm {
  name: string;
  price: string;
  categoryId: string;
  description: string;
  discount: string;
  images: FileList | null;
}

export default function AdminProductAddPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>({
    name: "",
    price: "",
    categoryId: "",
    description: "",
    discount: "",
    images: null,
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const catRes = await categoriesApi.getAll("", 1, 100);
      const catItems = catRes.data?.data?.items ?? catRes.data?.data ?? catRes.data ?? [];
      setCategories(catItems);
      // اختر أول قسم تلقائياً لو لم يكن محدداً
      if (!form.categoryId && catItems.length > 0) {
        setForm((prev) => ({ ...prev, categoryId: (catItems[0].id ?? "").toString() }));
      }
    } catch (error: any) {
      console.error("Fetch categories error:", error);
      toast.error(error.response?.data?.message || "فشل تحميل الأقسام");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const getErrorMessage = (error: any) => {
    const apiData = error?.response?.data;
    const errors =
      apiData?.errors &&
      (typeof apiData.errors === "string" ? apiData.errors : JSON.stringify(apiData.errors));
    const apiDataString =
      apiData && typeof apiData !== "string" ? JSON.stringify(apiData) : apiData;
    return apiData?.message || apiData?.title || errors || apiDataString || error?.message || "فشل حفظ المنتج";
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
      fd.append("Name_En", form.name);
      fd.append("Price", priceValue.toString());
      fd.append("CategoryId", categoryValue.toString());
      fd.append("Description", form.description || "");
      // إرسال الحقول المطلوبة من الباك بقيم افتراضية (لأن الباك يطلبهم لكن المستخدم لا يريدهم في الفورم)
      fd.append("CountryOfOrigin", "غير محدد");
      fd.append("Brand", "غير محدد");
      fd.append("Warranty", "غير محدد");
      fd.append("Discount", discountValue.toString());
      if (form.images && form.images.length > 0) {
        Array.from(form.images).forEach((file) => fd.append("Images", file));
      }

      console.log("Submitting product (add) payload:", {
        Name_Ar: form.name,
        Name_En: form.name,
        Price: priceValue,
        CategoryId: categoryValue,
        Description: form.description || "",
        Discount: discountValue,
        ImagesCount: form.images?.length || 0,
      });

      await productsApi.create(fd);
      toast.success("تم إضافة المنتج");
      router.push("/admin/products");
    } catch (error: any) {
      console.error("Submit error:", error);
      if (error?.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      const msg = getErrorMessage(error);
      setLastError(msg);
      if (error?.response?.status === 400) {
        toast.error(
          `برجاء التأكد من إدخال كل البيانات المطلوبة (الاسم، السعر، القسم على الأقل)، ثم إعادة المحاولة.\nتفاصيل من الخادم: ${msg}`
        );
      } else {
        toast.error(`خطأ: ${msg}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 text-right">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="text-3xl font-bold text-primary">إضافة منتج</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-sm border border-secondary-dark/50 space-y-4 mb-8"
        encType="multipart/form-data"
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
            {submitting ? "جاري الحفظ..." : "إضافة المنتج"}
          </button>
        </div>
      </form>

      {lastError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 break-words">
          {lastError}
        </div>
      )}
    </div>
  );
}


