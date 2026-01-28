
-- Add responsible column to daily_reports table
ALTER TABLE public.daily_reports 
ADD COLUMN responsible text;
