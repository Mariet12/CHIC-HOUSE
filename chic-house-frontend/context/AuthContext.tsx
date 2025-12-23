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
        const userData = {
          id: data.userId || data.user?.id,
          email: data.email,
          userName: data.user?.userName || data.userName || email,
          phoneNumber: data.user?.phoneNumber || data.phoneNumber,
          image: data.user?.image || data.image,
          role: data.role,
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
          throw new Error("Token not received");
        }
      } else {
        throw new Error(response.data?.message || "Login failed");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "فشل تسجيل الدخول";
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (formData: FormData) => {
    try {
      const response = await accountApi.register(formData);
      if (response.data?.statusCode === 200) {
        toast.success("Registration successful");
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "";
      const lower = msg.toString().toLowerCase();
      if (lower.includes("exist") || lower.includes("already")) {
        toast.error("Email already exists. Please login or use another email.");
      } else {
        toast.error(msg || "Registration failed");
      }
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
