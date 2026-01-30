"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { cartApi } from "@/lib/api";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartItemsCount: number;
  totalAmount: number;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateCartItem: (cartItemId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const { token } = useAuth();

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const fetchCart = async () => {
    if (!token) return;

    try {
      const response = await cartApi.getCart();
      if (response.data?.data) {
        setCartItems(response.data.data.items || []);
        setTotalAmount(response.data.data.totalAmount || 0);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token]);

  const addToCart = async (productId: number, quantity: number) => {
    if (!token) {
      toast.error("Please login first");
      return;
    }

    try {
      await cartApi.addToCart({ productId, quantity });
      await fetchCart();
      toast.success("تمت الإضافة للسلة");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const updateCartItem = async (cartItemId: number, quantity: number) => {
    try {
      await cartApi.updateCartItem({ cartItemId, quantity });
      await fetchCart();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    try {
      await cartApi.removeFromCart(cartItemId);
      await fetchCart();
      toast.success("Removed from cart");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const clearCart = async () => {
    try {
      await cartApi.clearCart();
      await fetchCart();
      toast.success("Cart cleared");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartItemsCount,
        totalAmount,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

