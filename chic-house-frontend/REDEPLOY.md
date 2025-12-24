# إعادة نشر المشروع على Vercel (Redeployment)

## الطريقة الأولى: من Vercel Dashboard (الأسهل)

1. **افتحي [Vercel Dashboard](https://vercel.com/dashboard)**
2. **اختاري المشروع** `CHIC-HOUSE` أو `chic-house-frontend`
3. **روحي لـ "Deployments" tab**
4. **اضغطي على الـ 3 dots (⋯) بجانب آخر deployment**
5. **اختاري "Redeploy"**
6. **تأكدي من الـ Environment Variables:**
   - `NEXT_PUBLIC_API_URL` = `https://chic-house.runasp.net/api`
7. **اضغطي "Redeploy"**

## الطريقة الثانية: من GitHub (تلقائي)

**أي commit جديد على GitHub هيحفز deployment تلقائي:**

1. **عملي أي تغيير في الكود**
2. **اعملي commit و push:**
```bash
cd "C:\Users\marie\Desktop\HAND MADE"
git add .
git commit -m "Update code"
git push origin main
```
3. **Vercel هيعمل deployment تلقائياً** من الـ GitHub

## الطريقة الثالثة: من Vercel CLI

1. **ثبتي Vercel CLI:**
```bash
npm install -g vercel
```

2. **سجّلي دخول:**
```bash
vercel login
```

3. **اعملي redeploy:**
```bash
cd chic-house-frontend
vercel --prod
```

## تحديث Environment Variables

لو محتاجة تعدلي الـ Environment Variables:

1. **روحي لـ Project Settings → Environment Variables**
2. **عدّلي أو أضيفي:**
   - `NEXT_PUBLIC_API_URL` = `https://chic-house.runasp.net/api`
3. **بعد التعديل، لازم تعملي Redeploy** عشان التغييرات تظهر

## ملاحظات مهمة

- ✅ أي push على `main` branch هيحفز deployment تلقائي
- ✅ لو في مشاكل في الـ build، شوفي الـ logs في Vercel Dashboard
- ✅ الـ Environment Variables لازم تكون موجودة قبل الـ deployment
- ✅ بعد أي redeploy، تأكدي إن الموقع شغال صح

---

**الأسهل:** أي commit و push على GitHub = deployment تلقائي! 🚀

