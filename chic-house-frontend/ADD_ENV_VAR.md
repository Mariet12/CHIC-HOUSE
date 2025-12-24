# إضافة Environment Variable في Vercel

## الخطوات بالتفصيل:

### 1. اضغطي على "Create new"

### 2. املئي البيانات:

**Key (الاسم):**
```
NEXT_PUBLIC_API_URL
```

**Value (القيمة):**
```
https://chic-house.runasp.net/api
```

**Note (اختياري - وصف):**
```
API Base URL for Chic House backend server
```

**Environments (اختر):**
- ✅ **Production** (مهم!)
- ✅ **Preview** (مهم!)
- ✅ **Development** (اختياري)

### 3. اضغطي "Save"

### 4. بعد الحفظ:

**مهم جداً:** Vercel هيقولك:
> "A new Deployment is required for your changes to take effect."

**اعملي Redeploy:**
1. روحي لـ "Deployments" tab
2. اضغطي على الـ 3 dots (⋯) بجانب آخر deployment
3. اضغطي "Redeploy"
4. انتظري حتى يكتمل الـ deployment

---

## التحقق من الإضافة:

بعد الـ Redeploy:
1. افتحي الموقع: `https://chic-house-three.vercel.app`
2. افتحي الـ Console (F12)
3. اكتبي: `console.log(process.env.NEXT_PUBLIC_API_URL)`
4. المفروض يطبع: `https://chic-house.runasp.net/api`

---

**ملاحظة:** لو نسيتي تعملي Redeploy، الـ Environment Variable مش هتشتغل!

