# تصحيح Environment Variable في Vercel

## المشكلة:
- ❌ الـ Name: `API_URL` (غلط!)
- ❌ الـ Value: `https://chic-house.runasp.net/` (ناقص `/api`)

## الحل:

### 1. احذفي الـ Environment Variable الحالي:
- روحي لـ Vercel Dashboard → Settings → Environment Variables
- اضغطي على الـ 3 dots بجانب `API_URL`
- اضغطي "Delete"

### 2. أضيفي الـ Environment Variable الصحيح:

**Name (الاسم):**
```
NEXT_PUBLIC_API_URL
```
⚠️ **مهم:** لازم يبدأ بـ `NEXT_PUBLIC_` عشان يشتغل في Next.js!

**Value (القيمة):**
```
https://chic-house.runasp.net/api
```
⚠️ **مهم:** لازم ينتهي بـ `/api`!

**Comment:**
```
API Base URL for Chic House backend server
```

**Environments:**
- ✅ Production
- ✅ Preview
- ✅ Development (اختياري)

### 3. بعد الحفظ:
- **مهم جداً:** اعملي Redeploy!
- روحي لـ Deployments → اضغطي على الـ 3 dots → Redeploy

---

## لماذا `NEXT_PUBLIC_`؟

في Next.js، Environment Variables اللي عايزين نستخدمها في الـ client-side (في المتصفح) لازم تبدأ بـ `NEXT_PUBLIC_` عشان Next.js يعرضها في الـ browser.

بدون `NEXT_PUBLIC_`، الـ variable مش هتظهر في الـ client-side!

---

## التحقق:
بعد الـ Redeploy:
1. افتحي الموقع: `https://chic-house-three.vercel.app`
2. افتحي الـ Console (F12)
3. اكتبي: `console.log(process.env.NEXT_PUBLIC_API_URL)`
4. المفروض يطبع: `https://chic-house.runasp.net/api`

