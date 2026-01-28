"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "Customer",
  });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من الحقول المطلوبة
    if (!formData.userName.trim()) {
      toast.error("اسم المستخدم مطلوب");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("البريد الإلكتروني مطلوب");
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("UserName", formData.userName.trim());
      formDataToSend.append("Email", formData.email.trim());
      formDataToSend.append("Password", formData.password);
      formDataToSend.append("Role", formData.role || "Customer");
      
      // إضافة PhoneNumber فقط إذا كان له قيمة
      if (formData.phoneNumber && formData.phoneNumber.trim()) {
        formDataToSend.append("PhoneNumber", formData.phoneNumber.trim());
      }
      
      // إضافة Image فقط إذا كان موجوداً
      if (image) {
        formDataToSend.append("Image", image);
      }

      // Log البيانات المرسلة للتطوير
      if (process.env.NODE_ENV === 'development') {
        console.log("Register FormData:", {
          userName: formData.userName.trim(),
          email: formData.email.trim(),
          password: formData.password ? "***" : "",
          role: formData.role || "Customer",
          phoneNumber: formData.phoneNumber || "none",
          hasImage: !!image
        });
      }

      await register(formDataToSend);
      router.push("/login");
    } catch (error) {
      // Error handled in context (e.g., email already exists)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-light px-4 py-12">
      <div className="max-w-md w-full bg-secondary-light p-8 rounded-lg shadow-lg border border-secondary-dark">
        <h1 className="brand-title text-center mb-8">Create Account</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImage(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-light transition-smooth disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

