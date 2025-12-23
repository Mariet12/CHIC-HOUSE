"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-primary text-secondary-light mt-20 bubble-text" dir="ltr">
      <div className="container mx-auto px-4 py-12" dir="rtl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 justify-items-end text-right">
          <div>
            <h2
              className="brand-title bubble-text text-2xl mb-4 text-brandSand font-extrabold"
              style={{ fontFamily: "var(--font-bubble), sans-serif" }}
            >
              CHIC HOUSE
            </h2>
            <p className="text-secondary-dark">
              متجرك المفضل للهدايا اليدوية وديكور المنزل
            </p>
            <p className="text-secondary-dark mt-2">
              لوحات حائط • ديكورات الكريسماس • ديكور منزلي
            </p>
          </div>
          
          <div className="bubble-text">
            <h3 className="font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li><Link href="/products" className="hover:text-secondary">المنتجات</Link></li>
              <li><Link href="/categories" className="hover:text-secondary">الأقسام</Link></li>
              <li><Link href="/portfolio" className="hover:text-secondary">أعمالنا</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">حسابي</h3>
            <ul className="space-y-2">
              <li><Link href="/profile" className="hover:text-secondary">الملف الشخصي</Link></li>
              <li><Link href="/orders" className="hover:text-secondary">طلباتي</Link></li>
              <li><Link href="/favorites" className="hover:text-secondary">المفضلة</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">تواصل معنا</h3>
            <p className="text-secondary-dark">البريد الإلكتروني: info@chichouse.com</p>
          </div>
        </div>
        
        <div className="border-t border-primary-light mt-8 pt-8 text-center">
          <p className="text-secondary-dark">
            © {new Date().getFullYear()} CHIC HOUSE. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}

