import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => { success: boolean; message?: string };
  updateQuantity: (productId: string, quantity: number) => { success: boolean; message?: string };
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  itemCount: number;
  savings: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'ecomind_fresh_cart';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to local storage', e);
    }
  }, [cart]);

  const addToCart = (product: Product, quantity = 1): { success: boolean; message?: string } => {
    if (product.status === 'sold_out' || product.availableQuantity <= 0) {
      return { success: false, message: 'Sorry, this farm produce is currently sold out.' };
    }

    let addedSuccessfully = true;
    let feedback = 'Added to your fresh basket!';

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      const currentQtyInCart = existing ? existing.quantity : 0;
      const targetQty = currentQtyInCart + quantity;

      if (targetQty > product.availableQuantity) {
        addedSuccessfully = false;
        feedback = `Only ${product.availableQuantity} ${product.unit} available directly from the farm.`;
        return prev;
      }

      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: targetQty, product } // update product info
            : item
        );
      } else {
        return [...prev, { product, quantity }];
      }
    });

    return { success: addedSuccessfully, message: feedback };
  };

  const updateQuantity = (productId: string, quantity: number): { success: boolean; message?: string } => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return { success: true };
    }

    let updatedSuccessfully = true;
    let feedback = '';

    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          if (quantity > item.product.availableQuantity) {
            updatedSuccessfully = false;
            feedback = `Maximum harvest available is ${item.product.availableQuantity} ${item.product.unit}`;
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      });
    });

    return { success: updatedSuccessfully, message: feedback };
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  // Free delivery for orders >= ₹400, else flat ₹35 direct farm logistics fee
  const deliveryFee = subtotal >= 400 || subtotal === 0 ? 0 : 35;
  const totalAmount = subtotal + deliveryFee;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  // Calculate middleman markup savings (~30-40% savings vs supermarket)
  const savings = Math.round(subtotal * 0.28);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        deliveryFee,
        totalAmount,
        itemCount,
        savings
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
