# CHIC HOUSE - Frontend

متجر إلكتروني للأجهزة الإلكترونية مبني بـ Next.js 14

## المميزات

- ✅ تسجيل الدخول والتسجيل
- ✅ إدارة المنتجات والفئات
- ✅ سلة التسوق
- ✅ المفضلة
- ✅ الطلبات
- ✅ الإشعارات
- ✅ الدردشة (Chat)
- ✅ البحث
- ✅ معرض الأعمال (Portfolio)
- ✅ لوحة التحكم الإدارية

## التقنيات المستخدمة

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Hook Form
- Axios
- React Hot Toast
- Lucide React
- SignalR (للدردشة)

## التثبيت والتشغيل

1. تثبيت الحزم:
```bash
npm install
```

2. إعداد متغيرات البيئة:
أنشئ ملف `.env.local` وأضف:
```
NEXT_PUBLIC_API_URL=https://kerolosadel12-002-site1.qtempurl.com/api
```

3. تشغيل المشروع:
```bash
npm run dev
```

4. افتح المتصفح على:
```
http://localhost:3000
```

## البنية

```
chic-house-frontend/
├── app/                    # صفحات Next.js
│   ├── login/             # تسجيل الدخول
│   ├── register/          # التسجيل
│   ├── profile/           # الملف الشخصي
│   ├── products/          # المنتجات
│   ├── cart/              # السلة
│   ├── orders/            # الطلبات
│   ├── favorites/         # المفضلة
│   ├── notifications/     # الإشعارات
│   ├── chat/              # الدردشة
│   ├── search/            # البحث
│   ├── portfolio/         # معرض الأعمال
│   └── admin/             # لوحة التحكم
├── components/             # المكونات
│   ├── layout/           # Header, Footer
│   ├── products/         # ProductCard
│   └── home/             # Hero, FeaturedProducts
├── context/              # Context API
│   ├── AuthContext.tsx   # إدارة المصادقة
│   └── CartContext.tsx   # إدارة السلة
└── lib/                  # Utilities
    └── api.ts            # API Client
```

## الألوان

- Primary (Dark Brown): `#3D2817`
- Secondary (Beige): `#F5E6D3`
- Accent (Medium Brown): `#8B6F47`

## الخطوط

- Brand Font: Poppins (Bold, Rounded)
- Body Font: Inter

## API Endpoints

جميع الـ API endpoints موجودة في `lib/api.ts` وتتضمن:
- Products API
- Categories API
- Cart API
- Account API
- Orders API
- Favorites API
- Notifications API
- Chat API
- Search API
- Admin Dashboard API

## ملاحظات

- المشروع يستخدم RTL (Right-to-Left) للغة العربية
- جميع الصفحات محمية بـ Authentication (حسب الحاجة)
- يتم حفظ التوكن في localStorage
- يتم إرسال التوكن تلقائياً مع كل طلب API

