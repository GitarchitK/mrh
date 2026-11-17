import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreProduct, CartItem } from '../types';
import { formatPaiseToINR } from '../lib/money';
import { createWhatsAppUrl } from '../lib/whatsapp';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: StoreProduct, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  totalItems: number;
  cartSubtotalPaise: number;
  cartMrpPaise: number;
  cartSavingsPaise: number;
  isCartOpen: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  generateWhatsAppOrderUrl: (deliveryMode: 'pickup' | 'delivery', customerNotes?: string) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'mrh_store_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // Ignored
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      // Ignored
    }
  }, [cart]);

  const addToCart = (product: StoreProduct, qty: number = 1) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.product.id === product.id);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + qty,
        };
        return next;
      } else {
        return [...prev, { product, quantity: qty }];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartSubtotalPaise = cart.reduce(
    (sum, item) => sum + item.product.pricePaise * item.quantity,
    0
  );

  const cartMrpPaise = cart.reduce(
    (sum, item) => sum + item.product.mrpPaise * item.quantity,
    0
  );

  const cartSavingsPaise = Math.max(0, cartMrpPaise - cartSubtotalPaise);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const generateWhatsAppOrderUrl = (
    deliveryMode: 'pickup' | 'delivery' = 'pickup',
    customerNotes: string = ''
  ): string => {
    if (cart.length === 0) {
      return createWhatsAppUrl('Hello Debasish, I would like to enquire about products at Mobile Repairing House.');
    }

    const lines: string[] = [
      '🛒 *NEW STORE ORDER — MOBILE REPAIRING HOUSE*',
      '----------------------------------------',
      `📍 *Order Mode:* ${deliveryMode === 'pickup' ? 'Counter Pickup at Bhajan Complex, Dunlop' : 'Express Local Delivery (Kolkata/Dunlop)'}`,
      '',
      '*Ordered Items:*',
    ];

    cart.forEach((item, idx) => {
      lines.push(
        `${idx + 1}. *${item.product.name}*` +
        `\n   Qty: ${item.quantity} x ${formatPaiseToINR(item.product.pricePaise)} = ${formatPaiseToINR(item.product.pricePaise * item.quantity)}`
      );
    });

    lines.push('');
    lines.push('----------------------------------------');
    lines.push(`💰 *Total Amount Payable:* ${formatPaiseToINR(cartSubtotalPaise)}`);
    if (cartSavingsPaise > 0) {
      lines.push(`🎉 *Total Customer Savings:* ${formatPaiseToINR(cartSavingsPaise)}`);
    }

    if (customerNotes.trim()) {
      lines.push('');
      lines.push(`📝 *Customer Notes:* ${customerNotes.trim()}`);
    }

    lines.push('');
    lines.push('Please confirm stock availability and pickup/delivery timing. Thank you!');

    return createWhatsAppUrl(lines.join('\n'));
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        totalItems: cartCount,
        cartSubtotalPaise,
        cartMrpPaise,
        cartSavingsPaise,
        isCartOpen,
        isOpen: isCartOpen,
        openCart,
        closeCart,
        generateWhatsAppOrderUrl,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
