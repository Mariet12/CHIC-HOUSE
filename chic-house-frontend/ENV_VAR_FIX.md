# حل مشكلة Environment Variable

## الخطأ:
"The name contains invalid characters"

## الحل:

### 1. اكتبي الاسم يدوياً (مش copy/paste):

**اكتبي بالضبط كده:**
```
NEXT_PUBLIC_API_URL
```

### 2. تأكدي من:
- ✅ كل الحروف **capital (كبيرة)**
- ✅ استخدمي underscore `_` مش dash `-`
- ✅ مفيش مسافات قبل أو بعد
- ✅ مفيش حروف عربية

### 3. لو لسه فيه مشكلة:

**جربي الاسم ده بدلاً منه:**
```
NEXT_PUBLIC_API_BASE_URL
```

أو:
```
API_BASE_URL
```

**لكن الأفضل:** استخدمي `NEXT_PUBLIC_API_URL` واكتبيه يدوياً حرف بحرف.

---

## الخطوات الصحيحة:

1. **Key:** اكتبي `NEXT_PUBLIC_API_URL` (يدوياً)
2. **Value:** `https://chic-house.runasp.net/api`
3. **Environments:** Production + Preview
4. **Save**

---

**ملاحظة:** لو لسه فيه مشكلة، ممكن يكون في مشكلة في Vercel نفسه. جربي تعملي refresh للصفحة أو تسجلي دخول تاني.

