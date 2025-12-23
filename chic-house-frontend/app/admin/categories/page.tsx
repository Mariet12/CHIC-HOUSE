"use client";

import React, { useEffect, useState } from "react";
import { categoriesApi } from "@/lib/api";
import toast from "react-hot-toast";

interface CategoryForm {
  id?: number | null;
  name: string;
  image: File | null;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CategoryForm>({ id: null, name: "", image: null });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoriesApi.getAll("", 1, 100);
      const items = res.data?.data?.items ?? res.data?.data ?? res.data ?? [];
      setCategories(items);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      toast.error("برجاء إدخال اسم القسم");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("Name", form.name);
      if (form.image) fd.append("Image", form.image);

      if (form.id) {
        await categoriesApi.update(form.id, fd);
        toast.success("تم تحديث القسم");
      } else {
        await categoriesApi.create(fd);
        toast.success("تم إضافة القسم");
      }

      setForm({ id: null, name: "", image: null });
      fetchCategories();
    } catch (error: any) {
      console.error("Submit category error:", error);
      toast.error(error.response?.data?.message || "فشل حفظ القسم");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (c: any) => {
    setForm({ id: c.id, name: c.name || c.name_Ar || c.name_En || "", image: null });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("تأكيد حذف القسم؟")) return;
    try {
      await categoriesApi.delete(id);
      toast.success("تم حذف القسم");
      fetchCategories();
    } catch (error: any) {
      console.error("Delete category error:", error);
      toast.error(error.response?.data?.message || "فشل حذف القسم");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 text-right">
      <h1 className="text-3xl font-bold mb-6 text-primary">إدارة الأقسام</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-sm border border-secondary-dark/50 space-y-4 mb-8"
        encType="multipart/form-data"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">اسم القسم *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الصورة (اختياري)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
              className="w-full"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-light disabled:opacity-50"
          >
            {submitting ? "جاري الحفظ..." : form.id ? "تحديث القسم" : "إضافة القسم"}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={() => setForm({ id: null, name: "", image: null })}
              className="px-5 py-2 bg-gray-200 text-primary rounded-lg hover:bg-gray-300"
            >
              إلغاء التعديل
            </button>
          )}
        </div>
      </form>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-dark/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-primary">الأقسام</h2>
          <span className="text-sm text-gray-600">الإجمالي: {categories.length}</span>
        </div>
        {loading ? (
          <p className="text-primary">جاري التحميل...</p>
        ) : categories.length === 0 ? (
          <p className="text-gray-600">لا توجد أقسام.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b">
                  <th className="p-2">القسم</th>
                  <th className="p-2">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} className="border-b">
                    <td className="p-2">{c.name || c.name_Ar || c.name_En}</td>
                    <td className="p-2 flex gap-2 justify-end">
                      <button
                        onClick={() => handleEdit(c)}
                        className="px-3 py-1 bg-secondary text-primary rounded-lg hover:bg-secondary-dark/50"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
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
    </div>
  );
}



