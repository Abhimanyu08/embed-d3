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
      documents: {
        Row: {
          checksum: string | null
          content: string | null
          embedding: number[] | null
          id: number
        }
        Insert: {
          checksum?: string | null
          content?: string | null
          embedding: number[] | null
          id?: never
        }
        Update: {
          checksum?: string | null
          content?: string | null
          embedding: number[] | null
          id?: never
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_documents: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: number
          content: string
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
