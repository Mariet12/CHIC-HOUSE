"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { ordersApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const { token } = useAuth();
  const { cartItems, totalAmount, fetchCart } = useCart();
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    shippingAddress: "",
    paymentMethod: "cash",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    if (cartItems.length === 0) {
      router.push("/cart");
      return;
    }
  }, [token, cartItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Ensure all required fields are present and properly formatted
      const checkoutData = {
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email?.trim() || null,
        shippingAddress: formData.shippingAddress.trim(),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes?.trim() || null,
      };
      
      await ordersApi.checkout(checkoutData);
      toast.success("تم إنشاء الطلب بنجاح");
      await fetchCart();
      router.push("/orders");
    } catch (error: any) {
      console.error("Checkout error:", error);
      const errorMessage = error.response?.data?.message || error.message || "فشل إنشاء الطلب";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-secondary-light p-6 rounded-lg shadow-md space-y-4 border border-secondary-dark">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number *</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Shipping Address *</label>
              <textarea
                value={formData.shippingAddress}
                onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                required
                rows={3}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Payment Method *</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="cash">Cash on Delivery</option>
                <option value="card">Credit Card</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-light disabled:opacity-50"
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </form>
        </div>

        <div className="bg-secondary-light p-6 rounded-lg shadow-md h-fit border border-secondary-dark">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.productName} x {item.quantity}</span>
                <span>${item.totalPrice}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span>${totalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

