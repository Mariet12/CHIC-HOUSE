# Chic House - متجر الهدايا والديكورات المنزلية

متجر إلكتروني متكامل للهدايا المصنوعة يدوياً وديكورات المنزل والمناسبات.

## 🚀 المميزات

- **واجهة عربية كاملة** - تصميم متجاوب يعمل على جميع الأجهزة
- **لوحة تحكم للأدمن** - إدارة كاملة للمنتجات والأقسام والطلبات
- **نظام تسوق متكامل** - سلة التسوق، المفضلة، والطلبات
- **نظام البحث** - بحث متقدم في المنتجات
- **نظام الإشعارات** - إشعارات فورية للمستخدمين
- **نظام المحادثة** - تواصل مباشر مع العملاء

## 🛠️ التقنيات المستخدمة

### Frontend
- **Next.js 14** - React Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **React Context** - State Management
- **Axios** - API Calls

### Backend
- **ASP.NET Core 8** - Web API
- **Entity Framework Core** - ORM
- **SQL Server** - Database
- **JWT** - Authentication
- **SignalR** - Real-time Communication

## 📁 هيكل المشروع

```
chic-house/
├── chic-house-frontend/     # Next.js Frontend
│   ├── app/                  # Pages & Routes
│   ├── components/           # React Components
│   ├── context/              # Context Providers
│   └── lib/                  # Utilities & API
│
└── Electro.Api/             # ASP.NET Core Backend
    ├── Controllers/          # API Controllers
    ├── wwwroot/             # Static Files
    └── appsettings.json     # Configuration
```

## 🚀 البدء السريع

### Frontend Setup

```bash
cd chic-house-frontend
npm install
npm run dev
```

الموقع سيعمل على: `http://localhost:3000`

### Backend Setup

1. افتحي المشروع في Visual Studio
2. عدّلي `appsettings.json` بإعدادات قاعدة البيانات
3. شغّلي المشروع

الـ API سيعمل على: `http://localhost:5008/api`

## 📝 ملاحظات

- تأكدي من إعداد متغيرات البيئة في `.env.local` للـ Frontend
- راجعي `appsettings.json` في الـ Backend لإعدادات قاعدة البيانات
- الصور تُحفظ في `wwwroot/uploads/` في الـ Backend

## 👤 الحسابات الافتراضية

- **Admin**: استخدم حساب Admin للوصول إلى لوحة التحكم
- **User**: سجّلي حساب جديد كعميل عادي

## 📄 الترخيص

هذا المشروع خاص بـ Chic House.

---

Made with ❤️ for Chic House

