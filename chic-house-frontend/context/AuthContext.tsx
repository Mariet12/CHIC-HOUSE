"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { accountApi } from "@/lib/api";
import toast from "react-hot-toast";

interface User {
  id: string;
  email: string;
  userName: string;
  phoneNumber?: string;
  image?: string;
  role?: string;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  register: (formData: FormData) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const expiry = localStorage.getItem("tokenExpiry");

    if (storedToken && storedUser && expiry) {
      const now = Date.now();
      const exp = Number(expiry);
      if (!Number.isNaN(exp) && now < exp) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // تحديث بيانات المستخدم من السيرفر (بما فيها الـ role) لضمان ظهور لوحة الأدمن لو كان أدمن
        accountApi.getUserInfo()
          .then((res) => {
            const d = res.data?.data;
            if (d && res.data?.statusCode === 200) {
              const updatedUser = {
                id: d.id ?? d.Id,
                email: d.email ?? d.Email,
                userName: d.userName ?? d.UserName ?? d.email,
                phoneNumber: d.phoneNumber ?? d.PhoneNumber,
                image: d.image ?? d.Image,
                role: d.role ?? d.Role ?? d.roles?.[0] ?? d.Roles?.[0],
                status: d.status ?? d.Status,
              };
              setUser(updatedUser);
              localStorage.setItem("user", JSON.stringify(updatedUser));
            }
          })
          .catch(() => { /* تجاهل خطأ التوكن المنتهي أو الشبكة */ });
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("tokenExpiry");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const response = await accountApi.login({ email, password });
      // الـ response structure: { statusCode, message, data: { token, user, userId, email, role, status } }
      if (response.data?.data) {
        const data = response.data.data;
        const newToken = data.token;
        // الباكند يرسل: id, displayName, imageUrl, role, roles
        const userData = {
          id: data.id || data.userId || data.user?.id,
          email: data.email,
          userName: data.displayName ?? data.user?.userName ?? data.userName ?? email,
          phoneNumber: data.phoneNumber ?? data.user?.phoneNumber,
          image: data.imageUrl ?? data.user?.image ?? data.image,
          role: data.role ?? data.roles?.[0],
          status: data.status,
        };
        
        if (newToken) {
          setToken(newToken);
          setUser(userData);
          if (typeof window !== "undefined") {
            localStorage.setItem("token", newToken);
            localStorage.setItem("user", JSON.stringify(userData));
            // مدة الحفظ: 30 يوم عند التفعيل، وإلا 12 ساعة
            const expiryMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 12 * 60 * 60 * 1000;
            const expiry = Date.now() + expiryMs;
            localStorage.setItem("tokenExpiry", expiry.toString());
          }
          toast.success("تم تسجيل الدخول بنجاح");
        } else {
          throw new Error("لم يتم استلام رمز الدخول");
        }
      } else {
        throw new Error(response.data?.message || "فشل تسجيل الدخول");
      }
    } catch (error: any) {
      let errorMessage = "فشل تسجيل الدخول";
      
      if (error.response?.data) {
        const apiMessage = error.response.data.message;
        if (apiMessage) {
          // ترجمة رسائل الخطأ الشائعة
          const lowerMessage = apiMessage.toLowerCase();
          if (lowerMessage.includes("not registered") || lowerMessage.includes("email")) {
            errorMessage = "البريد الإلكتروني غير مسجل. يرجى التحقق من البريد أو إنشاء حساب جديد";
          } else if (lowerMessage.includes("password") || lowerMessage.includes("incorrect")) {
            errorMessage = "كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى";
          } else if (lowerMessage.includes("not verified") || lowerMessage.includes("email not confirmed")) {
            errorMessage = "البريد الإلكتروني غير مفعّل. يرجى التحقق من بريدك الإلكتروني";
          } else if (lowerMessage.includes("banned")) {
            errorMessage = "تم حظر حسابك. يرجى التواصل مع الدعم";
          } else if (lowerMessage.includes("inactive")) {
            errorMessage = "حسابك غير نشط. يرجى التواصل مع الدعم";
          } else {
            errorMessage = apiMessage;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (formData: FormData) => {
    try {
      const response = await accountApi.register(formData);
      if (response.data?.statusCode === 200) {
        toast.success("تم إنشاء الحساب بنجاح");
      } else {
        throw new Error(response.data?.message || "فشل إنشاء الحساب");
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      let errorMessage = "فشل إنشاء الحساب";
      
      if (errorData) {
        // عرض أخطاء الـ validation أولاً (أهم)
        if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          const validationErrors = errorData.errors
            .map((err: string) => {
              // ترجمة أخطاء شائعة
              const lower = err.toLowerCase();
              if (lower.includes("required") || lower.includes("مطلوب")) {
                if (lower.includes("email")) return "البريد الإلكتروني مطلوب";
                if (lower.includes("password")) return "كلمة المرور مطلوبة";
                if (lower.includes("username")) return "اسم المستخدم مطلوب";
                if (lower.includes("role")) return "الدور مطلوب";
                return "جميع الحقول المطلوبة يجب ملؤها";
              }
              if (lower.includes("email")) return "البريد الإلكتروني غير صحيح";
              if (lower.includes("password") && lower.includes("length")) return "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
              if (lower.includes("invalid email")) return "تنسيق البريد الإلكتروني غير صحيح";
              return err;
            })
            .join(", ");
          errorMessage = `خطأ في البيانات: ${validationErrors}`;
        } 
        // عرض رسالة الخطأ من الـ API
        else if (errorData.message) {
          const lower = errorData.message.toLowerCase();
          if (lower.includes("exist") || lower.includes("already")) {
            errorMessage = "البريد الإلكتروني مستخدم بالفعل. يرجى تسجيل الدخول أو استخدام بريد آخر";
          } else if (lower.includes("registration failed")) {
            errorMessage = "فشل إنشاء الحساب. يرجى التحقق من البيانات والمحاولة مرة أخرى";
          } else {
            errorMessage = errorData.message;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("tokenExpiry");
    }
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
