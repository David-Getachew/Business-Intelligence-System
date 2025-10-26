import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

// Debug logging to see what Vite loaded
console.log('🔍 Supabase Init Debug:', {
  url: supabaseUrl,
  hasKey: Boolean(supabaseAnonKey),
  keyLength: supabaseAnonKey?.length,
  urlType: typeof supabaseUrl,
  keyType: typeof supabaseAnonKey,
});

// Safe initialization - don't crash if env vars missing
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

console.log('✅ isSupabaseConfigured:', isSupabaseConfigured);

// Log configuration status at startup
if (!isSupabaseConfigured) {
  console.error(
    '⚠️ Supabase not configured. Set VITE_PUBLIC_SUPABASE_URL and VITE_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  );
  console.error('Copy .env.example to .env.local and add your credentials');
  console.error('Current values:', {
    url: supabaseUrl || 'MISSING',
    key: supabaseAnonKey ? 'SET (length: ' + supabaseAnonKey.length + ')' : 'MISSING'
  });
}

// Create client only if configured, otherwise export null
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'owner' | 'staff';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: 'owner' | 'staff';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'owner' | 'staff';
          updated_at?: string;
        };
      };
      ingredients: {
        Row: {
          id: string;
          name: string;
          unit: string;
          reorder_point: number;
          supplier: string | null;
          created_at: string;
        };
      };
      inventory_on_hand: {
        Row: {
          ingredient_id: string;
          current_qty: number;
          last_updated: string;
        };
      };
      menu_items: {
        Row: {
          id: string;
          name: string;
          price: number;
          category: string;
          active: boolean;
          created_at: string;
        };
      };
      recipe_ingredients: {
        Row: {
          id: string;
          menu_item_id: string;
          ingredient_id: string;
          qty_per_item: number;
          created_at: string;
        };
      };
      sales: {
        Row: {
          id: string;
          sale_date: string;
          subtotal: number;
          tax: number;
          total: number;
          created_by: string;
          created_at: string;
        };
      };
      sale_line_items: {
        Row: {
          id: string;
          sale_id: string;
          menu_item_id: string;
          menu_item_name: string;
          quantity: number;
          unit_price: number;
          line_total: number;
          cogs: number | null;
          created_at: string;
        };
      };
      purchases: {
        Row: {
          id: string;
          purchase_date: string;
          ingredient_id: string;
          ingredient_name: string;
          quantity: number;
          unit_cost: number;
          total_cost: number;
          supplier: string | null;
          created_by: string;
          created_at: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          expense_date: string;
          category: string;
          amount: number;
          reference: string | null;
          notes: string | null;
          created_by: string;
          created_at: string;
        };
      };
      inventory_movements: {
        Row: {
          id: string;
          ingredient_id: string;
          movement_type: 'PURCHASE' | 'SALE' | 'ADJUST';
          qty_change: number;
          reference_type: string | null;
          reference_id: string | null;
          reason: string | null;
          created_by: string | null;
          created_at: string;
        };
      };
      daily_summaries: {
        Row: {
          id: string;
          day: string;
          revenue: number;
          cogs: number;
          gross_profit: number;
          operating_expense: number;
          net_profit: number;
          top_income_items: any;
          expense_by_category: any;
          created_at: string;
          updated_at: string;
        };
      };
      weekly_summaries: {
        Row: {
          id: string;
          week_start: string;
          week_end: string;
          total_revenue: number;
          total_cogs: number;
          total_gross_profit: number;
          total_operating_expense: number;
          total_net_profit: number;
          ai_analysis: string | null;
          pdf_url: string | null;
          created_at: string;
        };
      };
    };
    Functions: {
      process_sale: {
        Args: { payload: string };
        Returns: string;
      };
    };
  };
};

