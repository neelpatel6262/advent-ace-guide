-- Update itineraries table to ensure user_id can be null for public itineraries
-- This allows both authenticated users to save and anonymous users to create shareable itineraries

-- Add an index on user_id for better query performance when fetching user's itineraries
CREATE INDEX IF NOT EXISTS idx_itineraries_user_id ON public.itineraries(user_id);

-- Add an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_itineraries_created_at ON public.itineraries(created_at DESC);