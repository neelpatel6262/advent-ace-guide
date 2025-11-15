import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { LocationPicker } from "@/components/LocationPicker";
import { JourneyRouteCard } from "@/components/JourneyRouteCard";
import { TransportFilters, FilterState } from "@/components/TransportFilters";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RouteData {
  id: string;
  route_type: string;
  total_duration_minutes: number;
  total_cost: number;
  carbon_footprint_kg: number;
  num_transfers: number;
  comfort_rating: number;
  is_recommended: boolean;
  journey_segments: any[];
}

export default function MultiTransportPlanner() {
  const navigate = useNavigate();
  const [startLocation, setStartLocation] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    sortBy: "cheapest",
    transportTypes: ["flight", "train", "bus", "ferry", "car", "bike"],
    maxTransfers: 3,
    budgetRange: [0, 2000],
    travelStyle: "all",
  });

  // Generate mock routes for demonstration
  const generateMockRoutes = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const mockRoutes: RouteData[] = [
        {
          id: "1",
          route_type: "cheapest",
          total_duration_minutes: 870,
          total_cost: 355,
          carbon_footprint_kg: 125,
          num_transfers: 2,
          comfort_rating: 7.5,
          is_recommended: true,
          journey_segments: [
            {
              transport_type: "taxi",
              from_location: startLocation || "Home",
              to_location: origin + " Airport",
              departure_time: new Date(travelDate + "T06:30:00").toISOString(),
              arrival_time: new Date(travelDate + "T07:15:00").toISOString(),
              duration_minutes: 45,
              cost: 35,
              provider_name: "Uber",
              luggage_policy: "2 bags",
              notes: "Book in advance for better rates",
            },
            {
              transport_type: "flight",
              from_location: origin,
              to_location: "London",
              departure_time: new Date(travelDate + "T08:00:00").toISOString(),
              arrival_time: new Date(travelDate + "T16:00:00").toISOString(),
              duration_minutes: 480,
              cost: 180,
              provider_name: "United Airlines",
              booking_link: "https://united.com",
              luggage_policy: "1 checked bag included",
            },
            {
              transport_type: "train",
              from_location: "London",
              to_location: destination,
              departure_time: new Date(travelDate + "T18:00:00").toISOString(),
              arrival_time: new Date(travelDate + "T20:15:00").toISOString(),
              duration_minutes: 135,
              cost: 120,
              provider_name: "Eurostar",
              booking_link: "https://eurostar.com",
              luggage_policy: "2 large bags",
            },
            {
              transport_type: "taxi",
              from_location: destination + " Station",
              to_location: destination + " Hotel",
              departure_time: new Date(travelDate + "T20:15:00").toISOString(),
              arrival_time: new Date(travelDate + "T20:35:00").toISOString(),
              duration_minutes: 20,
              cost: 20,
              provider_name: "Local Taxi",
              luggage_policy: "3 bags",
            },
          ],
        },
        {
          id: "2",
          route_type: "fastest",
          total_duration_minutes: 540,
          total_cost: 580,
          carbon_footprint_kg: 180,
          num_transfers: 1,
          comfort_rating: 9.0,
          is_recommended: false,
          journey_segments: [
            {
              transport_type: "taxi",
              from_location: startLocation || "Home",
              to_location: origin + " Airport",
              departure_time: new Date(travelDate + "T10:00:00").toISOString(),
              arrival_time: new Date(travelDate + "T10:30:00").toISOString(),
              duration_minutes: 30,
              cost: 40,
              provider_name: "Uber Black",
            },
            {
              transport_type: "flight",
              from_location: origin,
              to_location: destination,
              departure_time: new Date(travelDate + "T12:00:00").toISOString(),
              arrival_time: new Date(travelDate + "T18:30:00").toISOString(),
              duration_minutes: 390,
              cost: 520,
              provider_name: "Air France",
              booking_link: "https://airfrance.com",
              luggage_policy: "2 checked bags",
              notes: "Direct flight - Business class available",
            },
            {
              transport_type: "taxi",
              from_location: destination + " Airport",
              to_location: destination + " Hotel",
              departure_time: new Date(travelDate + "T18:30:00").toISOString(),
              arrival_time: new Date(travelDate + "T19:00:00").toISOString(),
              duration_minutes: 30,
              cost: 25,
              provider_name: "Airport Taxi",
            },
          ],
        },
        {
          id: "3",
          route_type: "eco",
          total_duration_minutes: 1320,
          total_cost: 280,
          carbon_footprint_kg: 45,
          num_transfers: 3,
          comfort_rating: 6.5,
          is_recommended: false,
          journey_segments: [
            {
              transport_type: "bus",
              from_location: startLocation || "Home",
              to_location: origin + " Train Station",
              departure_time: new Date(travelDate + "T06:00:00").toISOString(),
              arrival_time: new Date(travelDate + "T07:00:00").toISOString(),
              duration_minutes: 60,
              cost: 15,
              provider_name: "City Bus",
            },
            {
              transport_type: "train",
              from_location: origin,
              to_location: "Brussels",
              departure_time: new Date(travelDate + "T08:00:00").toISOString(),
              arrival_time: new Date(travelDate + "T14:30:00").toISOString(),
              duration_minutes: 390,
              cost: 150,
              provider_name: "Amtrak",
              booking_link: "https://amtrak.com",
              luggage_policy: "2 large bags",
              notes: "Scenic route through countryside",
            },
            {
              transport_type: "train",
              from_location: "Brussels",
              to_location: destination,
              departure_time: new Date(travelDate + "T16:00:00").toISOString(),
              arrival_time: new Date(travelDate + "T17:30:00").toISOString(),
              duration_minutes: 90,
              cost: 95,
              provider_name: "Thalys",
              booking_link: "https://thalys.com",
            },
            {
              transport_type: "bike",
              from_location: destination + " Station",
              to_location: destination + " Hotel",
              departure_time: new Date(travelDate + "T17:30:00").toISOString(),
              arrival_time: new Date(travelDate + "T18:00:00").toISOString(),
              duration_minutes: 30,
              cost: 20,
              provider_name: "City Bike Share",
              notes: "Bike rental available 24/7",
            },
          ],
        },
      ];

      setRoutes(mockRoutes);
      setIsLoading(false);
      
      toast({
        title: "Routes found!",
        description: `Found ${mockRoutes.length} journey options for your trip.`,
      });
    }, 2000);
  };

  const handleSearch = () => {
    if (!origin || !destination || !travelDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    generateMockRoutes();
  };

  const filteredAndSortedRoutes = routes
    .filter((route) => {
      // Apply transport type filters
      const hasAllowedTransport = route.journey_segments.some((seg) =>
        filters.transportTypes.includes(seg.transport_type)
      );
      
      // Apply max transfers filter
      const withinTransferLimit = route.num_transfers <= filters.maxTransfers;
      
      // Apply budget filter
      const withinBudget =
        route.total_cost >= filters.budgetRange[0] &&
        route.total_cost <= filters.budgetRange[1];

      return hasAllowedTransport && withinTransferLimit && withinBudget;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case "cheapest":
          return a.total_cost - b.total_cost;
        case "fastest":
          return a.total_duration_minutes - b.total_duration_minutes;
        case "eco":
          return a.carbon_footprint_kg - b.carbon_footprint_kg;
        case "experience":
          return b.comfort_rating - a.comfort_rating;
        default:
          return 0;
      }
    });

  // Apply travel style preferences
  useEffect(() => {
    if (filters.travelStyle !== "all") {
      const stylePresets: Record<string, Partial<FilterState>> = {
        budget: { sortBy: "cheapest" },
        eco: { sortBy: "eco", transportTypes: ["train", "bus", "bike", "ferry"] },
        time: { sortBy: "fastest", maxTransfers: 1 },
        adventure: { sortBy: "experience" },
      };

      const preset = stylePresets[filters.travelStyle];
      if (preset) {
        setFilters((prev) => ({ ...prev, ...preset }));
      }
    }
  }, [filters.travelStyle]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Multi-Transport Journey Planner</h1>
              <p className="text-sm text-muted-foreground">
                Compare different transportation options for your trip
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Search Form */}
        <div className="space-y-6">
          <LocationPicker
            value={startLocation}
            onChange={(location) => setStartLocation(location)}
            label="Start From"
          />

          <Card className="border-border/50">
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin">From</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="origin"
                      placeholder="New York"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination">To</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="destination"
                      placeholder="Paris"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Travel Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching Routes...
                  </>
                ) : (
                  "Search Multi-Transport Routes"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {routes.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Found {filteredAndSortedRoutes.length} Routes
              </h2>
              <TransportFilters filters={filters} onFiltersChange={setFilters} />
            </div>

            <div className="grid gap-6">
              {filteredAndSortedRoutes.map((route) => (
                <JourneyRouteCard key={route.id} route={route} />
              ))}
            </div>

            {filteredAndSortedRoutes.length === 0 && (
              <Card className="border-border/50">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No routes match your filters. Try adjusting your preferences.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
