/**
 * Handgeschriebene Supabase-Database-Typen, exakt passend zu den Migrationen in
 * supabase/migrations/ (0001_init.sql, 0002_goal_progress_view.sql).
 *
 * Sobald ein echtes Supabase-Projekt existiert, können diese Typen jederzeit
 * regeneriert werden:
 *   npx supabase gen types typescript --project-id <PROJECT_ID> --schema public > src/types/supabase.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PeriodType = "year" | "month" | "week" | "custom";

export interface Database {
  public: {
    Tables: {
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          icon: string | null;
          color: string | null;
          target_count: number;
          card_size: number;
          period_type: PeriodType;
          start_date: string;
          end_date: string | null;
          reward_text: string | null;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          icon?: string | null;
          color?: string | null;
          target_count: number;
          card_size: number;
          period_type: PeriodType;
          start_date: string;
          end_date?: string | null;
          reward_text?: string | null;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          icon?: string | null;
          color?: string | null;
          target_count?: number;
          card_size?: number;
          period_type?: PeriodType;
          start_date?: string;
          end_date?: string | null;
          reward_text?: string | null;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      goal_card_rewards: {
        Row: {
          id: string;
          goal_id: string;
          card_index: number;
          reward_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          goal_id: string;
          card_index: number;
          reward_text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          goal_id?: string;
          card_index?: number;
          reward_text?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "goal_card_rewards_goal_id_fkey";
            columns: ["goal_id"];
            isOneToOne: false;
            referencedRelation: "goals";
            referencedColumns: ["id"];
          },
        ];
      };
      stamps: {
        Row: {
          id: string;
          goal_id: string;
          user_id: string;
          card_index: number;
          slot_index: number;
          stamped_at: string;
        };
        Insert: {
          id?: string;
          goal_id: string;
          user_id: string;
          card_index: number;
          slot_index: number;
          stamped_at?: string;
        };
        Update: {
          id?: string;
          goal_id?: string;
          user_id?: string;
          card_index?: number;
          slot_index?: number;
          stamped_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stamps_goal_id_fkey";
            columns: ["goal_id"];
            isOneToOne: false;
            referencedRelation: "goals";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      goal_progress: {
        Row: {
          goal_id: string;
          user_id: string;
          target_count: number;
          card_size: number;
          total_cards: number;
          total_stamps: number;
          active_card_index: number;
          remaining_count: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Bequeme Aliase für Phase 2+
export type Goal = Database["public"]["Tables"]["goals"]["Row"];
export type GoalInsert = Database["public"]["Tables"]["goals"]["Insert"];
export type GoalUpdate = Database["public"]["Tables"]["goals"]["Update"];
export type GoalCardReward =
  Database["public"]["Tables"]["goal_card_rewards"]["Row"];
export type Stamp = Database["public"]["Tables"]["stamps"]["Row"];
export type StampInsert = Database["public"]["Tables"]["stamps"]["Insert"];
export type GoalProgress = Database["public"]["Views"]["goal_progress"]["Row"];
