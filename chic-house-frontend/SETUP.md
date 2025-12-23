# تعليمات التثبيت والتشغيل

## حل مشاكل TypeScript Errors

الأخطاء التي تظهر حالياً هي بسبب عدم تثبيت الحزم. لحل هذه المشاكل:

### 1. تثبيت الحزم

افتح Terminal في مجلد `chic-house-frontend` وقم بتشغيل:

```bash
npm install
```

أو إذا كان لديك مشكلة في PowerShell execution policy:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
npm install
```

### 2. بعد التثبيت

جميع الأخطاء المتعلقة بـ TypeScript و React types ستختفي تلقائياً.

### 3. تشغيل المشروع

```bash
npm run dev
```

### 4. إذا استمرت المشاكل

تأكد من:
- Node.js مثبت (الإصدار 18 أو أحدث)
- npm مثبت
- جميع الحزم في `package.json` موجودة

## ملاحظات

- ملف `.env.local` موجود بالفعل مع رابط API
- جميع الملفات لديها React imports صحيحة
- TypeScript config صحيح

