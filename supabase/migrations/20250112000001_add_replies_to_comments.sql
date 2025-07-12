-- Add parent_id column to support nested comments/replies
ALTER TABLE public.comments ADD COLUMN parent_id bigint REFERENCES public.comments(id) ON DELETE CASCADE;

-- Create index for better performance when fetching replies
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX idx_comments_post_parent ON public.comments(post_id, parent_id); 