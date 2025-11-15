-- Create saved_locations table for user's starting points
CREATE TABLE IF NOT EXISTS public.saved_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  location_type TEXT CHECK (location_type IN ('home', 'work', 'hotel', 'airport', 'custom')),
  address TEXT NOT NULL,
  city TEXT,
  country TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create multi_transport_routes table
CREATE TABLE IF NOT EXISTS public.multi_transport_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES public.itineraries(id) ON DELETE CASCADE,
  starting_location_id UUID REFERENCES public.saved_locations(id) ON DELETE SET NULL,
  starting_address TEXT NOT NULL,
  starting_coordinates JSONB,
  origin_location TEXT NOT NULL,
  destination_location TEXT NOT NULL,
  origin_coordinates JSONB,
  destination_coordinates JSONB,
  initial_transit_time_minutes INTEGER,
  journey_segments JSONB DEFAULT '[]'::jsonb,
  total_duration_minutes INTEGER,
  total_duration_including_start INTEGER,
  total_cost DECIMAL(10, 2),
  carbon_footprint_kg DECIMAL(10, 2),
  num_transfers INTEGER DEFAULT 0,
  comfort_rating DECIMAL(3, 2),
  route_type TEXT CHECK (route_type IN ('cheapest', 'fastest', 'eco', 'experience', 'balanced')),
  is_recommended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journey_segments table
CREATE TABLE IF NOT EXISTS public.journey_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES public.multi_transport_routes(id) ON DELETE CASCADE,
  segment_order INTEGER NOT NULL,
  transport_type TEXT NOT NULL CHECK (transport_type IN ('flight', 'train', 'bus', 'ferry', 'car', 'bike', 'walk', 'taxi', 'uber')),
  departure_time TIMESTAMP WITH TIME ZONE,
  arrival_time TIMESTAMP WITH TIME ZONE,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  provider_name TEXT,
  booking_link TEXT,
  cost DECIMAL(10, 2),
  duration_minutes INTEGER,
  carbon_kg DECIMAL(10, 2),
  luggage_policy TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.saved_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multi_transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_segments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_locations
CREATE POLICY "Users can view their own saved locations"
  ON public.saved_locations FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own saved locations"
  ON public.saved_locations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own saved locations"
  ON public.saved_locations FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete their own saved locations"
  ON public.saved_locations FOR DELETE
  USING (true);

-- RLS Policies for multi_transport_routes
CREATE POLICY "Anyone can view multi transport routes"
  ON public.multi_transport_routes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert multi transport routes"
  ON public.multi_transport_routes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update multi transport routes"
  ON public.multi_transport_routes FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete multi transport routes"
  ON public.multi_transport_routes FOR DELETE
  USING (true);

-- RLS Policies for journey_segments
CREATE POLICY "Anyone can view journey segments"
  ON public.journey_segments FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert journey segments"
  ON public.journey_segments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update journey segments"
  ON public.journey_segments FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete journey segments"
  ON public.journey_segments FOR DELETE
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_saved_locations_user_id ON public.saved_locations(user_id);
CREATE INDEX idx_multi_transport_routes_itinerary_id ON public.multi_transport_routes(itinerary_id);
CREATE INDEX idx_journey_segments_route_id ON public.journey_segments(route_id);
CREATE INDEX idx_journey_segments_order ON public.journey_segments(route_id, segment_order);

-- Create trigger for updated_at on saved_locations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_saved_locations_updated_at
    BEFORE UPDATE ON public.saved_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_multi_transport_routes_updated_at
    BEFORE UPDATE ON public.multi_transport_routes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();