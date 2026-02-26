export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: "admin" | "staff";
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: "admin" | "staff";
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: "admin" | "staff";
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          email: string | null;
          notes: string | null;
          order_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          notes?: string | null;
          order_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          notes?: string | null;
          order_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          display_order?: number;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          base_price: number;
          is_active: boolean;
          prep_time_hours: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          base_price: number;
          is_active?: boolean;
          prep_time_hours?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          name?: string;
          description?: string | null;
          base_price?: number;
          is_active?: boolean;
          prep_time_hours?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      ingredients: {
        Row: {
          id: string;
          name: string;
          unit: string;
          unit_cost: number | null;
          supplier: string | null;
          min_stock_level: number | null;
          current_stock: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          unit: string;
          unit_cost?: number | null;
          supplier?: string | null;
          min_stock_level?: number | null;
          current_stock?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          unit?: string;
          unit_cost?: number | null;
          supplier?: string | null;
          min_stock_level?: number | null;
          current_stock?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: number;
          customer_id: string | null;
          status: "pending" | "confirmed" | "in_progress" | "ready" | "completed" | "cancelled";
          source: "call" | "text" | "dm_instagram" | "dm_facebook" | "walk_in" | "website" | "other";
          order_date: string;
          delivery_date: string;
          delivery_time_slot: string | null;
          is_delivery: boolean;
          delivery_address: string | null;
          subtotal: number;
          tax: number;
          total: number;
          deposit_paid: number;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: number;
          customer_id?: string | null;
          status?: "pending" | "confirmed" | "in_progress" | "ready" | "completed" | "cancelled";
          source: "call" | "text" | "dm_instagram" | "dm_facebook" | "walk_in" | "website" | "other";
          order_date?: string;
          delivery_date: string;
          delivery_time_slot?: string | null;
          is_delivery?: boolean;
          delivery_address?: string | null;
          subtotal?: number;
          tax?: number;
          total?: number;
          deposit_paid?: number;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: number;
          customer_id?: string | null;
          status?: "pending" | "confirmed" | "in_progress" | "ready" | "completed" | "cancelled";
          source?: "call" | "text" | "dm_instagram" | "dm_facebook" | "walk_in" | "website" | "other";
          order_date?: string;
          delivery_date?: string;
          delivery_time_slot?: string | null;
          is_delivery?: boolean;
          delivery_address?: string | null;
          subtotal?: number;
          tax?: number;
          total?: number;
          deposit_paid?: number;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
          customizations: Json | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          quantity?: number;
          unit_price: number;
          customizations?: Json | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          quantity?: number;
          unit_price?: number;
          customizations?: Json | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          supplier_name: string;
          invoice_number: string | null;
          invoice_date: string;
          total_amount: number | null;
          image_url: string | null;
          ocr_raw_text: string | null;
          ocr_confidence: number | null;
          status: "pending" | "processed" | "verified";
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          supplier_name: string;
          invoice_number?: string | null;
          invoice_date: string;
          total_amount?: number | null;
          image_url?: string | null;
          ocr_raw_text?: string | null;
          ocr_confidence?: number | null;
          status?: "pending" | "processed" | "verified";
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          supplier_name?: string;
          invoice_number?: string | null;
          invoice_date?: string;
          total_amount?: number | null;
          image_url?: string | null;
          ocr_raw_text?: string | null;
          ocr_confidence?: number | null;
          status?: "pending" | "processed" | "verified";
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          ingredient_id: string | null;
          description: string;
          quantity: number;
          unit: string | null;
          unit_cost: number | null;
          total_cost: number | null;
          is_matched: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          ingredient_id?: string | null;
          description: string;
          quantity: number;
          unit?: string | null;
          unit_cost?: number | null;
          total_cost?: number | null;
          is_matched?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          ingredient_id?: string | null;
          description?: string;
          quantity?: number;
          unit?: string | null;
          unit_cost?: number | null;
          total_cost?: number | null;
          is_matched?: boolean;
          created_at?: string;
        };
      };
      ingredient_usage_daily: {
        Row: {
          id: string;
          ingredient_id: string;
          usage_date: string;
          quantity_used: number;
          order_count: number;
        };
        Insert: {
          id?: string;
          ingredient_id: string;
          usage_date: string;
          quantity_used: number;
          order_count?: number;
        };
        Update: {
          id?: string;
          ingredient_id?: string;
          usage_date?: string;
          quantity_used?: number;
          order_count?: number;
        };
      };
      product_ingredients: {
        Row: {
          id: string;
          product_id: string;
          ingredient_id: string;
          quantity: number;
        };
        Insert: {
          id?: string;
          product_id: string;
          ingredient_id: string;
          quantity: number;
        };
        Update: {
          id?: string;
          product_id?: string;
          ingredient_id?: string;
          quantity?: number;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types for easier usage
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Convenience type aliases
export type Profile = Tables<"profiles">;
export type Customer = Tables<"customers">;
export type Category = Tables<"categories">;
export type Product = Tables<"products">;
export type Ingredient = Tables<"ingredients">;
export type Order = Tables<"orders">;
export type OrderItem = Tables<"order_items">;
export type Invoice = Tables<"invoices">;
export type InvoiceItem = Tables<"invoice_items">;
export type IngredientUsageDaily = Tables<"ingredient_usage_daily">;
export type ProductIngredient = Tables<"product_ingredients">;

// Order with related data
export type OrderWithItems = Order & {
  order_items: OrderItem[];
  customer: Customer | null;
};

// Product with category
export type ProductWithCategory = Product & {
  category: Category | null;
};
