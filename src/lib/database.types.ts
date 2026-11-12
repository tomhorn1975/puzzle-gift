export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      gift_access: {
        Row: {
          gift_id: string
          id: string
          ip_address: string | null
          solved_at: string
        }
        Insert: {
          gift_id: string
          id?: string
          ip_address?: string | null
          solved_at?: string
        }
        Update: {
          gift_id?: string
          id?: string
          ip_address?: string | null
          solved_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_access_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "gifts"
            referencedColumns: ["id"]
          },
        ]
      }
      gifts: {
        Row: {
          content_type: string
          created_at: string
          expires_at: string | null
          file_path: string | null
          id: string
          is_active: boolean
          max_attempts: number | null
          personal_message: string | null
          puzzle_config: Json
          puzzle_type: string
          sender_id: string
          text_content: string | null
          title: string
        }
        Insert: {
          content_type: string
          created_at?: string
          expires_at?: string | null
          file_path?: string | null
          id?: string
          is_active?: boolean
          max_attempts?: number | null
          personal_message?: string | null
          puzzle_config: Json
          puzzle_type: string
          sender_id: string
          text_content?: string | null
          title: string
        }
        Update: {
          content_type?: string
          created_at?: string
          expires_at?: string | null
          file_path?: string | null
          id?: string
          is_active?: boolean
          max_attempts?: number | null
          personal_message?: string | null
          puzzle_config?: Json
          puzzle_type?: string
          sender_id?: string
          text_content?: string | null
          title?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
