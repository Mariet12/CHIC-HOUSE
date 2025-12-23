"use client";

import React, { useState } from "react";
import { accountApi } from "@/lib/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await accountApi.forgotPassword({ email });
      toast.success("تم إرسال رمز التحقق إلى بريدك الإلكتروني");
      setStep("otp");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "فشلت العملية");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await accountApi.verifyOtp({ email, otp });
      toast.success("تم التحقق بنجاح");
      setStep("reset");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "رمز التحقق غير صحيح");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await accountApi.resetPassword({ email, otp, newPassword });
      toast.success("تم إعادة تعيين كلمة المرور بنجاح");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "فشلت العملية");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-light px-4">
      <div className="max-w-md w-full bg-secondary-light p-8 rounded-lg shadow-lg border border-secondary-dark">
        <h1 className="brand-title text-center mb-8">Reset Password</h1>

        {step === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg"
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg"
            >
              {loading ? "Saving..." : "Save New Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

