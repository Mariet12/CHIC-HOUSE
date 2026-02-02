"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { adminDashboardApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Truck, ChevronRight, ChevronLeft } from "lucide-react";

export default function AdminOrdersPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || user?.role?.toLowerCase() !== "admin") {
      router.push("/login");
      return;
    }
    fetchOrders();
  }, [token, user, pageNumber]);

  const fetchOrders = async () => {
    try {
      setError(null);
      setLoading(true);
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/3ec3ca31-27cf-4cff-9f60-e9391fa1804b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/orders/page.tsx:fetchOrders',message:'admin orders fetch start',data:{pageNumber,pageSize},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      const res = await adminDashboardApi.getOrdersPage({
        pageNumber,
        pageSize,
      });
      const data = res.data?.data;
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/3ec3ca31-27cf-4cff-9f60-e9391fa1804b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/orders/page.tsx:fetchOrders',message:'admin orders API response',data:{hasData:!!data,dataKeys:data?Object.keys(data):[],itemsLength:data?.items?.length,totalCount:data?.totalCount},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      if (data?.items) {
        setOrders(data.items);
        setTotalCount(data.totalCount ?? 0);
      }
    } catch (err: any) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/3ec3ca31-27cf-4cff-9f60-e9391fa1804b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin/orders/page.tsx:fetchOrders',message:'admin orders fetch error',data:{msg:err?.message,status:err?.response?.status},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
      // #endregion
      setError(err.response?.data?.message || err.message || "تعذر تحميل الطلبات");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  if (loading && orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-primary text-right">
        جاري التحميل...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 text-right">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/dashboard"
          className="text-primary hover:underline inline-flex items-center gap-1"
        >
          ← العودة إلى لوحة التحكم
        </Link>
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <Truck className="w-8 h-8" />
          إدارة الطلبات
        </h1>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-secondary-dark/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-secondary-light/50">
                <th className="text-right p-3 font-bold text-primary">رقم الطلب</th>
                <th className="text-right p-3 font-bold text-primary">العميل</th>
                <th className="text-right p-3 font-bold text-primary">الإجمالي</th>
                <th className="text-right p-3 font-bold text-primary">الحالة</th>
                <th className="text-right p-3 font-bold text-primary">التاريخ</th>
                <th className="text-right p-3 font-bold text-primary">تفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-600">
                    لا توجد طلبات.
                  </td>
                </tr>
              )}
              {orders.map((order) => (
                <tr key={order.orderId ?? order.id} className="border-b hover:bg-secondary-light/30">
                  <td className="p-3">{order.orderNumber}</td>
                  <td className="p-3">
                    {order.customer ?? order.fullName ?? order.email ?? order.userId ?? "—"}
                  </td>
                  <td className="p-3">
                    {order.total != null
                      ? `${order.total} ج.م`
                      : order.totalAmount != null
                        ? `${order.totalAmount} ج.م`
                        : "—"}
                  </td>
                  <td className="p-3">{order.status ?? "—"}</td>
                  <td className="p-3">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("ar-EG")
                      : "—"}
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/orders/${order.orderId ?? order.id}`}
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      عرض
                      <ChevronLeft className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t">
            <button
              type="button"
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
              className="p-2 rounded-lg border border-secondary-dark/50 disabled:opacity-50 hover:bg-secondary-light"
              aria-label="الصفحة السابقة"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <span className="px-3 text-primary">
              {pageNumber} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
              disabled={pageNumber >= totalPages}
              className="p-2 rounded-lg border border-secondary-dark/50 disabled:opacity-50 hover:bg-secondary-light"
              aria-label="الصفحة التالية"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
