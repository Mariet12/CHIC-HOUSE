"use client";

import React, { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { cartItems, totalAmount, updateCartItem, removeFromCart, clearCart } = useCart();
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/login");
    }
  }, [token, isLoading, router]);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">جاري التحميل...</div>;
  }

  if (!token) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Shopping Cart</h1>
        {cartItems.length > 0 && (
          <button
            onClick={clearCart}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Clear Cart
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-primary-dark mb-4">Your cart is empty</p>
          <Link
            href="/products"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-light shadow-md"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-secondary-light p-6 rounded-lg shadow-md flex items-center gap-4 border border-secondary-dark"
              >
                <div className="relative w-24 h-24 bg-secondary rounded">
                  {item.productImage && (
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      className="object-cover rounded"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{item.productName}</h3>
                  <p className="text-accent font-bold">${item.unitPrice}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      updateCartItem(item.id, Math.max(1, item.quantity - 1))
                    }
                    className="p-2 border rounded hover:bg-secondary"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateCartItem(item.id, item.quantity + 1)}
                    className="p-2 border rounded hover:bg-secondary"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-secondary-light p-6 rounded-lg shadow-md h-fit border border-secondary-dark">
            <h2 className="text-xl font-bold mb-4">ملخص الطلب</h2>
            <div className="space-y-2 mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.productName} x {item.quantity}</span>
                  <span>{item.totalPrice} ج.م</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between text-xl font-bold">
                <span>المجموع:</span>
                <span>{totalAmount} ج.م</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="block w-full text-center bg-primary text-white py-3 rounded-lg hover:bg-primary-light"
            >
              إتمام الطلب
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

