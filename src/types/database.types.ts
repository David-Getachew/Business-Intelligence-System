export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string | null
          actor_id: string | null
          actor_type: string | null
          changes: Json | null
          created_at: string | null
          id: number
          notes: string | null
          object_id: number | null
          object_type: string | null
        }
        Insert: {
          action?: string | null
          actor_id?: string | null
          actor_type?: string | null
          changes?: Json | null
          created_at?: string | null
          id?: number
          notes?: string | null
          object_id?: number | null
          object_type?: string | null
        }
        Update: {
          action?: string | null
          actor_id?: string | null
          actor_type?: string | null
          changes?: Json | null
          created_at?: string | null
          id?: number
          notes?: string | null
          object_id?: number | null
          object_type?: string | null
        }
      }
      daily_summaries: {
        Row: {
          category_totals: Json | null
          created_at: string | null
          day: string
          gross_profit: number | null
          id: number
          net_profit: number | null
          operating_expense: number | null
          top_expense_items: Json | null
          top_income_items: Json | null
          total_cogs: number | null
          total_revenue: number | null
        }
        Insert: {
          category_totals?: Json | null
          created_at?: string | null
          day: string
          gross_profit?: number | null
          id?: number
          net_profit?: number | null
          operating_expense?: number | null
          top_expense_items?: Json | null
          top_income_items?: Json | null
          total_cogs?: number | null
          total_revenue?: number | null
        }
        Update: {
          category_totals?: Json | null
          created_at?: string | null
          day?: string
          gross_profit?: number | null
          id?: number
          net_profit?: number | null
          operating_expense?: number | null
          top_expense_items?: Json | null
          top_income_items?: Json | null
          total_cogs?: number | null
          total_revenue?: number | null
        }
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          created_by: string | null
          expense_date: string | null
          id: number
          notes: string | null
          reference: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          created_by?: string | null
          expense_date?: string | null
          id?: number
          notes?: string | null
          reference?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          created_by?: string | null
          expense_date?: string | null
          id?: number
          notes?: string | null
          reference?: string | null
        }
      }
      ingredients: {
        Row: {
          active: boolean | null
          base_unit: string
          created_at: string | null
          id: number
          name: string
          reorder_point: number | null
          unit_conversion: number | null
        }
        Insert: {
          active?: boolean | null
          base_unit: string
          created_at?: string | null
          id?: number
          name: string
          reorder_point?: number | null
          unit_conversion?: number | null
        }
        Update: {
          active?: boolean | null
          base_unit?: string
          created_at?: string | null
          id?: number
          name?: string
          reorder_point?: number | null
          unit_conversion?: number | null
        }
      }
      inventory_movements: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: number
          ingredient_id: number | null
          movement_type: string
          notes: string | null
          qty: number
          ref_id: number | null
          ref_table: string | null
          unit_cost: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: number
          ingredient_id?: number | null
          movement_type: string
          notes?: string | null
          qty: number
          ref_id?: number | null
          ref_table?: string | null
          unit_cost?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: number
          ingredient_id?: number | null
          movement_type?: string
          notes?: string | null
          qty?: number
          ref_id?: number | null
          ref_table?: string | null
          unit_cost?: number | null
        }
      }
      inventory_on_hand: {
        Row: {
          avg_unit_cost: number | null
          ingredient_id: number
          last_updated: string | null
          qty_on_hand: number | null
        }
        Insert: {
          avg_unit_cost?: number | null
          ingredient_id: number
          last_updated?: string | null
          qty_on_hand?: number | null
        }
        Update: {
          avg_unit_cost?: number | null
          ingredient_id?: number
          last_updated?: string | null
          qty_on_hand?: number | null
        }
      }
      menu_items: {
        Row: {
          active: boolean | null
          category: string | null
          created_at: string | null
          id: number
          name: string
          price: number
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          id?: number
          name: string
          price?: number
        }
        Update: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          id?: number
          name?: string
          price?: number
        }
      }
      purchases: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: number
          ingredient_id: number
          purchase_date: string | null
          qty: number
          supplier_id: number | null
          total_cost: number
          unit_cost: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: number
          ingredient_id: number
          purchase_date?: string | null
          qty: number
          supplier_id?: number | null
          total_cost: number
          unit_cost: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: number
          ingredient_id?: number
          purchase_date?: string | null
          qty?: number
          supplier_id?: number | null
          total_cost?: number
          unit_cost?: number
        }
      }
      recipe_ingredients: {
        Row: {
          id: number
          ingredient_id: number
          menu_item_id: number
          qty_per_item: number
        }
        Insert: {
          id?: number
          ingredient_id: number
          menu_item_id: number
          qty_per_item: number
        }
        Update: {
          id?: number
          ingredient_id?: number
          menu_item_id?: number
          qty_per_item?: number
        }
      }
      sale_line_items: {
        Row: {
          cogs: number | null
          created_at: string | null
          id: number
          line_total: number
          menu_item_id: number
          qty: number
          sale_id: number
          unit_price: number
        }
        Insert: {
          cogs?: number | null
          created_at?: string | null
          id?: number
          line_total: number
          menu_item_id: number
          qty: number
          sale_id: number
          unit_price: number
        }
        Update: {
          cogs?: number | null
          created_at?: string | null
          id?: number
          line_total?: number
          menu_item_id?: number
          qty?: number
          sale_id?: number
          unit_price?: number
        }
      }
      sales: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: number
          payment_method: string | null
          sale_date: string | null
          total: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: number
          payment_method?: string | null
          sale_date?: string | null
          total: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: number
          payment_method?: string | null
          sale_date?: string | null
          total?: number
        }
      }
      suppliers: {
        Row: {
          contact: Json | null
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          contact?: Json | null
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          contact?: Json | null
          created_at?: string | null
          id?: number
          name?: string
        }
      }
      supplier_ingredients: {
        Row: {
          contact_info: Json | null
          default_pack_qty: number | null
          id: number
          ingredient_id: number
          supplier_id: number
        }
        Insert: {
          contact_info?: Json | null
          default_pack_qty?: number | null
          id?: number
          ingredient_id: number
          supplier_id: number
        }
        Update: {
          contact_info?: Json | null
          default_pack_qty?: number | null
          id?: number
          ingredient_id?: number
          supplier_id?: number
        }
      }
      weekly_summaries: {
        Row: {
          analysis: string | null
          created_at: string | null
          gross_profit: number | null
          id: number
          net_profit: number | null
          operating_expense: number | null
          pdf_url: string | null
          top_expense_items: Json | null
          top_income_items: Json | null
          total_cogs: number | null
          total_revenue: number | null
          week_end: string
          week_start: string
        }
        Insert: {
          analysis?: string | null
          created_at?: string | null
          gross_profit?: number | null
          id?: number
          net_profit?: number | null
          operating_expense?: number | null
          pdf_url?: string | null
          top_expense_items?: Json | null
          top_income_items?: Json | null
          total_cogs?: number | null
          total_revenue?: number | null
          week_end: string
          week_start: string
        }
        Update: {
          analysis?: string | null
          created_at?: string | null
          gross_profit?: number | null
          id?: number
          net_profit?: number | null
          operating_expense?: number | null
          pdf_url?: string | null
          top_expense_items?: Json | null
          top_income_items?: Json | null
          total_cogs?: number | null
          total_revenue?: number | null
          week_end?: string
          week_start?: string
        }
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          settings: Json | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          settings?: Json | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          settings?: Json | null
        }
      }
      reconciliation_logs: {
        Row: {
          actual_qty: number | null
          created_at: string | null
          diff: number | null
          expected_qty: number | null
          id: number
          ingredient_id: number | null
          notes: string | null
          status: string | null
          tolerance: number | null
        }
        Insert: {
          actual_qty?: number | null
          created_at?: string | null
          diff?: number | null
          expected_qty?: number | null
          id?: number
          ingredient_id?: number | null
          notes?: string | null
          status?: string | null
          tolerance?: number | null
        }
        Update: {
          actual_qty?: number | null
          created_at?: string | null
          diff?: number | null
          expected_qty?: number | null
          id?: number
          ingredient_id?: number | null
          notes?: string | null
          status?: string | null
          tolerance?: number | null
        }
      }
    }
    Views: {
      current_user_profile: {
        Row: {
          id: string | null
          role: string | null
        }
      }
    }
    Functions: {
      handle_purchase: {
        Args: { purchase_id: number }
        Returns: undefined
      }
      process_sale: {
        Args: { payload: Json }
        Returns: Json
      }
      upsert_daily_summary: {
        Args: {
          p_category_totals: Json
          p_day: string
          p_gross_profit: number
          p_net_profit: number
          p_operating_expense: number
          p_top_expense_items: Json
          p_top_income_items: Json
          p_total_cogs: number
          p_total_revenue: number
        }
        Returns: undefined
      }
    }
    Enums: {}
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

