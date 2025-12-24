# URL للـ CORS Configuration

## الـ Frontend URL اللي محتاج يضاف في الباك إند:

```
https://chic-house-2dvo320ge-mariet12s-projects.vercel.app
```

## الخطوات لـ Kerolos:

### 1. افتح ملف `Electro.Api/appsettings.json`

### 2. في قسم `AllowedOrigins`، أضيف الـ URL:

```json
"AllowedOrigins": [
  "http://localhost:5008",
  "http://localhost:5173",
  "http://localhost:3001",
  "http://localhost:3000",
  "https://elctroapp.runasp.net",
  "https://benevolent-daffodil-66e055.netlify.app",
  "https://kerolosadel12-002-site1.qtempurl.com",
  "https://eelctor-dash.vercel.app",
  "https://electro-style.net",
  "https://chic-house-2dvo320ge-mariet12s-projects.vercel.app"
]
```

### 3. بعد إضافة الـ URL:
- احفظ الملف
- أعد تشغيل الباك إند
- أو اعمل redeploy للباك إند

---

## ملاحظات:

- ✅ هذا هو الـ Preview URL من Vercel
- ✅ بعد ما Kerolos يضيفه، الموقع هيفتح صح
- ✅ لو في Production URL تاني، ممكن يضيفه كمان

---

**بعد ما Kerolos يضيف الـ URL، جربي الموقع:**
`https://chic-house-2dvo320ge-mariet12s-projects.vercel.app`

