"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const { login, user, isLoading } = useAuth();
  const router = useRouter();

  // لو في جلسة صالحة بالفعل يدخل مباشرةً بدون كلمة سر
  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password, rememberMe);
      router.push("/");
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-light px-4 py-12">
      <div className="max-w-md w-full bg-secondary-light p-8 rounded-lg shadow-lg border border-secondary-dark">
        <h1 className="brand-title text-center mb-8">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="rememberMe" className="text-sm select-none">
              Remember me for 30 days
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-light transition-smooth disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="mt-6 text-center space-y-2">
          <Link href="/forgot-password" className="text-primary hover:underline">
            Forgot Password?
          </Link>
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Sign Up Now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

