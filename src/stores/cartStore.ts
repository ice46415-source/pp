import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  notes?: string;
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  orderType: 'TABLE' | 'PREORDER' | 'DELIVERY' | null;
  addItem: (item: CartItem) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  setOrderType: (type: 'TABLE' | 'PREORDER' | 'DELIVERY') => void;
  getTotalAmount: () => number;
  placeOrder: (customerId: string, additionalData?: any) => Promise<string>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  restaurantId: null,
  orderType: null,

  addItem: (item) => {
    const state = get();
    if (state.restaurantId && state.restaurantId !== item.restaurantId) {
      if (!confirm('Adding items from a different restaurant will clear your cart. Continue?')) {
        return;
      }
      set({ items: [item], restaurantId: item.restaurantId });
    } else {
      const existing = state.items.find((i) => i.menuItemId === item.menuItemId);
      if (existing) {
        set({
          items: state.items.map((i) =>
            i.menuItemId === item.menuItemId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        });
      } else {
        set({ items: [...state.items, item], restaurantId: item.restaurantId });
      }
    }
  },

  removeItem: (menuItemId) => {
    const state = get();
    const newItems = state.items.filter((i) => i.menuItemId !== menuItemId);
    set({
      items: newItems,
      restaurantId: newItems.length > 0 ? state.restaurantId : null,
    });
  },

  updateQuantity: (menuItemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(menuItemId);
    } else {
      set({
        items: get().items.map((i) =>
          i.menuItemId === menuItemId ? { ...i, quantity } : i
        ),
      });
    }
  },

  clearCart: () => {
    set({ items: [], restaurantId: null, orderType: null });
  },

  setOrderType: (type) => {
    set({ orderType: type });
  },

  getTotalAmount: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  placeOrder: async (customerId, additionalData = {}) => {
    const state = get();
    if (state.items.length === 0 || !state.restaurantId || !state.orderType) {
      throw new Error('Cart is empty or order type not selected');
    }

    const subtotal = state.getTotalAmount();
    const serviceFee = 0;
    const deliveryFee = state.orderType === 'DELIVERY' ? 1500 : 0;
    const totalAmount = subtotal + serviceFee + deliveryFee;

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          restaurant_id: state.restaurantId,
          customer_id: customerId,
          order_type: state.orderType,
          subtotal,
          service_fee: serviceFee,
          delivery_fee: deliveryFee,
          total_amount: totalAmount,
          status: 'RECEIVED',
          ...additionalData,
        },
      ])
      .select()
      .single();

    if (orderError || !orderData) {
      throw new Error('Failed to create order');
    }

    for (const item of state.items) {
      const { data: menuItem } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', item.menuItemId)
        .maybeSingle();

      await supabase.from('order_items').insert([
        {
          order_id: orderData.id,
          menu_item_id: item.menuItemId,
          item_snapshot: menuItem || { name: item.name, price: item.price },
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity,
          notes: item.notes,
        },
      ]);
    }

    const orderCode = orderData.order_code;
    get().clearCart();
    return orderCode;
  },
}));