# خطوات رفع المشروع على Vercel

## 1. التسجيل في Vercel

1. افتحي [Vercel](https://vercel.com)
2. سجّلي بحساب GitHub
3. اضغطي على **"Add New Project"**

## 2. ربط المشروع

1. اختاري الـ repository `CHIC-HOUSE` من GitHub
2. Vercel هيكتشف تلقائياً إنه Next.js project
3. اضغطي **"Deploy"**

## 3. إعداد Environment Variables

قبل الـ Deploy، أضيفي الـ Environment Variable:

- **Name:** `NEXT_PUBLIC_API_URL`
- **Value:** `https://chic-house.runasp.net/api`

## 4. بعد الـ Deploy

بعد ما الـ deployment يكتمل:
1. خدي الـ URL اللي Vercel هيعطيكه (مثلاً: `https://chic-house-frontend.vercel.app`)
2. ابعتيه لـ Kerolos عشان يضيفه في `AllowedOrigins` في الباك إند

## 5. تحديث CORS في الباك إند

بعد ما تاخدي الـ URL من Vercel، Kerolos محتاج يضيفه في:
- `Electro.Api/appsettings.json` → `AllowedOrigins`

---

## إعادة النشر (Redeployment)

**بعد أول deployment، أي commit جديد على GitHub هيحفز deployment تلقائي!**

لعمل redeploy يدوي:
- روحي لـ Vercel Dashboard → Deployments → Redeploy

**للمزيد من التفاصيل:** شوفي ملف `REDEPLOY.md`

---

**ملاحظة:** الـ `.env.local` مش محتاج نرفعه، لأن Vercel هيسألك عن الـ Environment Variables أثناء الـ setup.

