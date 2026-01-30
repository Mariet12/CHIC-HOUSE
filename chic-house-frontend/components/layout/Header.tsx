"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Heart, User, Menu, Search, MessageCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Header() {
  const { cartItemsCount } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-primary shadow-md sticky top-0 z-50 border-b border-secondary-dark" dir="ltr" style={{ overflow: 'visible' }}>
      <div className="container mx-auto px-4" style={{ overflow: 'visible' }}>
        <div className="flex items-center justify-between h-24 py-2 relative" style={{ overflow: 'visible' }}>
          {/* Logo - صورة اللوجو الكاملة */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img
              src="/logo/chic-house-logo.png.png"
              alt="CHIC HOUSE"
              style={{ height: "90px", width: "auto", display: "block" }}
              className="object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent && !parent.querySelector(".logo-fallback")) {
                  const fallback = document.createElement("h1");
                  fallback.className = "logo-fallback brand-title text-2xl md:text-3xl";
                  fallback.style.color = "#3D2817";
                  fallback.textContent = "CHIC HOUSE";
                  parent.appendChild(fallback);
                }
              }}
            />
          </Link>

          {/* شريط البحث */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن هدية أو قطعة ديكور..."
                className="w-full px-4 py-2 pl-10 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-right"
              />
              <button type="submit" className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Search className="text-primary w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Icons */}
          <div className="flex items-center gap-6">
            <Link href="/favorites" className="relative">
              <Heart className="w-6 h-6 text-brandSand" />
            </Link>

            <Link href="/chat" className="relative">
              <MessageCircle className="w-6 h-6 text-brandSand" />
            </Link>
            
            <Link href="/cart" className="relative">
              <ShoppingCart className="w-6 h-6 text-brandSand" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative" ref={menuRef} style={{ position: 'relative', zIndex: 1000 }}>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 hover:bg-secondary rounded-full transition-colors"
                  aria-label="قائمة المستخدم"
                >
                  <User className="w-6 h-6 text-brandSand" />
                </button>
                {isMenuOpen && (
                  <>
                    {/* Backdrop to close menu on click outside */}
                    <div 
                      className="fixed inset-0 z-[9998]"
                      onClick={() => setIsMenuOpen(false)}
                    />
                    {/* Menu */}
                    <div 
                      className="absolute top-full mt-2 bg-white rounded-lg shadow-2xl border-2 border-secondary-dark z-[9999]"
                      style={{ 
                        width: '240px',
                        minWidth: '240px',
                        maxWidth: 'none',
                        position: 'absolute',
                        display: 'block',
                        overflow: 'visible',
                        whiteSpace: 'nowrap',
                        right: 0,
                        left: 'auto'
                      }}
                    >
                      <div className="py-2" style={{ overflow: 'visible' }}>
                        {user?.role === "Admin" && (
                          <>
                            <Link 
                              href="/admin/dashboard"
                              className="block px-5 py-3 hover:bg-secondary text-left text-primary transition-colors whitespace-nowrap"
                              onClick={() => setIsMenuOpen(false)}
                              style={{ overflow: 'visible', textOverflow: 'clip' }}
                            >
                              لوحة تحكم الأدمن
                            </Link>
                            <div className="border-t border-secondary-dark my-1"></div>
                          </>
                        )}
                        <Link 
                          href="/profile" 
                          className="block px-5 py-3 hover:bg-secondary text-left text-primary transition-colors whitespace-nowrap" 
                          onClick={() => setIsMenuOpen(false)}
                          style={{ overflow: 'visible', textOverflow: 'clip' }}
                        >
                          حسابي
                        </Link>
                        <Link 
                          href="/orders" 
                          className="block px-5 py-3 hover:bg-secondary text-left text-primary transition-colors whitespace-nowrap" 
                          onClick={() => setIsMenuOpen(false)}
                          style={{ overflow: 'visible', textOverflow: 'clip' }}
                        >
                          طلباتي
                        </Link>
                        <Link 
                          href="/notifications" 
                          className="block px-5 py-3 hover:bg-secondary text-left text-primary transition-colors whitespace-nowrap" 
                          onClick={() => setIsMenuOpen(false)}
                          style={{ overflow: 'visible', textOverflow: 'clip' }}
                        >
                          الإشعارات
                        </Link>
                        <div className="border-t border-secondary-dark my-1"></div>
                        <button
                          onClick={() => {
                            logout();
                            setIsMenuOpen(false);
                          }}
                          className="block w-full text-left px-5 py-3 hover:bg-secondary text-primary transition-colors whitespace-nowrap"
                          style={{ overflow: 'visible', textOverflow: 'clip' }}
                        >
                          تسجيل الخروج
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login" className="p-2 hover:bg-secondary rounded-full transition-colors">
                <User className="w-6 h-6 text-brandSand" />
              </Link>
            )}

            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="w-6 h-6 text-primary" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

