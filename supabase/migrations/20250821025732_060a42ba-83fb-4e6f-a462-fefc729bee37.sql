-- Add UPDATE policy for activity_comments table to allow users to edit their own comments
CREATE POLICY "Users can update their own activity comments" 
ON public.activity_comments 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);