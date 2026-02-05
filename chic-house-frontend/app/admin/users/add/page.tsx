"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { accountApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import Link from "next/link";

export default function AddAdminUserPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!token || user?.role?.toLowerCase() !== "admin") {
      router.push("/login");
    }
  }, [token, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await accountApi.register({
        userName: formData.userName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phoneNumber: formData.phoneNumber?.trim() || undefined,
        role: "Admin",
      });

      if (response.data?.statusCode === 200) {
        toast.success("تم إضافة المستخدم كأدمن بنجاح");
        router.push("/admin/dashboard");
      }
    } catch (error: any) {
      const msg = (error.response?.data?.message || error.message || "").toString().toLowerCase();
      if (error.response?.status === 400 && (msg.includes("already exists") || msg.includes("موجود") || msg.includes("exist"))) {
        try {
          const upgradeRes = await accountApi.upgradeToAdmin(formData.email);
          if (upgradeRes.data?.statusCode === 200) {
            toast.success("المستخدم مسجّل بالفعل. تم تحويله إلى أدمن بنجاح");
            router.push("/admin/dashboard");
            return;
          }
        } catch (upgradeErr: any) {
          const status = upgradeErr.response?.status;
          const upgradeMsg = upgradeErr.response?.data?.message || upgradeErr.message;
          if (status === 404) {
            toast.error("الخادم لا يدعم تحويل المستخدم لأدمن. يرجى تحديث نسخة الـ API على الخادم (إعادة النشر).");
          } else {
            toast.error(upgradeMsg || "فشل تحويل المستخدم لأدمن");
          }
        }
      } else {
        const errorMessage = error.response?.data?.message || error.message || "فشل إضافة المستخدم";
        toast.error(errorMessage);
      }
      if (process.env.NODE_ENV === "development") {
        console.error("Error adding admin user:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 text-right">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/admin/dashboard" 
            className="text-primary hover:underline mb-4 inline-block"
          >
            ← العودة إلى لوحة التحكم
          </Link>
          <h1 className="text-3xl font-bold text-primary mb-2">إضافة مستخدم كأدمن</h1>
          <p className="text-gray-600">أدخل بيانات المستخدم الجديد لإضافته كأدمن</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-lg border border-secondary-dark">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">
                اسم المستخدم <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                required
                className="w-full px-4 py-2 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="أدخل اسم المستخدم"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-primary">
                البريد الإلكتروني <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-2 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="مثال@البريد.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-primary">
                كلمة المرور <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-primary">
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-4 py-2 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="01xxxxxxxxx"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>ملاحظة:</strong> سيتم إضافة هذا المستخدم كأدمن ويمكنه الوصول إلى لوحة التحكم.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-primary-light transition-smooth disabled:opacity-50 font-medium"
              >
                {loading ? "جاري الإضافة..." : "إضافة مستخدم كأدمن"}
              </button>
              <Link
                href="/admin/dashboard"
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-smooth text-center font-medium"
              >
                إلغاء
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

