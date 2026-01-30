"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { accountApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";

export default function ProfilePage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    userName: "",
    phoneNumber: "",
    email: "",
  });
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchUserInfo();
  }, [token]);

  const fetchUserInfo = async () => {
    try {
      const response = await accountApi.getUserInfo();
      if (response.data?.data) {
        setUserInfo(response.data.data);
        setFormData({
          userName: response.data.data.userName || "",
          phoneNumber: response.data.data.phoneNumber || "",
          email: response.data.data.email || "",
        });
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("userName", formData.userName);
      formDataToSend.append("phoneNumber", formData.phoneNumber);
      if (image) {
        formDataToSend.append("image", image);
      }

      await accountApi.updateUser(formDataToSend);
      toast.success("تم تحديث الملف الشخصي");
      fetchUserInfo();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "فشل التحديث");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const currentPassword = (form.elements.namedItem("currentPassword") as HTMLInputElement).value;
    const newPassword = (form.elements.namedItem("newPassword") as HTMLInputElement).value;

    try {
      await accountApi.changePassword({ currentPassword, newPassword });
      toast.success("تم تغيير كلمة المرور");
      form.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "فشل تغيير كلمة المرور");
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12">جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">الملف الشخصي</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Information */}
        <div className="bg-secondary-light p-6 rounded-lg shadow-md border border-secondary-dark">
          <h2 className="text-xl font-bold mb-4">البيانات الشخصية</h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">اسم المستخدم</label>
              <input
                type="text"
                value={formData.userName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, userName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">صورة الملف الشخصي</label>
              {userInfo?.image && (
                <Image
                  src={userInfo.image}
                  alt="الملف الشخصي"
                  width={100}
                  height={100}
                  className="rounded-full mb-2"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImage(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-light"
            >
              حفظ التغييرات
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-secondary-light p-6 rounded-lg shadow-md border border-secondary-dark">
          <h2 className="text-xl font-bold mb-4">تغيير كلمة المرور</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">كلمة المرور الحالية</label>
              <input
                type="password"
                name="currentPassword"
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">كلمة المرور الجديدة</label>
              <input
                type="password"
                name="newPassword"
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-light"
            >
              تغيير كلمة المرور
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

