-- Ensure the trigger exists to log activity progress changes
-- First, drop the trigger if it exists to recreate it fresh
DROP TRIGGER IF EXISTS log_activity_progress_trigger ON public.activities;

-- Recreate the trigger to ensure it's active
CREATE TRIGGER log_activity_progress_trigger
  AFTER INSERT OR UPDATE OF progress ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION public.log_activity_progress_change();

-- Add index for better performance when querying progress history
CREATE INDEX IF NOT EXISTS idx_activity_progress_history_activity_id 
  ON public.activity_progress_history(activity_id);

CREATE INDEX IF NOT EXISTS idx_activity_progress_history_changed_at 
  ON public.activity_progress_history(changed_at DESC);