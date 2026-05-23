export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      abandoned_carts: {
        Row: {
          cart_items: Json
          cart_total: number
          converted_at: string | null
          created_at: string
          discount_code: string | null
          email: string
          email_1_sent_at: string | null
          email_2_sent_at: string | null
          email_3_sent_at: string | null
          id: string
          recovered_at: string | null
          recovery_token: string
          status: string
          updated_at: string
        }
        Insert: {
          cart_items?: Json
          cart_total?: number
          converted_at?: string | null
          created_at?: string
          discount_code?: string | null
          email: string
          email_1_sent_at?: string | null
          email_2_sent_at?: string | null
          email_3_sent_at?: string | null
          id?: string
          recovered_at?: string | null
          recovery_token?: string
          status?: string
          updated_at?: string
        }
        Update: {
          cart_items?: Json
          cart_total?: number
          converted_at?: string | null
          created_at?: string
          discount_code?: string | null
          email?: string
          email_1_sent_at?: string | null
          email_2_sent_at?: string | null
          email_3_sent_at?: string | null
          id?: string
          recovered_at?: string | null
          recovery_token?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      addresses: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          city: string
          country: string
          created_at: string
          first_name: string
          id: string
          is_default_billing: boolean | null
          is_default_shipping: boolean | null
          label: string | null
          last_name: string
          phone: string | null
          postal_code: string
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          city: string
          country?: string
          created_at?: string
          first_name: string
          id?: string
          is_default_billing?: boolean | null
          is_default_shipping?: boolean | null
          label?: string | null
          last_name: string
          phone?: string | null
          postal_code: string
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          country?: string
          created_at?: string
          first_name?: string
          id?: string
          is_default_billing?: boolean | null
          is_default_shipping?: boolean | null
          label?: string | null
          last_name?: string
          phone?: string | null
          postal_code?: string
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ambassador_applications: {
        Row: {
          admin_notes: string | null
          agreed_to_terms: boolean
          content_frequency: string
          content_types: string[]
          created_at: string
          email: string
          faith_in_content: string
          follower_count_range: string
          full_name: string
          id: string
          instagram_handle: string | null
          location: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          tiktok_handle: string | null
          twitter_handle: string | null
          why_represent: string
          youtube_handle: string | null
        }
        Insert: {
          admin_notes?: string | null
          agreed_to_terms?: boolean
          content_frequency: string
          content_types?: string[]
          created_at?: string
          email: string
          faith_in_content: string
          follower_count_range: string
          full_name: string
          id?: string
          instagram_handle?: string | null
          location?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          tiktok_handle?: string | null
          twitter_handle?: string | null
          why_represent: string
          youtube_handle?: string | null
        }
        Update: {
          admin_notes?: string | null
          agreed_to_terms?: boolean
          content_frequency?: string
          content_types?: string[]
          created_at?: string
          email?: string
          faith_in_content?: string
          follower_count_range?: string
          full_name?: string
          id?: string
          instagram_handle?: string | null
          location?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          tiktok_handle?: string | null
          twitter_handle?: string | null
          why_represent?: string
          youtube_handle?: string | null
        }
        Relationships: []
      }
      brands: {
        Row: {
          created_at: string
          current_campaign: string | null
          id: string
          name: string
          niche: string | null
          owner_id: string
          pillar_weights: Json | null
          slug: string
          updated_at: string
          voice_notes: string | null
        }
        Insert: {
          created_at?: string
          current_campaign?: string | null
          id?: string
          name: string
          niche?: string | null
          owner_id: string
          pillar_weights?: Json | null
          slug: string
          updated_at?: string
          voice_notes?: string | null
        }
        Update: {
          created_at?: string
          current_campaign?: string | null
          id?: string
          name?: string
          niche?: string | null
          owner_id?: string
          pillar_weights?: Json | null
          slug?: string
          updated_at?: string
          voice_notes?: string | null
        }
        Relationships: []
      }
      bundle_discounts: {
        Row: {
          created_at: string | null
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_items: number | null
          min_items: number
          name: string
          priority: number | null
          source_id: string | null
          source_type: string
          stacks_with_codes: boolean | null
          starts_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_items?: number | null
          min_items?: number
          name: string
          priority?: number | null
          source_id?: string | null
          source_type: string
          stacks_with_codes?: boolean | null
          starts_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_items?: number | null
          min_items?: number
          name?: string
          priority?: number | null
          source_id?: string | null
          source_type?: string
          stacks_with_codes?: boolean | null
          starts_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          name: string
          parent_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      community_stories: {
        Row: {
          created_at: string
          customer_email: string
          customer_location: string | null
          customer_name: string
          customer_photo_url: string | null
          gender: string | null
          headline: string
          id: string
          instagram_handle: string | null
          is_approved: boolean
          is_contactable: boolean
          is_featured: boolean
          product_id: string | null
          story_text: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_location?: string | null
          customer_name: string
          customer_photo_url?: string | null
          gender?: string | null
          headline: string
          id?: string
          instagram_handle?: string | null
          is_approved?: boolean
          is_contactable?: boolean
          is_featured?: boolean
          product_id?: string | null
          story_text: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_location?: string | null
          customer_name?: string
          customer_photo_url?: string | null
          gender?: string | null
          headline?: string
          id?: string
          instagram_handle?: string | null
          is_approved?: boolean
          is_contactable?: boolean
          is_featured?: boolean
          product_id?: string | null
          story_text?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_stories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      content_plan: {
        Row: {
          angle: string | null
          brand_id: string
          created_at: string
          day_number: number
          hook: string
          id: string
          niche: string
          owner_id: string
          pillar: string
          plan_date: string
          status: string
          updated_at: string
        }
        Insert: {
          angle?: string | null
          brand_id: string
          created_at?: string
          day_number: number
          hook: string
          id?: string
          niche: string
          owner_id: string
          pillar: string
          plan_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          angle?: string | null
          brand_id?: string
          created_at?: string
          day_number?: number
          hook?: string
          id?: string
          niche?: string
          owner_id?: string
          pillar?: string
          plan_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_records: {
        Row: {
          brand_id: string
          created_at: string
          id: string
          images: Json
          notes: string | null
          options: Json
          owner_id: string
          posted_at: string | null
          record_date: string
          selected_index: number | null
          status: string
          updated_at: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          id?: string
          images?: Json
          notes?: string | null
          options?: Json
          owner_id: string
          posted_at?: string | null
          record_date?: string
          selected_index?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          id?: string
          images?: Json
          notes?: string | null
          options?: Json
          owner_id?: string
          posted_at?: string | null
          record_date?: string
          selected_index?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_records_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_code_redemptions: {
        Row: {
          customer_email: string
          discount_applied_cents: number
          discount_code_id: string
          id: string
          order_id: string | null
          redeemed_at: string | null
        }
        Insert: {
          customer_email: string
          discount_applied_cents: number
          discount_code_id: string
          id?: string
          order_id?: string | null
          redeemed_at?: string | null
        }
        Update: {
          customer_email?: string
          discount_applied_cents?: number
          discount_code_id?: string
          id?: string
          order_id?: string | null
          redeemed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discount_code_redemptions_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_code_redemptions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          maximum_discount_cents: number | null
          minimum_order_cents: number | null
          name: string
          per_user_limit: number | null
          starts_at: string | null
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          maximum_discount_cents?: number | null
          minimum_order_cents?: number | null
          name: string
          per_user_limit?: number | null
          starts_at?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          maximum_discount_cents?: number | null
          minimum_order_cents?: number | null
          name?: string
          per_user_limit?: number | null
          starts_at?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          cart_context: Json | null
          created_at: string
          id: string
          product_id: string
          saved_from_cart: boolean | null
          user_id: string
        }
        Insert: {
          cart_context?: Json | null
          created_at?: string
          id?: string
          product_id: string
          saved_from_cart?: boolean | null
          user_id: string
        }
        Update: {
          cart_context?: Json | null
          created_at?: string
          id?: string
          product_id?: string
          saved_from_cart?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      fit_guide_models: {
        Row: {
          chest_cm: number | null
          created_at: string
          display_order: number | null
          fit_notes: string | null
          gender: string
          height_cm: number | null
          height_imperial: string | null
          hip_cm: number | null
          id: string
          is_active: boolean | null
          name: string
          photo_url: string
          size_worn: string
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          chest_cm?: number | null
          created_at?: string
          display_order?: number | null
          fit_notes?: string | null
          gender: string
          height_cm?: number | null
          height_imperial?: string | null
          hip_cm?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          photo_url: string
          size_worn: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          chest_cm?: number | null
          created_at?: string
          display_order?: number | null
          fit_notes?: string | null
          gender?: string
          height_cm?: number | null
          height_imperial?: string | null
          hip_cm?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          photo_url?: string
          size_worn?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      lookbook_look_products: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          look_id: string
          position: string | null
          product_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          look_id: string
          position?: string | null
          product_id: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          look_id?: string
          position?: string | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lookbook_look_products_look_id_fkey"
            columns: ["look_id"]
            isOneToOne: false
            referencedRelation: "lookbook_looks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookbook_look_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      lookbook_looks: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          gender: string | null
          headline: string
          id: string
          image_url: string
          is_active: boolean | null
          name: string
          scripture_reference: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          gender?: string | null
          headline: string
          id?: string
          image_url: string
          is_active?: boolean | null
          name: string
          scripture_reference?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          gender?: string | null
          headline?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          name?: string
          scripture_reference?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
          subscribed_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
          subscribed_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
          subscribed_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_image_url: string | null
          product_name: string
          quantity: number
          sku: string | null
          total_cents: number
          unit_price_cents: number
          variant_color: string | null
          variant_id: string | null
          variant_size: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_image_url?: string | null
          product_name: string
          quantity?: number
          sku?: string | null
          total_cents: number
          unit_price_cents: number
          variant_color?: string | null
          variant_id?: string | null
          variant_size?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_image_url?: string | null
          product_name?: string
          quantity?: number
          sku?: string | null
          total_cents?: number
          unit_price_cents?: number
          variant_color?: string | null
          variant_id?: string | null
          variant_size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          created_at: string
          currency: string
          customer_email: string
          customer_first_name: string | null
          customer_last_name: string | null
          customer_phone: string | null
          delivered_at: string | null
          discount_cents: number
          discount_code: string | null
          discount_id: string | null
          fulfillment_status: string | null
          id: string
          metadata: Json | null
          notes: string | null
          payment_status: string
          shipped_at: string | null
          shipping_address: Json
          shipping_cents: number
          shipping_method: string | null
          status: string
          stripe_checkout_session_id: string | null
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          subtotal_cents: number
          tax_cents: number
          total_cents: number
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string
          currency?: string
          customer_email: string
          customer_first_name?: string | null
          customer_last_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          discount_cents?: number
          discount_code?: string | null
          discount_id?: string | null
          fulfillment_status?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          payment_status?: string
          shipped_at?: string | null
          shipping_address: Json
          shipping_cents?: number
          shipping_method?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal_cents: number
          tax_cents?: number
          total_cents: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          billing_address?: Json | null
          created_at?: string
          currency?: string
          customer_email?: string
          customer_first_name?: string | null
          customer_last_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          discount_cents?: number
          discount_code?: string | null
          discount_id?: string | null
          fulfillment_status?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          payment_status?: string
          shipped_at?: string | null
          shipping_address?: Json
          shipping_cents?: number
          shipping_method?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal_cents?: number
          tax_cents?: number
          total_cents?: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      product_3d_models: {
        Row: {
          created_at: string
          fit_adjustment: Json | null
          id: string
          is_active: boolean | null
          model_url: string
          product_id: string | null
          slot_type: string
          texture_variants: Json | null
        }
        Insert: {
          created_at?: string
          fit_adjustment?: Json | null
          id?: string
          is_active?: boolean | null
          model_url: string
          product_id?: string | null
          slot_type: string
          texture_variants?: Json | null
        }
        Update: {
          created_at?: string
          fit_adjustment?: Json | null
          id?: string
          is_active?: boolean | null
          model_url?: string
          product_id?: string | null
          slot_type?: string
          texture_variants?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "product_3d_models_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_primary: boolean
          product_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_primary?: boolean
          product_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_primary?: boolean
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_ugc: {
        Row: {
          caption: string | null
          created_at: string
          customer_name: string
          id: string
          image_url: string
          instagram_handle: string | null
          is_approved: boolean
          product_id: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          customer_name: string
          id?: string
          image_url: string
          instagram_handle?: string | null
          is_approved?: boolean
          product_id?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          customer_name?: string
          id?: string
          image_url?: string
          instagram_handle?: string | null
          is_approved?: boolean
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_ugc_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          color: string | null
          created_at: string
          id: string
          price_adjustment: number | null
          product_id: string
          size: string | null
          sku: string | null
          stock_quantity: number
          style: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          price_adjustment?: number | null
          product_id: string
          size?: string | null
          sku?: string | null
          stock_quantity?: number
          style?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          price_adjustment?: number | null
          product_id?: string
          size?: string | null
          sku?: string | null
          stock_quantity?: number
          style?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          care_instructions: string | null
          category_id: string | null
          common_questions: Json | null
          created_at: string
          description: string | null
          fabric_composition: string | null
          fit_type: string | null
          flash_sale_ends_at: string | null
          id: string
          is_featured: boolean
          is_on_sale: boolean
          material: string | null
          ministry_statement: string | null
          model_info: string | null
          name: string
          price: number
          sale_price: number | null
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          updated_at: string
          weight_gsm: number | null
        }
        Insert: {
          care_instructions?: string | null
          category_id?: string | null
          common_questions?: Json | null
          created_at?: string
          description?: string | null
          fabric_composition?: string | null
          fit_type?: string | null
          flash_sale_ends_at?: string | null
          id?: string
          is_featured?: boolean
          is_on_sale?: boolean
          material?: string | null
          ministry_statement?: string | null
          model_info?: string | null
          name: string
          price: number
          sale_price?: number | null
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
          weight_gsm?: number | null
        }
        Update: {
          care_instructions?: string | null
          category_id?: string | null
          common_questions?: Json | null
          created_at?: string
          description?: string | null
          fabric_composition?: string | null
          fit_type?: string | null
          flash_sale_ends_at?: string | null
          id?: string
          is_featured?: boolean
          is_on_sale?: boolean
          material?: string | null
          ministry_statement?: string | null
          model_info?: string | null
          name?: string
          price?: number
          sale_price?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
          weight_gsm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          customer_avatar_url: string | null
          customer_location: string | null
          customer_name: string
          gender: string | null
          id: string
          is_approved: boolean
          is_contactable: boolean | null
          is_featured: boolean
          product_id: string | null
          rating: number
          review_text: string
          story_type: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          customer_avatar_url?: string | null
          customer_location?: string | null
          customer_name: string
          gender?: string | null
          id?: string
          is_approved?: boolean
          is_contactable?: boolean | null
          is_featured?: boolean
          product_id?: string | null
          rating: number
          review_text: string
          story_type?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          customer_avatar_url?: string | null
          customer_location?: string | null
          customer_name?: string
          gender?: string | null
          id?: string
          is_approved?: boolean
          is_contactable?: boolean | null
          is_featured?: boolean
          product_id?: string | null
          rating?: number
          review_text?: string
          story_type?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_outfits: {
        Row: {
          avatar_body_type: string
          avatar_gender: string
          created_at: string
          equipped_items: Json
          id: string
          name: string | null
          screenshot_url: string | null
          share_id: string | null
          user_id: string | null
        }
        Insert: {
          avatar_body_type: string
          avatar_gender: string
          created_at?: string
          equipped_items?: Json
          id?: string
          name?: string | null
          screenshot_url?: string | null
          share_id?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_body_type?: string
          avatar_gender?: string
          created_at?: string
          equipped_items?: Json
          id?: string
          name?: string | null
          screenshot_url?: string | null
          share_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      selection_history: {
        Row: {
          hook: string | null
          id: string
          niche: string | null
          owner_id: string
          pillar: string | null
          record_id: string
          selected_at: string
        }
        Insert: {
          hook?: string | null
          id?: string
          niche?: string | null
          owner_id: string
          pillar?: string | null
          record_id: string
          selected_at?: string
        }
        Update: {
          hook?: string | null
          id?: string
          niche?: string | null
          owner_id?: string
          pillar?: string | null
          record_id?: string
          selected_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "selection_history_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "content_records"
            referencedColumns: ["id"]
          },
        ]
      }
      threshold_upsell_products: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          max_threshold_gap: number | null
          min_threshold_gap: number | null
          priority: number | null
          product_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_threshold_gap?: number | null
          min_threshold_gap?: number | null
          priority?: number | null
          product_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_threshold_gap?: number | null
          min_threshold_gap?: number | null
          priority?: number | null
          product_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "threshold_upsell_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      try_on_avatars: {
        Row: {
          body_type: string
          created_at: string
          display_order: number | null
          gender: string
          height_cm: number | null
          id: string
          is_active: boolean | null
          model_url: string
          name: string
          thumbnail_url: string | null
        }
        Insert: {
          body_type?: string
          created_at?: string
          display_order?: number | null
          gender: string
          height_cm?: number | null
          id?: string
          is_active?: boolean | null
          model_url: string
          name: string
          thumbnail_url?: string | null
        }
        Update: {
          body_type?: string
          created_at?: string
          display_order?: number | null
          gender?: string
          height_cm?: number | null
          id?: string
          is_active?: boolean | null
          model_url?: string
          name?: string
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      user_behavior_signals: {
        Row: {
          add_remove_count: number | null
          created_at: string | null
          id: string
          last_viewed_at: string | null
          product_id: string
          session_id: string
          total_time_ms: number | null
          user_id: string | null
          view_count: number | null
          zoom_count: number | null
        }
        Insert: {
          add_remove_count?: number | null
          created_at?: string | null
          id?: string
          last_viewed_at?: string | null
          product_id: string
          session_id: string
          total_time_ms?: number | null
          user_id?: string | null
          view_count?: number | null
          zoom_count?: number | null
        }
        Update: {
          add_remove_count?: number | null
          created_at?: string | null
          id?: string
          last_viewed_at?: string | null
          product_id?: string
          session_id?: string
          total_time_ms?: number | null
          user_id?: string | null
          view_count?: number | null
          zoom_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_behavior_signals_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_size_preferences: {
        Row: {
          bottoms_size: string | null
          bottoms_updated_at: string | null
          created_at: string | null
          hats_size: string | null
          hats_updated_at: string | null
          id: string
          tops_size: string | null
          tops_updated_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bottoms_size?: string | null
          bottoms_updated_at?: string | null
          created_at?: string | null
          hats_size?: string | null
          hats_updated_at?: string | null
          id?: string
          tops_size?: string | null
          tops_updated_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bottoms_size?: string | null
          bottoms_updated_at?: string | null
          created_at?: string | null
          hats_size?: string | null
          hats_updated_at?: string | null
          id?: string
          tops_size?: string | null
          tops_updated_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      size_confidence_stats: {
        Row: {
          confidence_percentage: number | null
          size: string | null
          size_type: string | null
          successful_orders: number | null
          total_orders: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      product_status: "draft" | "active" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      product_status: ["draft", "active", "archived"],
    },
  },
} as const
