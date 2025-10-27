-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for saved itineraries
CREATE TABLE public.itineraries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  travelers INTEGER NOT NULL,
  budget TEXT NOT NULL,
  interests TEXT NOT NULL,
  itinerary_data JSONB NOT NULL,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (no auth required yet)
CREATE POLICY "Anyone can view itineraries" 
ON public.itineraries 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create itineraries" 
ON public.itineraries 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update itineraries" 
ON public.itineraries 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete itineraries" 
ON public.itineraries 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_itineraries_updated_at
BEFORE UPDATE ON public.itineraries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();