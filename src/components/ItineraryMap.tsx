import { useEffect, useRef, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Mountain, Map, Satellite, Maximize2, Minimize2, Route } from 'lucide-react';

interface Location {
  name: string;
  day: number;
  type: "activity" | "meal" | "transport" | "evening";
}

interface ItineraryMapProps {
  destination: string;
  locations: Location[];
}

interface MarkerData {
  marker: mapboxgl.Marker;
  day: number;
}

const ItineraryMap = ({ destination, locations }: ItineraryMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapWrapper = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<MarkerData[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [is3D, setIs3D] = useState(false);
  const [isSatellite, setIsSatellite] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showRoutes, setShowRoutes] = useState(true);
  const routeLayersRef = useRef<string[]>([]);

  // Get unique days from locations
  const days = useMemo(() => {
    const uniqueDays = [...new Set(locations.map(loc => loc.day))].sort((a, b) => a - b);
    return uniqueDays;
  }, [locations]);

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

  // Update marker visibility when selectedDay changes
  useEffect(() => {
    markersRef.current.forEach(({ marker, day }) => {
      const element = marker.getElement();
      if (selectedDay === null || day === selectedDay) {
        element.style.display = 'flex';
      } else {
        element.style.display = 'none';
      }
    });
  }, [selectedDay]);

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

          // Geocode all locations (preserving order for routes)
          const geocodePromises = locations.map(async (location: Location, index: number) => {
            try {
              const locationQuery = `${location.name}, ${destination}`;
              const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationQuery)}.json?access_token=${mapboxToken}&limit=1`
              );
              const data = await response.json();
              
              if (data.features && data.features.length > 0) {
                const [locLng, locLat] = data.features[0].center;
                return { location, coordinates: [locLng, locLat] as [number, number], index };
              }
            } catch (error) {
              console.error(`Error geocoding ${location.name}:`, error);
            }
            return null;
          });

          const geocodedLocations = (await Promise.all(geocodePromises)).filter((item): item is { location: Location; coordinates: [number, number]; index: number } => item !== null);

          // Clear existing markers
          markersRef.current.forEach(({ marker }) => marker.remove());
          markersRef.current = [];

          // Get unique locations for markers (avoid duplicate markers)
          const uniqueMarkerLocations: Record<string, { location: Location; coordinates: [number, number] }> = {};
          geocodedLocations.forEach((item) => {
            const key = `${item.coordinates[0]},${item.coordinates[1]}`;
            if (!uniqueMarkerLocations[key]) {
              uniqueMarkerLocations[key] = { location: item.location, coordinates: item.coordinates };
            }
          });

          // Add markers
          Object.values(uniqueMarkerLocations).forEach(({ location, coordinates }) => {
            if (!map.current) return;
            
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

            const marker = new mapboxgl.Marker(el)
              .setLngLat(coordinates)
              .setPopup(popup)
              .addTo(map.current!);

            markersRef.current.push({ marker, day: location.day });
          });

          // Group locations by day for route drawing
          const locationsByDay: Record<number, [number, number][]> = {};
          geocodedLocations
            .sort((a, b) => a.index - b.index)
            .forEach((item) => {
              if (!locationsByDay[item.location.day]) {
                locationsByDay[item.location.day] = [];
              }
              locationsByDay[item.location.day].push(item.coordinates);
            });

          // Add route lines for each day
          map.current.on('load', () => {
            addRouteLayers(locationsByDay);
          });

          // If map already loaded, add routes immediately
          if (map.current.loaded()) {
            addRouteLayers(locationsByDay);
          }

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

  // Day colors for route lines
  const getDayColor = (day: number): string => {
    const colors = [
      '#ef4444', // red
      '#f97316', // orange
      '#eab308', // yellow
      '#22c55e', // green
      '#06b6d4', // cyan
      '#3b82f6', // blue
      '#8b5cf6', // violet
      '#ec4899', // pink
    ];
    return colors[(day - 1) % colors.length];
  };

  // Add route layers to the map
  const addRouteLayers = (locationsByDay: Record<number, [number, number][]>) => {
    if (!map.current) return;

    // Clear existing route layers
    routeLayersRef.current.forEach((layerId) => {
      if (map.current?.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
      const sourceId = `route-source-${layerId.split('-').pop()}`;
      if (map.current?.getSource(sourceId)) {
        map.current.removeSource(sourceId);
      }
    });
    routeLayersRef.current = [];

    // Add new route layers
    Object.entries(locationsByDay).forEach(([dayStr, coords]) => {
      const day = parseInt(dayStr);
      if (coords.length < 2 || !map.current) return;

      const sourceId = `route-source-${day}`;
      const layerId = `route-layer-${day}`;

      map.current.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coords
          }
        }
      });

      map.current.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': getDayColor(day),
          'line-width': 4,
          'line-opacity': 0.8,
          'line-dasharray': [2, 1]
        }
      });

      routeLayersRef.current.push(layerId);
    });
  };

  // Toggle routes visibility
  const toggleRoutes = () => {
    if (!map.current) return;
    
    routeLayersRef.current.forEach((layerId) => {
      if (map.current?.getLayer(layerId)) {
        const visibility = showRoutes ? 'none' : 'visible';
        map.current.setLayoutProperty(layerId, 'visibility', visibility);
      }
    });
    setShowRoutes(!showRoutes);
  };

  // Update route visibility when selectedDay changes
  useEffect(() => {
    if (!map.current) return;
    
    routeLayersRef.current.forEach((layerId) => {
      if (map.current?.getLayer(layerId)) {
        const day = parseInt(layerId.split('-').pop() || '0');
        const shouldShow = showRoutes && (selectedDay === null || day === selectedDay);
        map.current.setLayoutProperty(layerId, 'visibility', shouldShow ? 'visible' : 'none');
      }
    });
  }, [selectedDay, showRoutes]);

  // Toggle 3D terrain
  const toggle3DTerrain = () => {
    if (!map.current) return;
    
    if (is3D) {
      map.current.setTerrain(null);
      map.current.setPitch(0);
      map.current.setBearing(0);
    } else {
      map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
      map.current.setPitch(60);
      map.current.setBearing(-20);
    }
    setIs3D(!is3D);
  };

  // Toggle satellite view
  const toggleSatellite = () => {
    if (!map.current) return;
    
    const newStyle = isSatellite 
      ? 'mapbox://styles/mapbox/streets-v12'
      : 'mapbox://styles/mapbox/satellite-streets-v12';
    
    map.current.setStyle(newStyle);
    
    map.current.once('style.load', () => {
      if (!map.current) return;
      map.current.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
      });
      
      if (is3D) {
        map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
      }
    });
    
    setIsSatellite(!isSatellite);
  };

  // Toggle fullscreen
  const toggleFullscreen = async () => {
    if (!mapWrapper.current) return;
    
    if (!document.fullscreenElement) {
      await mapWrapper.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Resize map when fullscreen changes
      setTimeout(() => {
        map.current?.resize();
      }, 100);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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
    <div ref={mapWrapper} className="bg-card/50 backdrop-blur-sm border rounded-lg shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Itinerary Map</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Explore your journey locations and daily activities
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isSatellite ? "default" : "outline"}
              size="sm"
              onClick={toggleSatellite}
              className="flex items-center gap-2"
            >
              <Satellite className="h-4 w-4" />
              <span className="hidden sm:inline">{isSatellite ? "Streets" : "Satellite"}</span>
            </Button>
            <Button
              variant={showRoutes ? "default" : "outline"}
              size="sm"
              onClick={toggleRoutes}
              className="flex items-center gap-2"
            >
              <Route className="h-4 w-4" />
              <span className="hidden sm:inline">Routes</span>
            </Button>
            <Button
              variant={is3D ? "default" : "outline"}
              size="sm"
              onClick={toggle3DTerrain}
              className="flex items-center gap-2"
            >
              {is3D ? <Map className="h-4 w-4" /> : <Mountain className="h-4 w-4" />}
              <span className="hidden sm:inline">{is3D ? "2D View" : "3D Terrain"}</span>
            </Button>
            <Button
              variant={isFullscreen ? "default" : "outline"}
              size="sm"
              onClick={toggleFullscreen}
              className="flex items-center gap-2"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              <span className="hidden sm:inline">{isFullscreen ? "Exit" : "Fullscreen"}</span>
            </Button>
          </div>
        </div>
        
        {/* Day filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filter by day:</span>
          <Button
            variant={selectedDay === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedDay(null)}
            className="h-7 px-3 text-xs"
          >
            All
          </Button>
          {days.map(day => (
            <Button
              key={day}
              variant={selectedDay === day ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDay(day)}
              className="h-7 px-3 text-xs"
            >
              Day {day}
            </Button>
          ))}
        </div>
      </div>
      <div ref={mapContainer} className={`w-full ${isFullscreen ? 'flex-1' : 'h-96'}`} />
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
