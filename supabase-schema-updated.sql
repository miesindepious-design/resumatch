-- Updated Supabase Schema for monetization features
-- Run this in Supabase SQL Editor

-- Update profiles table with trial fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS trial_start_at timestamptz,
ADD COLUMN IF NOT EXISTS trial_end_at timestamptz,
ADD COLUMN IF NOT EXISTS has_used_trial boolean DEFAULT false;

-- Create a function to start a free trial
CREATE OR REPLACE FUNCTION public.start_trial(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    trial_start_at = now(),
    trial_end_at = now() + interval '14 days',
    has_used_trial = true
  WHERE id = user_id;
END;
$$;
