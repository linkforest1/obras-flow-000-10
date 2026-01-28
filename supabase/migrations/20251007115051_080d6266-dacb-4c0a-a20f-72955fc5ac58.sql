-- Create table to track activity progress history
CREATE TABLE IF NOT EXISTS public.activity_progress_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id uuid NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  old_progress integer,
  new_progress integer NOT NULL,
  changed_by uuid NOT NULL REFERENCES auth.users(id),
  changed_at timestamp with time zone NOT NULL DEFAULT now(),
  pacote text NOT NULL DEFAULT 'Pacote 1'
);

-- Enable RLS
ALTER TABLE public.activity_progress_history ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view progress history from their pacote"
ON public.activity_progress_history
FOR SELECT
USING (pacote = get_current_user_pacote());

CREATE POLICY "Users can insert progress history"
ON public.activity_progress_history
FOR INSERT
WITH CHECK (auth.uid() = changed_by);

-- Create trigger function to log progress changes
CREATE OR REPLACE FUNCTION public.log_activity_progress_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if progress actually changed
  IF TG_OP = 'UPDATE' AND NEW.progress IS DISTINCT FROM OLD.progress THEN
    INSERT INTO public.activity_progress_history (
      activity_id,
      old_progress,
      new_progress,
      changed_by,
      pacote
    ) VALUES (
      NEW.id,
      OLD.progress,
      NEW.progress,
      auth.uid(),
      NEW.pacote
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on activities table
DROP TRIGGER IF EXISTS track_activity_progress_changes ON public.activities;
CREATE TRIGGER track_activity_progress_changes
AFTER UPDATE ON public.activities
FOR EACH ROW
EXECUTE FUNCTION public.log_activity_progress_change();

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_progress_history_activity_id 
ON public.activity_progress_history(activity_id);

CREATE INDEX IF NOT EXISTS idx_activity_progress_history_changed_at 
ON public.activity_progress_history(changed_at DESC);