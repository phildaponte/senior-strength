import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallback for development
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Create Supabase client with auth configuration for React Native
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configure auth to work with React Native
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Database type definitions (will be expanded as we build the schema)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          dob: string | null
          trusted_contact_email: string | null
          push_token: string | null
          current_streak: number
          longest_streak: number
          badges: string[]
          is_subscribed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          dob?: string | null
          trusted_contact_email?: string | null
          push_token?: string | null
          current_streak?: number
          longest_streak?: number
          badges?: string[]
          is_subscribed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          dob?: string | null
          trusted_contact_email?: string | null
          push_token?: string | null
          current_streak?: number
          longest_streak?: number
          badges?: string[]
          is_subscribed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      workouts: {
        Row: {
          id: string
          title: string
          type: 'sitting' | 'standing'
          duration: number
          difficulty: 'easy' | 'medium' | 'hard'
          video_url: string | null
          exercises: any // JSON field
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          type: 'sitting' | 'standing'
          duration: number
          difficulty: 'easy' | 'medium' | 'hard'
          video_url?: string | null
          exercises: any
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          type?: 'sitting' | 'standing'
          duration?: number
          difficulty?: 'easy' | 'medium' | 'hard'
          video_url?: string | null
          exercises?: any
          created_at?: string
        }
      }
      workout_logs: {
        Row: {
          id: string
          user_id: string
          workout_id: string
          date: string
          duration_seconds: number
          journal_text: string | null
          sentiment_tag: 'positive' | 'neutral' | 'negative' | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workout_id: string
          date?: string
          duration_seconds: number
          journal_text?: string | null
          sentiment_tag?: 'positive' | 'neutral' | 'negative' | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workout_id?: string
          date?: string
          duration_seconds?: number
          journal_text?: string | null
          sentiment_tag?: 'positive' | 'neutral' | 'negative' | null
          created_at?: string
        }
      }
    }
  }
}
