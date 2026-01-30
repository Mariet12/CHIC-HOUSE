"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Hero() {
  const [imageError, setImageError] = useState(false);

  return (
    <section className="relative min-h-[70vh] bg-brandSand flex items-center justify-center">
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center justify-center gap-12">
          {!imageError ? (
            <div className="flex justify-center w-full">
              <img
                src="/logo/chic-house-logo.png.png"
                alt="CHIC HOUSE Logo"
                onError={() => setImageError(true)}
                style={{
                  maxWidth: "720px",
                  width: "90vw",
                  height: "auto",
                  display: "block",
                }}
                className="object-contain"
              />
            </div>
          ) : (
            <div className="text-center p-8 border-2 border-dashed border-primary rounded-lg">
              <p className="text-primary-dark mb-2">⚠️ الصورة غير موجودة</p>
              <p className="text-sm text-primary-light">
                ضع الصورة في:{" "}
                <code className="bg-secondary px-2 py-1 rounded">
                  public/logo/chic-house-logo.png
                </code>
              </p>
            </div>
          )}
          
          {/* زر البدء بالتسوق */}
          <div className="flex justify-center">
            <Link
              href="/products"
              className="px-14 py-5 bg-primary text-white rounded-lg font-bold text-xl hover:bg-primary-light transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 animate-bounce hover:animate-none"
            >
              ابدأ التسوق
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

