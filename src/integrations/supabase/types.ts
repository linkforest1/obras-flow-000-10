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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          asset: string | null
          created_at: string
          custom_id: string | null
          description: string | null
          discipline: string | null
          employee_count: Json | null
          end_date: string | null
          id: string
          location: string | null
          pacote: string
          priority: string | null
          progress: number | null
          project_id: string
          responsible_name: string | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string
          week: string | null
        }
        Insert: {
          asset?: string | null
          created_at?: string
          custom_id?: string | null
          description?: string | null
          discipline?: string | null
          employee_count?: Json | null
          end_date?: string | null
          id?: string
          location?: string | null
          pacote?: string
          priority?: string | null
          progress?: number | null
          project_id: string
          responsible_name?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string
          week?: string | null
        }
        Update: {
          asset?: string | null
          created_at?: string
          custom_id?: string | null
          description?: string | null
          discipline?: string | null
          employee_count?: Json | null
          end_date?: string | null
          id?: string
          location?: string | null
          pacote?: string
          priority?: string | null
          progress?: number | null
          project_id?: string
          responsible_name?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          week?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_assignments: {
        Row: {
          activity_id: string
          assigned_at: string
          id: string
          pacote: string
          role: string | null
          user_id: string
        }
        Insert: {
          activity_id: string
          assigned_at?: string
          id?: string
          pacote?: string
          role?: string | null
          user_id: string
        }
        Update: {
          activity_id?: string
          assigned_at?: string
          id?: string
          pacote?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_assignments_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_comments: {
        Row: {
          activity_id: string
          comment_text: string
          created_at: string
          id: string
          pacote: string
          user_id: string
        }
        Insert: {
          activity_id: string
          comment_text: string
          created_at?: string
          id?: string
          pacote?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          comment_text?: string
          created_at?: string
          id?: string
          pacote?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_comments_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_activity_comments_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_photos: {
        Row: {
          activity_id: string
          caption: string | null
          created_at: string
          id: string
          pacote: string
          photo_url: string
          user_id: string
        }
        Insert: {
          activity_id: string
          caption?: string | null
          created_at?: string
          id?: string
          pacote?: string
          photo_url: string
          user_id: string
        }
        Update: {
          activity_id?: string
          caption?: string | null
          created_at?: string
          id?: string
          pacote?: string
          photo_url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_photos_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_activity_photos_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_progress_history: {
        Row: {
          activity_id: string
          changed_at: string
          changed_by: string
          id: string
          new_progress: number
          old_progress: number | null
          pacote: string
        }
        Insert: {
          activity_id: string
          changed_at?: string
          changed_by: string
          id?: string
          new_progress: number
          old_progress?: number | null
          pacote?: string
        }
        Update: {
          activity_id?: string
          changed_at?: string
          changed_by?: string
          id?: string
          new_progress?: number
          old_progress?: number | null
          pacote?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_progress_history_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_subtasks: {
        Row: {
          activity_id: string
          completed: boolean
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          pacote: string
          title: string
        }
        Insert: {
          activity_id: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          pacote?: string
          title: string
        }
        Update: {
          activity_id?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          pacote?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_subtasks_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_workforce: {
        Row: {
          activity_id: string
          created_at: string
          id: string
          pacote: string
          quantity: number
          role: string
          updated_at: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          id?: string
          pacote?: string
          quantity?: number
          role: string
          updated_at?: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          id?: string
          pacote?: string
          quantity?: number
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_workforce_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      boards: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_report_photos: {
        Row: {
          caption: string | null
          created_at: string
          daily_report_id: string
          id: string
          pacote: string
          photo_url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          daily_report_id: string
          id?: string
          pacote?: string
          photo_url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          daily_report_id?: string
          id?: string
          pacote?: string
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_report_photos_daily_report_id_fkey"
            columns: ["daily_report_id"]
            isOneToOne: false
            referencedRelation: "daily_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_reports: {
        Row: {
          activity_id: string | null
          asset: string | null
          created_at: string
          description: string | null
          deviation_type: string | null
          id: string
          pacote: string
          report_date: string
          responsible: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_id?: string | null
          asset?: string | null
          created_at?: string
          description?: string | null
          deviation_type?: string | null
          id?: string
          pacote?: string
          report_date?: string
          responsible?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_id?: string | null
          asset?: string | null
          created_at?: string
          description?: string | null
          deviation_type?: string | null
          id?: string
          pacote?: string
          report_date?: string
          responsible?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lists: {
        Row: {
          board_id: string
          created_at: string
          id: string
          list_order: number
          name: string
        }
        Insert: {
          board_id: string
          created_at?: string
          id?: string
          list_order?: number
          name: string
        }
        Update: {
          board_id?: string
          created_at?: string
          id?: string
          list_order?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "lists_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
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
          pacote: string
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          pacote?: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          pacote?: string
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          manager_id: string | null
          name: string
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          manager_id?: string | null
          name: string
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quality_report_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          pacote: string
          photo_url: string
          quality_report_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          pacote?: string
          photo_url: string
          quality_report_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          pacote?: string
          photo_url?: string
          quality_report_id?: string
        }
        Relationships: []
      }
      quality_reports: {
        Row: {
          created_at: string
          cwp: string
          descricao: string | null
          eixo: string | null
          elevacao: string | null
          id: string
          pacote: string
          status: string
          tag_peca: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          cwp: string
          descricao?: string | null
          eixo?: string | null
          elevacao?: string | null
          id?: string
          pacote?: string
          status?: string
          tag_peca: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          cwp?: string
          descricao?: string | null
          eixo?: string | null
          elevacao?: string | null
          id?: string
          pacote?: string
          status?: string
          tag_peca?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rdo_entries: {
        Row: {
          activity_id: string | null
          asset: string | null
          comment: string
          created_at: string
          date: string
          id: string
          pacote: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_id?: string | null
          asset?: string | null
          comment: string
          created_at?: string
          date?: string
          id?: string
          pacote?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_id?: string | null
          asset?: string | null
          comment?: string
          created_at?: string
          date?: string
          id?: string
          pacote?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rdo_entries_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      rdo_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          pacote: string
          photo_url: string
          rdo_entry_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          pacote?: string
          photo_url: string
          rdo_entry_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          pacote?: string
          photo_url?: string
          rdo_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rdo_photos_rdo_entry_id_fkey"
            columns: ["rdo_entry_id"]
            isOneToOne: false
            referencedRelation: "rdo_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          list_id: string
          name: string
          task_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          list_id: string
          name: string
          task_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          list_id?: string
          name?: string
          task_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          project_id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      timeline: {
        Row: {
          Atividade: string | null
          ID: number
          Mes: string | null
          status: string | null
        }
        Insert: {
          Atividade?: string | null
          ID: number
          Mes?: string | null
          status?: string | null
        }
        Update: {
          Atividade?: string | null
          ID?: number
          Mes?: string | null
          status?: string | null
        }
        Relationships: []
      }
      training_videos: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          position: number | null
          title: string
          topic: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          position?: number | null
          title: string
          topic: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          position?: number | null
          title?: string
          topic?: string
          url?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_pacote: { Args: never; Returns: string }
      get_current_user_role: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "gestor"
        | "gestor_disciplina"
        | "engenheiro"
        | "encarregado"
        | "fiscal"
        | "cliente"
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
      app_role: [
        "admin",
        "gestor",
        "gestor_disciplina",
        "engenheiro",
        "encarregado",
        "fiscal",
        "cliente",
      ],
    },
  },
} as const
