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
      feedback_replies: {
        Row: {
          author_id: string | null
          author_name: string | null
          created_at: string
          feedback_id: string
          id: string
          is_internal: boolean
          message: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          created_at?: string
          feedback_id: string
          id?: string
          is_internal?: boolean
          message: string
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          created_at?: string
          feedback_id?: string
          id?: string
          is_internal?: boolean
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_replies_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedbacks"
            referencedColumns: ["id"]
          },
        ]
      }
      feedbacks: {
        Row: {
          ai_summary: string | null
          author_name: string
          category: string | null
          created_at: string
          css_selector: string | null
          id: string
          is_read: boolean
          message: string
          page_url: string | null
          position_x: number
          position_y: number
          project_id: string
          screenshot_path: string | null
          status: string
          updated_at: string
          user_agent: string | null
          viewport_h: number | null
          viewport_w: number | null
        }
        Insert: {
          ai_summary?: string | null
          author_name?: string
          category?: string | null
          created_at?: string
          css_selector?: string | null
          id?: string
          is_read?: boolean
          message: string
          page_url?: string | null
          position_x: number
          position_y: number
          project_id: string
          screenshot_path?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
          viewport_h?: number | null
          viewport_w?: number | null
        }
        Update: {
          ai_summary?: string | null
          author_name?: string
          category?: string | null
          created_at?: string
          css_selector?: string | null
          id?: string
          is_read?: boolean
          message?: string
          page_url?: string | null
          position_x?: number
          position_y?: number
          project_id?: string
          screenshot_path?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
          viewport_h?: number | null
          viewport_w?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
          onboarded_at: string | null
          plan: string
          plan_expires_at: string | null
          referral_code: string | null
          referred_by: string | null
          signup_email_normalized: string | null
          signup_ip_hash: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          onboarded_at?: string | null
          plan?: string
          plan_expires_at?: string | null
          referral_code?: string | null
          referred_by?: string | null
          signup_email_normalized?: string | null
          signup_ip_hash?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          onboarded_at?: string | null
          plan?: string
          plan_expires_at?: string | null
          referral_code?: string | null
          referred_by?: string | null
          signup_email_normalized?: string | null
          signup_ip_hash?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          brand_color: string
          created_at: string
          id: string
          is_active: boolean
          mockup_image_path: string | null
          name: string
          notify_email: boolean
          owner_id: string
          public_token: string
          type: string
          updated_at: string
        }
        Insert: {
          brand_color?: string
          created_at?: string
          id?: string
          is_active?: boolean
          mockup_image_path?: string | null
          name: string
          notify_email?: boolean
          owner_id: string
          public_token?: string
          type?: string
          updated_at?: string
        }
        Update: {
          brand_color?: string
          created_at?: string
          id?: string
          is_active?: boolean
          mockup_image_path?: string | null
          name?: string
          notify_email?: boolean
          owner_id?: string
          public_token?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          duration_days: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number
          note: string | null
          plan: string
          updated_at: string
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          duration_days: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number
          note?: string | null
          plan: string
          updated_at?: string
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          duration_days?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number
          note?: string | null
          plan?: string
          updated_at?: string
          used_count?: number
        }
        Relationships: []
      }
      redemptions: {
        Row: {
          granted_until: string
          id: string
          plan: string
          promo_code_id: string
          redeemed_at: string
          user_id: string
        }
        Insert: {
          granted_until: string
          id?: string
          plan: string
          promo_code_id: string
          redeemed_at?: string
          user_id: string
        }
        Update: {
          granted_until?: string
          id?: string
          plan?: string
          promo_code_id?: string
          redeemed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redemptions_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_events: {
        Row: {
          created_at: string
          email_normalized: string | null
          event_type: string
          id: string
          ip_hash: string | null
          metadata: Json
          reason: string | null
          referral_code: string | null
          referred_id: string | null
          referrer_id: string | null
        }
        Insert: {
          created_at?: string
          email_normalized?: string | null
          event_type: string
          id?: string
          ip_hash?: string | null
          metadata?: Json
          reason?: string | null
          referral_code?: string | null
          referred_id?: string | null
          referrer_id?: string | null
        }
        Update: {
          created_at?: string
          email_normalized?: string | null
          event_type?: string
          id?: string
          ip_hash?: string | null
          metadata?: Json
          reason?: string | null
          referral_code?: string | null
          referred_id?: string | null
          referrer_id?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          blocked_reason: string | null
          confirmed_at: string | null
          created_at: string
          id: string
          ip_hash: string | null
          referred_id: string
          referrer_id: string
          status: string
        }
        Insert: {
          blocked_reason?: string | null
          confirmed_at?: string | null
          created_at?: string
          id?: string
          ip_hash?: string | null
          referred_id: string
          referrer_id: string
          status?: string
        }
        Update: {
          blocked_reason?: string | null
          confirmed_at?: string | null
          created_at?: string
          id?: string
          ip_hash?: string | null
          referred_id?: string
          referrer_id?: string
          status?: string
        }
        Relationships: []
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
      webhook_deliveries: {
        Row: {
          created_at: string
          error: string | null
          event: string
          id: string
          ok: boolean
          response_snippet: string | null
          status_code: number | null
          webhook_id: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          event: string
          id?: string
          ok?: boolean
          response_snippet?: string | null
          status_code?: number | null
          webhook_id: string
        }
        Update: {
          created_at?: string
          error?: string | null
          event?: string
          id?: string
          ok?: boolean
          response_snippet?: string | null
          status_code?: number | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string
          events: string[]
          id: string
          is_active: boolean
          project_id: string
          secret: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean
          project_id: string
          secret: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean
          project_id?: string
          secret?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      normalize_email: { Args: { _email: string }; Returns: string }
      redeem_promo_code: { Args: { _code: string }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "user"
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
    },
  },
} as const
