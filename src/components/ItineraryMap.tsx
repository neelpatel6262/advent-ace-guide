import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Mountain, Map } from 'lucide-react';

interface Location {
  name: string;
  day: number;
  type: "activity" | "meal" | "transport" | "evening";
}

interface ItineraryMapProps {
  destination: string;
  locations: Location[];
}

const ItineraryMap = ({ destination, locations }: ItineraryMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [is3D, setIs3D] = useState(false);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        if (data?.token) {
          setMapboxToken(data.token);
        }
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    // Geocode destination to get coordinates
    const geocodeDestination = async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?access_token=${mapboxToken}`
        );
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;

          // Initialize map
          map.current = new mapboxgl.Map({
            container: mapContainer.current!,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [lng, lat],
            zoom: 12,
          });

          // Add navigation controls
          map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

          // Add terrain source on load
          map.current.on('load', () => {
            if (!map.current) return;
            map.current.addSource('mapbox-dem', {
              type: 'raster-dem',
              url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
              tileSize: 512,
              maxzoom: 14
            });
          });

          // Add markers for each unique location
          const uniqueLocations: Record<string, Location> = {};
          locations.forEach(loc => {
            if (!uniqueLocations[loc.name]) {
              uniqueLocations[loc.name] = loc;
            }
          });

          const geocodePromises = Object.values(uniqueLocations).map(async (location: Location) => {
            try {
              const locationQuery = `${location.name}, ${destination}`;
              const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationQuery)}.json?access_token=${mapboxToken}&limit=1`
              );
              const data = await response.json();
              
              if (data.features && data.features.length > 0) {
                const [locLng, locLat] = data.features[0].center;
                return { location, coordinates: [locLng, locLat] as [number, number] };
              }
            } catch (error) {
              console.error(`Error geocoding ${location.name}:`, error);
            }
            return null;
          });

          const geocodedLocations = (await Promise.all(geocodePromises)).filter((item): item is { location: Location; coordinates: [number, number] } => item !== null);

          // Add markers
          geocodedLocations.forEach((item) => {
            if (!map.current) return;
            
            const { location, coordinates } = item;
            
            // Create custom marker element
            const el = document.createElement('div');
            el.className = 'custom-marker';
            el.style.width = '32px';
            el.style.height = '32px';
            el.style.borderRadius = '50%';
            el.style.backgroundColor = getMarkerColor(location.type);
            el.style.border = '3px solid white';
            el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.style.color = 'white';
            el.style.fontWeight = 'bold';
            el.style.fontSize = '14px';
            el.textContent = location.day.toString();

            // Create popup
            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div style="padding: 8px;">
                <strong>Day ${location.day}</strong><br/>
                ${location.name}<br/>
                <span style="color: #666; font-size: 12px;">${location.type}</span>
              </div>`
            );

            new mapboxgl.Marker(el)
              .setLngLat(coordinates)
              .setPopup(popup)
              .addTo(map.current!);
          });

          // Fit map to show all markers
          if (geocodedLocations.length > 1) {
            const bounds = new mapboxgl.LngLatBounds();
            geocodedLocations.forEach((item) => {
              bounds.extend(item.coordinates);
            });
            map.current.fitBounds(bounds, { padding: 50 });
          }
        }
      } catch (error) {
        console.error('Error geocoding destination:', error);
      }
    };

    geocodeDestination();

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, destination, locations]);

  // Toggle 3D terrain
  const toggle3DTerrain = () => {
    if (!map.current) return;
    
    if (is3D) {
      // Disable 3D terrain
      map.current.setTerrain(null);
      map.current.setPitch(0);
      map.current.setBearing(0);
    } else {
      // Enable 3D terrain
      map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
      map.current.setPitch(60);
      map.current.setBearing(-20);
    }
    setIs3D(!is3D);
  };

  const getMarkerColor = (type: string): string => {
    switch (type) {
      case 'activity':
        return 'hsl(var(--primary))';
      case 'meal':
        return '#f59e0b';
      case 'transport':
        return '#3b82f6';
      case 'evening':
        return '#8b5cf6';
      default:
        return 'hsl(var(--primary))';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card/50 backdrop-blur-sm border rounded-lg p-6 shadow-sm">
        <div className="h-96 flex items-center justify-center">
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!mapboxToken) {
    return null;
  }

  return (
    <div className="bg-card/50 backdrop-blur-sm border rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Itinerary Map</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Explore your journey locations and daily activities
          </p>
        </div>
        <Button
          variant={is3D ? "default" : "outline"}
          size="sm"
          onClick={toggle3DTerrain}
          className="flex items-center gap-2"
        >
          {is3D ? <Map className="h-4 w-4" /> : <Mountain className="h-4 w-4" />}
          {is3D ? "2D View" : "3D Terrain"}
        </Button>
      </div>
      <div ref={mapContainer} className="w-full h-96" />
      <div className="p-4 border-t bg-background/30">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'hsl(var(--primary))' }}></div>
            <span className="text-muted-foreground">Activity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#f59e0b]"></div>
            <span className="text-muted-foreground">Meal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#3b82f6]"></div>
            <span className="text-muted-foreground">Transport</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#8b5cf6]"></div>
            <span className="text-muted-foreground">Evening</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryMap;
