import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          role: 'CUSTOMER' | 'STAFF' | 'MANAGER' | 'ADMIN';
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      restaurants: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          phone: string;
          address: string;
          town_city: string;
          opening_hours: any;
          delivery_zones: string | null;
          pre_order_lead_time_minutes: number;
          delivery_fee_amount: number;
          min_order_amount: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_code: string;
          restaurant_id: string;
          customer_id: string | null;
          table_id: string | null;
          address_id: string | null;
          order_type: 'TABLE' | 'PREORDER' | 'DELIVERY';
          status: 'RECEIVED' | 'IN_PREP' | 'READY' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'COMPLETED' | 'DELIVERED' | 'CANCELLED' | 'FAILED';
          scheduled_for: string | null;
          customer_name: string | null;
          customer_phone: string | null;
          delivery_address: any | null;
          subtotal: number;
          service_fee: number;
          delivery_fee: number;
          total_amount: number;
          notes: string | null;
          cancellation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};