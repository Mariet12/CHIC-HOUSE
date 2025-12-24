# تحديث BaseURL للسيرفر الجديد

## الخطوات:

1. **افتحي ملف `.env.local`** في مجلد `chic-house-frontend`
   - لو الملف مش موجود، أنشئيه

2. **أضيفي السطر ده:**
```env
NEXT_PUBLIC_API_URL=https://[BASEURL_الجديد]/api
```

3. **مثال:**
```env
NEXT_PUBLIC_API_URL=https://kerolosadel12-002-site1.qtempurl.com/api
```

4. **احفظي الملف وأعدي تشغيل السيرفر:**
```bash
npm run dev
```

## ملاحظات:

- الـ `.env.local` مش موجود في الـ Git (مضاف في `.gitignore`)
- بعد التعديل، لازم تعيدي تشغيل السيرفر عشان التغييرات تظهر
- الكود هيستخدم الـ BaseURL من `.env.local` تلقائياً

---

**بعد ما Kerolos يبعتلك الـ BaseURL الجديد، ضيفيه في `.env.local`**

