
CREATE OR REPLACE FUNCTION public.update_activity_status_from_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Only act if progress is what's being changed.
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.progress IS DISTINCT FROM OLD.progress) THEN
        
        -- If status is being explicitly set to a final state like 'delayed' or 'not-completed' during an update,
        -- respect that and don't let the progress-based logic override it.
        IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status AND NEW.status IN ('delayed', 'not-completed') THEN
            RETURN NEW;
        END IF;

        -- Standard logic to set status based on progress
        IF NEW.progress = 100 THEN
            NEW.status = 'completed';
        ELSIF NEW.progress > 0 AND NEW.progress < 100 THEN
            NEW.status = 'in-progress';
        ELSIF NEW.progress = 0 THEN
            NEW.status = 'pending';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
