"use client";

import React, { useState, useEffect } from "react";
import { ordersApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function OrdersPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      const response = await ordersApi.getAll();
      if (response.data?.data) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId: number) => {
    if (!confirm("هل أنت متأكد من إلغاء هذا الطلب؟")) return;

    try {
      await ordersApi.cancel(orderId);
      toast.success("تم إلغاء الطلب");
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "فشل الإلغاء");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "InProcessing":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12">جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">طلباتي</h1>
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-primary-dark mb-4">لا توجد طلبات</p>
          <Link href="/products" className="text-primary hover:underline">
            تصفح المنتجات
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-secondary-light p-6 rounded-lg shadow-md border border-secondary-dark">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">الطلب #{order.orderNumber}</h3>
                  <p className="text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                    {order.statusText}
                  </span>
                  <p className="text-lg font-bold mt-2">{order.totalAmount} ج.م</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-bold mb-2">المنتجات:</h4>
                <div className="space-y-2">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.productName} x {item.quantity}</span>
                      <span>{item.totalPrice} ج.م</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/orders/${order.id}`}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light"
                >
                  التفاصيل
                </Link>
                {order.status === "Pending" && (
                  <button
                    onClick={() => handleCancel(order.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    إلغاء الطلب
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

