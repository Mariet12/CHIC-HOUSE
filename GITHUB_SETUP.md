# خطوات رفع المشروع على GitHub

## 1. إنشاء Repository على GitHub

1. افتحي [GitHub](https://github.com)
2. اضغطي على **"+"** في الأعلى → **"New repository"**
3. الاسم: `chic-house`
4. اختاري **Public** أو **Private**
5. **لا تضيفي** README أو .gitignore (موجودين بالفعل)
6. اضغطي **"Create repository"**

## 2. ربط المشروع بـ GitHub

بعد إنشاء الـ repository، شغّلي الأوامر دي في Terminal:

```bash
cd "C:\Users\marie\Desktop\HAND MADE"
git remote add origin https://github.com/[YOUR_USERNAME]/chic-house.git
git push -u origin main
```

**مهم:** استبدلي `[YOUR_USERNAME]` بـ username بتاعك على GitHub

## 3. مثال

لو username بتاعك `marie123`:

```bash
git remote add origin https://github.com/marie123/chic-house.git
git push -u origin main
```

## 4. التحقق

بعد الـ push، افتحي الـ repository على GitHub وتأكدي إن كل الملفات موجودة.

---

**ملاحظة:** لو طلبت منك GitHub username و password، استخدمي **Personal Access Token** بدل password.

لعمل Token:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token
3. اختر الصلاحيات: `repo`
4. انسخي الـ token واستخدميه كـ password

