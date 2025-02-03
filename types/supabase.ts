export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          clerk_id: string
          email: string
          full_name: string | null
          verification_status: string
          points_balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clerk_id: string
          email: string
          full_name?: string | null
          verification_status?: string
          points_balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clerk_id?: string
          email?: string
          full_name?: string | null
          verification_status?: string
          points_balance?: number
          created_at?: string
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          description: string | null
          points: number
          status: string
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          description?: string | null
          points: number
          status?: string
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          description?: string | null
          points?: number
          status?: string
          completed_at?: string | null
          created_at?: string
        }
      }
      verification_sessions: {
        Row: {
          id: string
          user_id: string
          status: string
          created_at: string
          updated_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          type: string
          status: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          status?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          status?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      payouts: {
        Row: {
          id: string
          user_id: string
          amount: number
          status: string
          processed_by: string | null
          processed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          status?: string
          processed_by?: string | null
          processed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          status?: string
          processed_by?: string | null
          processed_at?: string | null
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          activity_id: string | null
          action: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_id?: string | null
          action: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_id?: string | null
          action?: string
          metadata?: Json
          created_at?: string
        }
      }
      ad_interactions: {
        Row: {
          id: string
          user_id: string
          ad_id: string
          interaction_type: string
          duration: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ad_id: string
          interaction_type: string
          duration?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ad_id?: string
          interaction_type?: string
          duration?: number | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}