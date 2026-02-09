"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { adminDashboardApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Users,
  Package,
  Layers,
  Truck,
  ClipboardList,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const [summaryRes, ordersRes] = await Promise.all([
        adminDashboardApi.getSummary(),
        adminDashboardApi.getRecentOrders(5),
      ]);

      const rawSummary = summaryRes.data?.data;
      const rawOrders = ordersRes.data?.data;

      if (rawSummary) {
        setSummary(rawSummary);
      }
      if (rawOrders && Array.isArray(rawOrders)) {
        setRecentOrders(rawOrders);
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching dashboard data:", error);
      }
      setError(error.response?.data?.message || error.message || "تعذر تحميل بيانات لوحة التحكم");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-primary text-right">جاري التحميل...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-primary text-right">
        <h1 className="text-3xl font-bold mb-4">لوحة التحكم</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 text-right">
      <h1 className="text-3xl font-bold mb-8 text-primary">لوحة التحكم</h1>

      {/* Summary Cards — دعم أسماء الباكند camelCase و PascalCase */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-dark/50 flex items-center justify-between">
            <div>
              <p className="text-primary-dark mb-1">إجمالي المبيعات</p>
              <p className="text-3xl font-bold text-primary">
                {(summary.totalSales ?? summary.TotalSales ?? summary.paidAmount ?? summary.PaidAmount ?? summary.completedSales ?? summary.CompletedSales ?? 0)} ج.م
              </p>
            </div>
            <div className="text-[#a855f7] bg-[#f5eaff] p-3 rounded-xl">
              <ShoppingBag className="w-8 h-8" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-dark/50 flex items-center justify-between">
            <div>
              <p className="text-primary-dark mb-1">إجمالي المستخدمين</p>
              <p className="text-3xl font-bold text-primary">
                {summary.totalCustomers ?? summary.TotalCustomers ?? summary.customersCount ?? summary.CustomersCount ?? 0}
              </p>
            </div>
            <div className="text-[#2563eb] bg-[#e3edff] p-3 rounded-xl">
              <Users className="w-8 h-8" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-dark/50 flex items-center justify-between">
            <div>
              <p className="text-primary-dark mb-1">إجمالي المنتجات</p>
              <p className="text-3xl font-bold text-primary">
                {summary.totalProducts ?? summary.TotalProducts ?? summary.productsCount ?? summary.ProductsCount ?? 0}
              </p>
            </div>
            <div className="text-[#22c55e] bg-[#e6f7ed] p-3 rounded-xl">
              <Package className="w-8 h-8" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-dark/50 flex items-center justify-between">
            <div>
              <p className="text-primary-dark mb-1">إجمالي الطلبات</p>
              <p className="text-3xl font-bold text-primary">
                {summary.totalOrders ?? summary.TotalOrders ?? summary.ordersCount ?? summary.OrdersCount ?? 0}
              </p>
            </div>
            <div className="text-[#3b82f6] bg-[#e5f0ff] p-3 rounded-xl">
              <Layers className="w-8 h-8" />
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions — نفس الارتفاع لجميع البطاقات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 items-stretch">
        <Link href="/admin/categories" className="block hover:-translate-y-1 transition-transform duration-200 h-full">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-dark/50 flex items-center justify-between min-h-[120px] h-full">
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-bold text-primary mb-2">إدارة الأقسام</h3>
              <p className="text-gray-600">إضافة وتعديل الأقسام</p>
            </div>
            <div className="text-[#2563eb] bg-[#e3edff] p-3 rounded-xl flex-shrink-0">
              <ClipboardList className="w-8 h-8" />
            </div>
          </div>
        </Link>
        <Link href="/admin/products" className="block hover:-translate-y-1 transition-transform duration-200 h-full">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-dark/50 flex items-center justify-between min-h-[120px] h-full">
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-bold text-primary mb-2">إدارة المنتجات</h3>
              <p className="text-gray-600">إضافة وتعديل المنتجات</p>
            </div>
            <div className="text-[#22c55e] bg-[#e6f7ed] p-3 rounded-xl flex-shrink-0">
              <Package className="w-8 h-8" />
            </div>
          </div>
        </Link>
        <Link href="/admin/orders" className="block hover:-translate-y-1 transition-transform duration-200 h-full">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-dark/50 flex items-center justify-between min-h-[120px] h-full">
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-bold text-primary mb-2">إدارة الطلبات</h3>
              <p className="text-gray-600">عرض وتحديث الطلبات</p>
            </div>
            <div className="text-[#3b82f6] bg-[#e5f0ff] p-3 rounded-xl flex-shrink-0">
              <Truck className="w-8 h-8" />
            </div>
          </div>
        </Link>
        <Link href="/admin/users/add" className="block hover:-translate-y-1 transition-transform duration-200 h-full">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-dark/50 flex items-center justify-between min-h-[120px] h-full">
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-bold text-primary mb-2">إضافة أدمن</h3>
              <p className="text-gray-600">إضافة مستخدم جديد كأدمن</p>
            </div>
            <div className="text-[#f59e0b] bg-[#fef3c7] p-3 rounded-xl flex-shrink-0">
              <Users className="w-8 h-8" />
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-dark/50">
        <h2 className="text-xl font-bold mb-4 text-primary">أحدث الطلبات</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right p-2">رقم الطلب</th>
                <th className="text-right p-2">العميل</th>
                <th className="text-right p-2">الإجمالي</th>
                <th className="text-right p-2">الحالة</th>
                <th className="text-right p-2">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-3 text-center text-gray-600">
                    لا توجد طلبات حديثة.
                  </td>
                </tr>
              )}
              {recentOrders.map((order) => (
                <tr key={order.orderId || order.id || order.orderNumber} className="border-b">
                  <td className="p-2">{order.orderNumber}</td>
                  <td className="p-2">{order.customer || order.fullName || order.email || order.userId}</td>
                  <td className="p-2">
                    {order.total !== undefined
                      ? `${order.total} ج.م`
                      : order.totalAmount !== undefined
                        ? `${order.totalAmount} ج.م`
                        : "—"}
                  </td>
                  <td className="p-2">{order.status || order.statusText || "—"}</td>
                  <td className="p-2">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("ar-EG")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

