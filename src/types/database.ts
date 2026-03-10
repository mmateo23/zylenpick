export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      cities: {
        Row: {
          id: string;
          slug: string;
          name: string;
          region: string | null;
          hero_image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          region?: string | null;
          hero_image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          region?: string | null;
          hero_image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      venues: {
        Row: {
          id: string;
          city_id: string | null;
          slug: string;
          name: string;
          description: string | null;
          cover_url: string | null;
          logo_url: string | null;
          website: string | null;
          address: string | null;
          email: string | null;
          phone: string | null;
          opening_hours: Json | null;
          pickup_notes: string | null;
          pickup_eta_min: number | null;
          delivery_time_min: number | null;
          delivery_time_max: number | null;
          is_verified: boolean;
          subscription_active: boolean;
          is_published: boolean;
          sort_order: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          city_id?: string | null;
          slug: string;
          name: string;
          description?: string | null;
          cover_url?: string | null;
          logo_url?: string | null;
          website?: string | null;
          address?: string | null;
          email?: string | null;
          phone?: string | null;
          opening_hours?: Json | null;
          pickup_notes?: string | null;
          pickup_eta_min?: number | null;
          delivery_time_min?: number | null;
          delivery_time_max?: number | null;
          is_verified?: boolean;
          subscription_active?: boolean;
          is_published?: boolean;
          sort_order?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          city_id?: string | null;
          slug?: string;
          name?: string;
          description?: string | null;
          cover_url?: string | null;
          logo_url?: string | null;
          website?: string | null;
          address?: string | null;
          email?: string | null;
          phone?: string | null;
          opening_hours?: Json | null;
          pickup_notes?: string | null;
          pickup_eta_min?: number | null;
          delivery_time_min?: number | null;
          delivery_time_max?: number | null;
          is_verified?: boolean;
          subscription_active?: boolean;
          is_published?: boolean;
          sort_order?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "venues_city_id_fkey";
            columns: ["city_id"];
            isOneToOne: false;
            referencedRelation: "cities";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          role: "customer" | "merchant";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          role?: "customer" | "merchant";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          role?: "customer" | "merchant";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      venue_memberships: {
        Row: {
          id: string;
          profile_id: string;
          venue_id: string;
          membership_role: "owner" | "manager" | "editor";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          venue_id: string;
          membership_role?: "owner" | "manager" | "editor";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          venue_id?: string;
          membership_role?: "owner" | "manager" | "editor";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "venue_memberships_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "venue_memberships_venue_id_fkey";
            columns: ["venue_id"];
            isOneToOne: false;
            referencedRelation: "venues";
            referencedColumns: ["id"];
          },
        ];
      };
      menu_items: {
        Row: {
          id: string;
          venue_id: string;
          name: string;
          description: string | null;
          price_amount: number;
          currency: string;
          image_url: string | null;
          category_name: string | null;
          sort_order: number;
          is_available: boolean;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          venue_id: string;
          name: string;
          description?: string | null;
          price_amount: number;
          currency?: string;
          image_url?: string | null;
          category_name?: string | null;
          sort_order?: number;
          is_available?: boolean;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          venue_id?: string;
          name?: string;
          description?: string | null;
          price_amount?: number;
          currency?: string;
          image_url?: string | null;
          category_name?: string | null;
          sort_order?: number;
          is_available?: boolean;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "menu_items_venue_id_fkey";
            columns: ["venue_id"];
            isOneToOne: false;
            referencedRelation: "venues";
            referencedColumns: ["id"];
          },
        ];
      };
      join_requests: {
        Row: {
          id: string;
          venue_name: string;
          business_type: string | null;
          area: string | null;
          address: string | null;
          venue_phone: string | null;
          venue_email: string | null;
          website: string | null;
          contact_name: string | null;
          contact_phone: string | null;
          contact_email: string | null;
          service_type: string | null;
          message: string | null;
          privacy_accepted: boolean;
          status: "pending" | "approved" | "rejected";
          linked_venue_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          venue_name: string;
          business_type?: string | null;
          area?: string | null;
          address?: string | null;
          venue_phone?: string | null;
          venue_email?: string | null;
          website?: string | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          service_type?: string | null;
          message?: string | null;
          privacy_accepted?: boolean;
          status?: "pending" | "approved" | "rejected";
          linked_venue_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          venue_name?: string;
          business_type?: string | null;
          area?: string | null;
          address?: string | null;
          venue_phone?: string | null;
          venue_email?: string | null;
          website?: string | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          service_type?: string | null;
          message?: string | null;
          privacy_accepted?: boolean;
          status?: "pending" | "approved" | "rejected";
          linked_venue_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "join_requests_linked_venue_id_fkey";
            columns: ["linked_venue_id"];
            isOneToOne: false;
            referencedRelation: "venues";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: {
          id: string;
          venue_id: string;
          menu_item_id: string;
          title: string;
          caption: string | null;
          media_type: "image" | "video";
          media_url: string;
          poster_url: string | null;
          likes_count: number;
          status: "draft" | "published" | "archived";
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          venue_id: string;
          menu_item_id: string;
          title: string;
          caption?: string | null;
          media_type: "image" | "video";
          media_url: string;
          poster_url?: string | null;
          likes_count?: number;
          status?: "draft" | "published" | "archived";
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          venue_id?: string;
          menu_item_id?: string;
          title?: string;
          caption?: string | null;
          media_type?: "image" | "video";
          media_url?: string;
          poster_url?: string | null;
          likes_count?: number;
          status?: "draft" | "published" | "archived";
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_menu_item_id_fkey";
            columns: ["menu_item_id"];
            isOneToOne: false;
            referencedRelation: "menu_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_venue_id_fkey";
            columns: ["venue_id"];
            isOneToOne: false;
            referencedRelation: "venues";
            referencedColumns: ["id"];
          },
        ];
      };
      carts: {
        Row: {
          id: string;
          session_id: string;
          venue_id: string;
          status: "active" | "converted" | "abandoned";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          venue_id: string;
          status?: "active" | "converted" | "abandoned";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          venue_id?: string;
          status?: "active" | "converted" | "abandoned";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "carts_venue_id_fkey";
            columns: ["venue_id"];
            isOneToOne: false;
            referencedRelation: "venues";
            referencedColumns: ["id"];
          },
        ];
      };
      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          menu_item_id: string;
          quantity: number;
          unit_price_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cart_id: string;
          menu_item_id: string;
          quantity?: number;
          unit_price_amount: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cart_id?: string;
          menu_item_id?: string;
          quantity?: number;
          unit_price_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey";
            columns: ["cart_id"];
            isOneToOne: false;
            referencedRelation: "carts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cart_items_menu_item_id_fkey";
            columns: ["menu_item_id"];
            isOneToOne: false;
            referencedRelation: "menu_items";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
