"use client";

import React, { useState, useEffect } from "react";
import { portfolioApi } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";

export default function PortfolioPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await portfolioApi.getAll();
      if (response.data?.data) {
        setItems(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12">جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-secondary-light">
      <h1 className="text-3xl font-bold mb-8 text-primary text-center">معرض الأعمال</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-secondary-light rounded-lg shadow-md overflow-hidden border border-secondary-dark">
            {item.imageUrl && (
              <div className="relative h-64">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">{item.name}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

