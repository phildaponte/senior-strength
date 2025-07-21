-- Senior Strength Database Schema
-- This file contains the complete database schema for the Senior Strength app
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    dob DATE,
    trusted_contact_email TEXT,
    push_token TEXT,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    badges TEXT[] DEFAULT '{}',
    is_subscribed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workouts table for the workout library
CREATE TABLE IF NOT EXISTS public.workouts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('sitting', 'standing')),
    duration INTEGER NOT NULL, -- duration in minutes
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    video_url TEXT,
    exercises JSONB NOT NULL, -- JSON array of exercises with sets/reps/time
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout_logs table for tracking completed workouts
CREATE TABLE IF NOT EXISTS public.workout_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    duration_seconds INTEGER NOT NULL, -- actual time spent
    journal_text TEXT,
    sentiment_tag TEXT CHECK (sentiment_tag IN ('positive', 'neutral', 'negative')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_id ON public.workout_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_date ON public.workout_logs(date);
CREATE INDEX IF NOT EXISTS idx_workouts_type ON public.workouts(type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to users table
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Users can only read and update their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for workouts table
-- Workouts are public (read-only for all authenticated users)
CREATE POLICY "Anyone can view workouts" ON public.workouts
    FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for workout_logs table
-- Users can only access their own workout logs
CREATE POLICY "Users can view own workout logs" ON public.workout_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout logs" ON public.workout_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout logs" ON public.workout_logs
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample workouts for testing
INSERT INTO public.workouts (title, type, duration, difficulty, exercises) VALUES
('Gentle Chair Stretches', 'sitting', 10, 'easy', '[
    {
        "name": "Neck Rolls",
        "type": "time",
        "duration": 60,
        "description": "Slowly roll your head in a circle, 30 seconds each direction"
    },
    {
        "name": "Shoulder Shrugs",
        "type": "reps",
        "sets": 2,
        "reps": 10,
        "description": "Lift shoulders up to ears, hold for 2 seconds, release"
    },
    {
        "name": "Ankle Circles",
        "type": "time",
        "duration": 60,
        "description": "Lift one foot and make circles with your ankle, switch feet"
    }
]'),
('Standing Balance Basics', 'standing', 15, 'easy', '[
    {
        "name": "Single Leg Stand",
        "type": "time",
        "duration": 30,
        "description": "Hold onto chair back, lift one foot slightly off ground"
    },
    {
        "name": "Heel-to-Toe Walk",
        "type": "reps",
        "sets": 1,
        "reps": 10,
        "description": "Walk in straight line placing heel directly in front of toe"
    },
    {
        "name": "Side Steps",
        "type": "reps",
        "sets": 2,
        "reps": 8,
        "description": "Step to the side and back, holding chair for support"
    }
]'),
('Chair Strength Training', 'sitting', 20, 'medium', '[
    {
        "name": "Seated Marching",
        "type": "time",
        "duration": 60,
        "description": "Lift knees alternately as if marching in place"
    },
    {
        "name": "Chair Push-ups",
        "type": "reps",
        "sets": 2,
        "reps": 8,
        "description": "Place hands on chair arms, push body up slightly"
    },
    {
        "name": "Leg Extensions",
        "type": "reps",
        "sets": 2,
        "reps": 10,
        "description": "Straighten one leg, hold for 2 seconds, lower slowly"
    }
]');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
