"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ordersApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = Number(params.id);
  const { token } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchOrder();
  }, [token, orderId]);

  const fetchOrder = async () => {
    try {
      const response = await ordersApi.getById(orderId);
      if (response.data?.data) {
        setOrder(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12">جاري التحميل...</div>;
  }

  if (!order) {
    return <div className="container mx-auto px-4 py-12">الطلب غير موجود</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">تفاصيل الطلب #{order.orderNumber}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-secondary-light p-6 rounded-lg shadow-md border border-secondary-dark">
          <h2 className="text-xl font-bold mb-4">معلومات الطلب</h2>
          <div className="space-y-2">
            <p><strong>الحالة:</strong> {order.statusText}</p>
            <p><strong>الإجمالي:</strong> {order.totalAmount} ج.م</p>
            <p><strong>حالة الدفع:</strong> {order.paymentStatus ? "مدفوع" : "غير مدفوع"}</p>
            <p><strong>طريقة الدفع:</strong> {order.paymentMethod}</p>
            <p><strong>التاريخ:</strong> {new Date(order.createdAt).toLocaleString("ar-EG")}</p>
          </div>
        </div>

        <div className="bg-secondary-light p-6 rounded-lg shadow-md border border-secondary-dark">
          <h2 className="text-xl font-bold mb-4">معلومات التوصيل</h2>
          <div className="space-y-2">
            <p><strong>الاسم:</strong> {order.fullName}</p>
            <p><strong>الهاتف:</strong> {order.phoneNumber}</p>
            <p><strong>البريد:</strong> {order.email || "غير متوفر"}</p>
            <p><strong>العنوان:</strong> {order.shippingAddress}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-secondary-light p-6 rounded-lg shadow-md border border-secondary-dark">
        <h2 className="text-xl font-bold mb-4">المنتجات</h2>
        <div className="space-y-4">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex items-center gap-4 border-b pb-4">
              <div className="relative w-20 h-20 bg-secondary rounded">
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
                <h3 className="font-bold">{item.productName}</h3>
                <p className="text-gray-600">الكمية: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{item.totalPrice} ج.م</p>
                <p className="text-sm text-gray-600">{item.unitPrice} ج.م للقطعة</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

