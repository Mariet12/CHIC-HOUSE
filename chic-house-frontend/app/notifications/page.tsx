"use client";

import React, { useState, useEffect } from "react";
import { notificationsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function NotificationsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchNotifications();
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsApi.getAll();
      if (response.data?.data?.items) {
        setNotifications(response.data.data.items);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      toast.success("تم تحديد الكل كمقروء");
      fetchNotifications();
    } catch (error) {
      toast.error("فشلت العملية");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationsApi.delete(id);
      toast.success("تم الحذف");
      fetchNotifications();
    } catch (error) {
      toast.error("فشل الحذف");
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12">جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">الإشعارات</h1>
        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light"
          >
            تحديد الكل كمقروء
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-primary-dark">لا توجد إشعارات</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-secondary-light p-6 rounded-lg shadow-md border border-secondary-dark ${
                !notification.isRead ? "border-r-4 border-primary" : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{notification.title}</h3>
                  <p className="text-gray-600 mt-2">{notification.message}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {new Date(notification.createdAt).toLocaleString("ar-EG")}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="px-3 py-1 bg-primary text-white rounded text-sm"
                    >
                      تحديد كمقروء
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

