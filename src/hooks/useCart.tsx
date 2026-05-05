import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, OrderItem } from '../types';

interface CartContextType {
  items: OrderItem[];
  addItem: (product: Product, quantity: number, observations?: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<OrderItem[]>([]);

  const addItem = (product: Product, quantity: number, observations?: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) => 
          i.productId === product.id 
            ? { ...i, quantity: i.quantity + quantity, observations: observations || i.observations } 
            : i
        );
      }
      return [...prev, { 
        productId: product.id, 
        name: product.name, 
        quantity, 
        price: product.price,
        observations: observations || ""
      }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total }}>
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
