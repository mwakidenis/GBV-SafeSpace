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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_chat_history: {
        Row: {
          context: string | null
          created_at: string | null
          id: string
          messages: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          id?: string
          messages?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          context?: string | null
          created_at?: string | null
          id?: string
          messages?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          is_anonymous: boolean
          participant_1_id: string
          participant_2_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_anonymous?: boolean
          participant_1_id: string
          participant_2_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_anonymous?: boolean
          participant_1_id?: string
          participant_2_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      emergency_alerts: {
        Row: {
          alert_type: string
          contacts_notified: Json | null
          created_at: string | null
          id: string
          location: string | null
          message: string | null
          user_id: string | null
        }
        Insert: {
          alert_type: string
          contacts_notified?: Json | null
          created_at?: string | null
          id?: string
          location?: string | null
          message?: string | null
          user_id?: string | null
        }
        Update: {
          alert_type?: string
          contacts_notified?: Json | null
          created_at?: string | null
          id?: string
          location?: string | null
          message?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      evidence_files: {
        Row: {
          created_at: string
          description: string | null
          encryption_key: string
          file_name: string
          file_size: number
          file_type: string
          id: string
          incident_date: string | null
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          encryption_key: string
          file_name: string
          file_size: number
          file_type: string
          id?: string
          incident_date?: string | null
          storage_path: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          encryption_key?: string
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          incident_date?: string | null
          storage_path?: string
          user_id?: string
        }
        Relationships: []
      }
      forum_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_anonymous: boolean
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          content: string
          created_at: string
          flag_reason: string | null
          id: string
          is_anonymous: boolean
          is_flagged: boolean
          is_resolved: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          flag_reason?: string | null
          id?: string
          is_anonymous?: boolean
          is_flagged?: boolean
          is_resolved?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          flag_reason?: string | null
          id?: string
          is_anonymous?: boolean
          is_flagged?: boolean
          is_resolved?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      forum_reactions: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          post_id: string | null
          reaction_type: string
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          reaction_type: string
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "forum_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_reports: {
        Row: {
          created_at: string | null
          date_of_incident: string | null
          description: string
          id: string
          incident_type: string
          injuries_sustained: boolean | null
          injury_description: string | null
          is_anonymous: boolean | null
          location: string | null
          perpetrator_known: boolean | null
          perpetrator_relationship: string | null
          reported_to_authorities: boolean | null
          status: string | null
          time_of_incident: string | null
          updated_at: string | null
          user_id: string | null
          witnesses_present: boolean | null
        }
        Insert: {
          created_at?: string | null
          date_of_incident?: string | null
          description: string
          id?: string
          incident_type: string
          injuries_sustained?: boolean | null
          injury_description?: string | null
          is_anonymous?: boolean | null
          location?: string | null
          perpetrator_known?: boolean | null
          perpetrator_relationship?: string | null
          reported_to_authorities?: boolean | null
          status?: string | null
          time_of_incident?: string | null
          updated_at?: string | null
          user_id?: string | null
          witnesses_present?: boolean | null
        }
        Update: {
          created_at?: string | null
          date_of_incident?: string | null
          description?: string
          id?: string
          incident_type?: string
          injuries_sustained?: boolean | null
          injury_description?: string | null
          is_anonymous?: boolean | null
          location?: string | null
          perpetrator_known?: boolean | null
          perpetrator_relationship?: string | null
          reported_to_authorities?: boolean | null
          status?: string | null
          time_of_incident?: string | null
          updated_at?: string | null
          user_id?: string | null
          witnesses_present?: boolean | null
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: []
      }
      login_history: {
        Row: {
          created_at: string | null
          device_info: string | null
          id: string
          ip_address: string | null
          location: string | null
          login_time: string | null
          success: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: string | null
          id?: string
          ip_address?: string | null
          location?: string | null
          login_time?: string | null
          success?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: string | null
          id?: string
          ip_address?: string | null
          location?: string | null
          login_time?: string | null
          success?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      private_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "private_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json
          created_at: string
          id: string
          lesson_id: string
          score: number
          total_questions: number
          user_id: string
        }
        Insert: {
          answers: Json
          created_at?: string
          id?: string
          lesson_id: string
          score: number
          total_questions: number
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          lesson_id?: string
          score?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string
          explanation: string | null
          id: string
          lesson_id: string
          options: Json
          order_index: number
          question: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          explanation?: string | null
          id?: string
          lesson_id: string
          options: Json
          order_index: number
          question: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          explanation?: string | null
          id?: string
          lesson_id?: string
          options?: Json
          order_index?: number
          question?: string
        }
        Relationships: []
      }
      safety_plans: {
        Row: {
          coping_strategies: string | null
          created_at: string | null
          emergency_contacts: Json | null
          id: string
          important_documents: string | null
          safe_places: Json | null
          support_network: Json | null
          title: string
          updated_at: string | null
          user_id: string
          warning_signs: string | null
        }
        Insert: {
          coping_strategies?: string | null
          created_at?: string | null
          emergency_contacts?: Json | null
          id?: string
          important_documents?: string | null
          safe_places?: Json | null
          support_network?: Json | null
          title: string
          updated_at?: string | null
          user_id: string
          warning_signs?: string | null
        }
        Update: {
          coping_strategies?: string | null
          created_at?: string | null
          emergency_contacts?: Json | null
          id?: string
          important_documents?: string | null
          safe_places?: Json | null
          support_network?: Json | null
          title?: string
          updated_at?: string | null
          user_id?: string
          warning_signs?: string | null
        }
        Relationships: []
      }
      trusted_contacts: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string
          notify_on_emergency: boolean | null
          phone: string
          relationship: string | null
          share_location: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notify_on_emergency?: boolean | null
          phone: string
          relationship?: string | null
          share_location?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notify_on_emergency?: boolean | null
          phone?: string
          relationship?: string | null
          share_location?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_name: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_name: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_name?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reputation: {
        Row: {
          comments_count: number
          helpful_reactions_received: number
          id: string
          posts_count: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number
          helpful_reactions_received?: number
          id?: string
          posts_count?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number
          helpful_reactions_received?: number
          id?: string
          posts_count?: number
          total_points?: number
          updated_at?: string
          user_id?: string
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
      user_security_settings: {
        Row: {
          auto_logout_minutes: number | null
          browser_privacy_mode: boolean | null
          created_at: string | null
          data_encryption: boolean | null
          hide_activity: boolean | null
          id: string
          login_notifications: boolean | null
          two_factor_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_logout_minutes?: number | null
          browser_privacy_mode?: boolean | null
          created_at?: string | null
          data_encryption?: boolean | null
          hide_activity?: boolean | null
          id?: string
          login_notifications?: boolean | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_logout_minutes?: number | null
          browser_privacy_mode?: boolean | null
          created_at?: string | null
          data_encryption?: boolean | null
          hide_activity?: boolean | null
          id?: string
          login_notifications?: boolean | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          allow_messages: boolean | null
          anonymous_by_default: boolean | null
          created_at: string | null
          email_notifications: boolean | null
          forum_notifications: boolean | null
          id: string
          language: string | null
          message_notifications: boolean | null
          show_online_status: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allow_messages?: boolean | null
          anonymous_by_default?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          forum_notifications?: boolean | null
          id?: string
          language?: string | null
          message_notifications?: boolean | null
          show_online_status?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allow_messages?: boolean | null
          anonymous_by_default?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          forum_notifications?: boolean | null
          id?: string
          language?: string | null
          message_notifications?: boolean | null
          show_online_status?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
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
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
