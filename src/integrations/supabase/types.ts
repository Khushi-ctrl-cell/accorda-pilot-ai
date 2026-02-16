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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          after_value: Json | null
          before_value: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
          org_id: string | null
          user_email: string | null
          user_id: string
        }
        Insert: {
          action: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
          org_id?: string | null
          user_email?: string | null
          user_id: string
        }
        Update: {
          action?: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
          org_id?: string | null
          user_email?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      error_log: {
        Row: {
          created_at: string
          error_details: Json | null
          error_message: string
          function_name: string
          id: string
          max_retries: number
          org_id: string | null
          request_payload: Json | null
          resolved_at: string | null
          retry_count: number
          status: string
        }
        Insert: {
          created_at?: string
          error_details?: Json | null
          error_message: string
          function_name: string
          id?: string
          max_retries?: number
          org_id?: string | null
          request_payload?: Json | null
          resolved_at?: string | null
          retry_count?: number
          status?: string
        }
        Update: {
          created_at?: string
          error_details?: Json | null
          error_message?: string
          function_name?: string
          id?: string
          max_retries?: number
          org_id?: string | null
          request_payload?: Json | null
          resolved_at?: string | null
          retry_count?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "error_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          message: string
          org_id: string
          read: boolean
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message: string
          org_id: string
          read?: boolean
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string
          org_id?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          id: string
          joined_at: string
          org_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          org_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          org_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      policies: {
        Row: {
          ai_confidence: number | null
          created_at: string
          file_size: string | null
          file_url: string | null
          id: string
          name: string
          org_id: string | null
          raw_text: string | null
          rules_extracted: number
          sections: number
          status: string
          updated_at: string
        }
        Insert: {
          ai_confidence?: number | null
          created_at?: string
          file_size?: string | null
          file_url?: string | null
          id?: string
          name: string
          org_id?: string | null
          raw_text?: string | null
          rules_extracted?: number
          sections?: number
          status?: string
          updated_at?: string
        }
        Update: {
          ai_confidence?: number | null
          created_at?: string
          file_size?: string | null
          file_url?: string | null
          id?: string
          name?: string
          org_id?: string | null
          raw_text?: string | null
          rules_extracted?: number
          sections?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "policies_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rule_versions: {
        Row: {
          change_summary: string | null
          condition_dsl: Json
          condition_text: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          org_id: string | null
          rule_id: string
          severity: string
          target_table: string | null
          version_number: number
        }
        Insert: {
          change_summary?: string | null
          condition_dsl?: Json
          condition_text: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          org_id?: string | null
          rule_id: string
          severity?: string
          target_table?: string | null
          version_number?: number
        }
        Update: {
          change_summary?: string | null
          condition_dsl?: Json
          condition_text?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          org_id?: string | null
          rule_id?: string
          severity?: string
          target_table?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "rule_versions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rule_versions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "rules"
            referencedColumns: ["id"]
          },
        ]
      }
      rules: {
        Row: {
          ai_confidence: number | null
          condition_dsl: Json
          condition_text: string
          control_family: string | null
          control_id: string | null
          created_at: string
          description: string
          id: string
          org_id: string | null
          policy_id: string | null
          policy_name: string
          rule_code: string
          section: string | null
          severity: string
          status: string
          target_table: string | null
          updated_at: string
        }
        Insert: {
          ai_confidence?: number | null
          condition_dsl?: Json
          condition_text: string
          control_family?: string | null
          control_id?: string | null
          created_at?: string
          description: string
          id?: string
          org_id?: string | null
          policy_id?: string | null
          policy_name: string
          rule_code: string
          section?: string | null
          severity?: string
          status?: string
          target_table?: string | null
          updated_at?: string
        }
        Update: {
          ai_confidence?: number | null
          condition_dsl?: Json
          condition_text?: string
          control_family?: string | null
          control_id?: string | null
          created_at?: string
          description?: string
          id?: string
          org_id?: string | null
          policy_id?: string | null
          policy_name?: string
          rule_code?: string
          section?: string | null
          severity?: string
          status?: string
          target_table?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rules_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_history: {
        Row: {
          completed_at: string | null
          duration_ms: number | null
          id: string
          org_id: string | null
          records_scanned: number | null
          rules_evaluated: number | null
          scan_type: string
          started_at: string
          status: string
          violations_found: number | null
          violations_resolved: number | null
        }
        Insert: {
          completed_at?: string | null
          duration_ms?: number | null
          id?: string
          org_id?: string | null
          records_scanned?: number | null
          rules_evaluated?: number | null
          scan_type?: string
          started_at?: string
          status?: string
          violations_found?: number | null
          violations_resolved?: number | null
        }
        Update: {
          completed_at?: string | null
          duration_ms?: number | null
          id?: string
          org_id?: string | null
          records_scanned?: number | null
          rules_evaluated?: number | null
          scan_type?: string
          started_at?: string
          status?: string
          violations_found?: number | null
          violations_resolved?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scan_history_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_schedules: {
        Row: {
          created_at: string
          enabled: boolean
          frequency: string
          id: string
          last_run_at: string | null
          next_run_at: string | null
          org_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          frequency?: string
          id?: string
          last_run_at?: string | null
          next_run_at?: string | null
          org_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          frequency?: string
          id?: string
          last_run_at?: string | null
          next_run_at?: string | null
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scan_schedules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_metrics: {
        Row: {
          created_at: string
          id: string
          org_id: string
          period_end: string
          period_start: string
          policies_count: number
          rules_count: number
          scans_count: number
          storage_bytes: number
          updated_at: string
          violations_processed: number
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          period_end: string
          period_start: string
          policies_count?: number
          rules_count?: number
          scans_count?: number
          storage_bytes?: number
          updated_at?: string
          violations_processed?: number
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          period_end?: string
          period_start?: string
          policies_count?: number
          rules_count?: number
          scans_count?: number
          storage_bytes?: number
          updated_at?: string
          violations_processed?: number
        }
        Relationships: [
          {
            foreignKeyName: "usage_metrics_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      violations: {
        Row: {
          condition_breakdown: Json | null
          created_at: string
          department: string | null
          detected_at: string
          explanation: string
          id: string
          org_id: string | null
          policy_section: string | null
          record_id: string
          review_comment: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_score: number | null
          rule_code: string | null
          rule_id: string | null
          rule_name: string
          severity: string
          status: string
        }
        Insert: {
          condition_breakdown?: Json | null
          created_at?: string
          department?: string | null
          detected_at?: string
          explanation: string
          id?: string
          org_id?: string | null
          policy_section?: string | null
          record_id: string
          review_comment?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_score?: number | null
          rule_code?: string | null
          rule_id?: string | null
          rule_name: string
          severity?: string
          status?: string
        }
        Update: {
          condition_breakdown?: Json | null
          created_at?: string
          department?: string | null
          detected_at?: string
          explanation?: string
          id?: string
          org_id?: string | null
          policy_section?: string | null
          record_id?: string
          review_comment?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_score?: number | null
          rule_code?: string | null
          rule_id?: string | null
          rule_name?: string
          severity?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "violations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "violations_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "rules"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_organization_with_admin: {
        Args: { _org_name: string; _org_slug: string }
        Returns: string
      }
      get_user_org_ids: { Args: { _user_id: string }; Returns: string[] }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "compliance_officer" | "reviewer" | "auditor"
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
      app_role: ["admin", "compliance_officer", "reviewer", "auditor"],
    },
  },
} as const
