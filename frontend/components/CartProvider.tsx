'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem as CartItemType } from '@/lib/mockData';

interface CartContextType {
  cartItems: CartItemType[];
  cartCount: number;
  addToCart: (item: CartItemType) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse cart');
      }
    }
  }, []);

  const saveCart = (items: CartItemType[]) => {
    setCartItems(items);
    localStorage.setItem('cart', JSON.stringify(items));
  };

  const addToCart = (item: CartItemType) => {
    const existingIndex = cartItems.findIndex(i => 
      i.pizzaId === item.pizzaId && 
      i.size === item.size && 
      i.crust === item.crust && 
      JSON.stringify(i.toppings) === JSON.stringify(item.toppings)
    );

    if (existingIndex >= 0) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += item.quantity;
      saveCart(updated);
    } else {
      saveCart([...cartItems, item]);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    saveCart(cartItems.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const removeFromCart = (id: string) => {
    saveCart(cartItems.filter(item => item.id !== id));
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, cartCount, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
