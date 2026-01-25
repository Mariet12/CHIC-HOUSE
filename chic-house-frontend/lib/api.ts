import axios from "axios";

// Prefer .env override; fallback based on environment
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production' 
    ? "https://chic-house.runasp.net/api"
    : "http://localhost:5008/api");

// دالة مساعدة لتصحيح URL الصور
export function fixImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  
  // لو الـ URL كامل بالفعل (يبدأ بـ http:// أو https://)، نرجعه كما هو
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // لو الـ URL مش كامل، نستخدم الـ BaseURL من الـ environment
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 
    (process.env.NODE_ENV === 'production' 
      ? "https://chic-house.runasp.net/api"
      : "http://localhost:5008/api");
  
  // استخراج الـ base URL بدون /api
  let baseUrl = apiBaseUrl.replace('/api', '');
  
  // إضافة الـ imageUrl للـ base URL
  return `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for CORS with credentials
});

// إضافة التوكن تلقائياً للطلبات
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Log request for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log("API Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      hasToken: !!token,
    });
  }
  
  return config;
});

// معالجة الأخطاء
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error for debugging
    if (error.response) {
      console.error("API Error:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
      });
    } else if (error.request) {
      console.error("Network Error - No response received:", error.request);
    } else {
      console.error("Error:", error.message);
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ========== Products API ==========
export const productsApi = {
  getAll: (params?: any) => apiClient.get("/Products", { params }),
  getById: (id: number) => apiClient.get(`/Products/${id}`),
  getLatest: (take: number = 10) => apiClient.get(`/Products/latest?take=${take}`),
  getBestSelling: (take: number = 10, days?: number) => {
    const params = new URLSearchParams({ take: take.toString() });
    if (days) params.append("days", days.toString());
    return apiClient.get(`/Products/best-selling?${params}`);
  },
  // Admin
  create: (formData: FormData) =>
    apiClient.post("/Products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id: number, formData: FormData) =>
    apiClient.put(`/Products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id: number) => apiClient.delete(`/Products/${id}`),
};

// ========== Categories API ==========
export const categoriesApi = {
  getAll: (search?: string, page?: number, pageSize?: number) =>
    apiClient.get("/Category", { params: { search, page, pageSize } }),
  getById: (id: number) => apiClient.get(`/Category/${id}`),
  create: (formData: FormData) =>
    apiClient.post("/Category", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id: number, formData: FormData) =>
    apiClient.put(`/Category/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id: number) => apiClient.delete(`/Category/${id}`),
};

// ========== Cart API ==========
export const cartApi = {
  getCart: () => apiClient.get("/Cart"),
  addToCart: (data: { productId: number; quantity: number }) =>
    apiClient.post("/Cart/add", data),
  updateCartItem: (data: { cartItemId: number; quantity: number }) =>
    apiClient.put("/Cart/items", data),
  removeFromCart: (cartItemId: number) =>
    apiClient.delete(`/Cart/items/${cartItemId}`),
  clearCart: () => apiClient.delete("/Cart"),
};

// ========== Account API ==========
export const accountApi = {
  login: (data: { email: string; password: string }) =>
    apiClient.post("/Account/login", data),
  register: (formData: FormData) =>
    apiClient.post("/Account/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getUserInfo: () => apiClient.get("/Account/user-info"),
  updateUser: (formData: FormData) =>
    apiClient.put("/Account/update-user", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.put("/Account/change-password", data),
  forgotPassword: (data: { email: string }) =>
    apiClient.post("/Account/forgot-password", data),
  verifyOtp: (data: { email: string; otp: string }) =>
    apiClient.post("/Account/verify-otp", data),
  resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
    apiClient.put("/Account/reset-password", data),
  deleteUserImage: () => apiClient.delete("/Account/delete-image"),
  softDeleteUser: () => apiClient.post("/Account/delete"),
  getAllUsers: () => apiClient.get("/Account/all-users"),
};

// ========== Favorites API ==========
export const favoritesApi = {
  getAll: (pageNumber: number = 1, pageSize: number = 20) =>
    apiClient.get("/Favorites", { params: { pageNumber, pageSize } }),
  add: (productId: number) => apiClient.post(`/Favorites/${productId}`),
  remove: (productId: number) => apiClient.delete(`/Favorites/${productId}`),
  isFavorite: (productId: number) =>
    apiClient.get(`/Favorites/${productId}/is-favorite`),
};

// ========== Orders API ==========
export const ordersApi = {
  getAll: () => apiClient.get("/Orders"),
  getById: (id: number) => apiClient.get(`/Orders/${id}`),
  checkout: (data: any) => apiClient.post("/Orders/checkout", data),
  cancel: (orderId: number) => apiClient.put(`/Orders/${orderId}/cancel`),
  // Admin only
  getAllOrders: (status?: string, pageNumber?: number, pageSize?: number) =>
    apiClient.get("/Orders/admin/all", { params: { status, pageNumber, pageSize } }),
  updateStatus: (orderId: number, status: string) =>
    apiClient.put(`/Orders/${orderId}/status`, { status }),
  setPaymentStatus: (orderId: number, isPaid: boolean) =>
    apiClient.put(`/Orders/${orderId}/payment`, { isPaid }),
  togglePaymentStatus: (orderId: number) =>
    apiClient.put(`/Orders/${orderId}/toggle-payment`),
};

// ========== Notifications API ==========
export const notificationsApi = {
  getAll: (query?: any) => apiClient.get("/Notifications", { params: query }),
  getById: (id: number) => apiClient.get(`/Notifications/${id}`),
  markAsRead: (id: number) => apiClient.post(`/Notifications/${id}/read`),
  markAllAsRead: () => apiClient.post("/Notifications/read-all"),
  delete: (id: number) => apiClient.delete(`/Notifications/${id}`),
};

// ========== Chat API ==========
export const chatApi = {
  createConversation: (data: { senderId: string; receiverId: string }) =>
    apiClient.post("/Chat/create-conversation", data),
  getAllConversations: () => apiClient.get("/Chat/all-chats"),
  searchConversations: (term: string) =>
    apiClient.get("/Chat/search-conversations", { params: { term } }),
  sendMessage: (data: {
    conversationId: number;
    senderId: string;
    receiverId: string;
    content: string;
  }) => apiClient.post("/Chat/send-message", data),
  getMessages: (conversationId: number) =>
    apiClient.get(`/Chat/get-messages/${conversationId}`),
  markAllAsRead: (data: { conversationId: number; userId: string }) =>
    apiClient.post("/Chat/mark-all-messages-as-read", data),
  getUnreadCount: () => apiClient.get("/Chat/unread-chats-count"),
};

// ========== Banners API ==========
export const bannersApi = {
  getActive: () => apiClient.get("/admin/banners/active"),
  getAll: () => apiClient.get("/admin/banners/all"),
  getById: (id: number) => apiClient.get(`/admin/banners/${id}`),
  create: (formData: FormData) =>
    apiClient.post("/admin/banners", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id: number, formData: FormData) =>
    apiClient.put(`/admin/banners/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  toggle: (id: number) => apiClient.patch(`/admin/banners/${id}/toggle`),
  delete: (id: number) => apiClient.delete(`/admin/banners/${id}`),
};

// ========== Portfolio API ==========
export const portfolioApi = {
  getAll: () => apiClient.get("/Portfolio"),
  getById: (id: number) => apiClient.get(`/Portfolio/${id}`),
  create: (formData: FormData) =>
    apiClient.post("/Portfolio", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id: number, formData: FormData) =>
    apiClient.put(`/Portfolio/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id: number) => apiClient.delete(`/Portfolio/${id}`),
};

// ========== Search API ==========
export const searchApi = {
  search: (params: {
    q: string;
    areas?: string[];
    page?: number;
    pageSize?: number;
  }) => apiClient.get("/search", { params }),
};

// ========== Admin Dashboard API ==========
export const adminDashboardApi = {
  getSummary: (from?: string, to?: string) =>
    apiClient.get("/admin/dashboard/summary", { params: { from, to } }),
  getRecentOrders: (take: number = 5) =>
    apiClient.get("/admin/dashboard/recent-orders", { params: { take } }),
  getSalesSeries: (from?: string, to?: string) =>
    apiClient.get("/admin/dashboard/sales-series", { params: { from, to } }),
  getOrdersStatus: (from?: string, to?: string) =>
    apiClient.get("/admin/dashboard/orders-status", { params: { from, to } }),
  getTopProducts: (from?: string, to?: string, take: number = 5) =>
    apiClient.get("/admin/dashboard/top-products", {
      params: { from, to, take },
    }),
  getCategoriesSummary: () =>
    apiClient.get("/admin/dashboard/categories-summary"),
  getPaymentsStats: (from?: string, to?: string) =>
    apiClient.get("/admin/dashboard/payments-stats", { params: { from, to } }),
  getOrdersPage: (params: any) =>
    apiClient.get("/admin/dashboard/orders", { params }),
  getCustomers: (params: any) =>
    apiClient.get("/admin/dashboard/customers", { params }),
  getCustomerDetails: (userId: string, fromUtc?: string, toUtc?: string) =>
    apiClient.get(`/admin/dashboard/${userId}`, { params: { fromUtc, toUtc } }),
};

// ========== Admin Contact API ==========
export const adminContactApi = {
  submit: (data: any) => apiClient.post("/admin/contact/submit", data),
  getById: (id: number) => apiClient.get(`/admin/contact/${id}`),
  getAll: (params: any) => apiClient.get("/admin/contact", { params }),
  reply: (id: number, data: any) =>
    apiClient.post(`/admin/contact/${id}/reply`, data),
  delete: (id: number) => apiClient.delete(`/admin/contact/${id}`),
};

// ========== Admin Communication Methods API ==========
export const adminCommunicationApi = {
  getAll: () => apiClient.get("/admin/communication-methods"),
  getById: (id: number) => apiClient.get(`/admin/communication-methods/${id}`),
  create: (data: any) => apiClient.post("/admin/communication-methods", data),
  update: (id: number, data: any) =>
    apiClient.put(`/admin/communication-methods/${id}`, data),
  delete: (id: number) => apiClient.delete(`/admin/communication-methods/${id}`),
};

// ========== Roles API ==========
export const rolesApi = {
  getAll: () => apiClient.get("/Roles"),
  getById: (id: string) => apiClient.get(`/Roles/${id}`),
  create: (roleName: string) => apiClient.post("/Roles", roleName),
  update: (id: string, newRoleName: string) =>
    apiClient.put(`/Roles/${id}`, newRoleName),
  delete: (id: string) => apiClient.delete(`/Roles/${id}`),
};

export default apiClient;

