import { useState, useEffect } from "react";
import { MapPin, Home, Hotel, Plane, Search, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SavedLocation {
  id: string;
  location_name: string;
  address: string;
  location_type: string;
}

interface LocationPickerProps {
  value: string;
  onChange: (location: string, coordinates?: { lat: number; lng: number }) => void;
  label?: string;
}

export const LocationPicker = ({ value, onChange, label = "Starting Location" }: LocationPickerProps) => {
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [locationType, setLocationType] = useState<string>("manual");
  const [manualAddress, setManualAddress] = useState(value);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    loadSavedLocations();
  }, []);

  const loadSavedLocations = async () => {
    const { data, error } = await supabase
      .from("saved_locations")
      .select("*")
      .order("is_default", { ascending: false });

    if (error) {
      console.error("Error loading saved locations:", error);
      return;
    }

    setSavedLocations(data || []);
  };

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Use reverse geocoding to get address (simplified)
          const address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          onChange(address, { lat: latitude, lng: longitude });
          setManualAddress(address);
          setIsLoadingLocation(false);
          
          toast({
            title: "Location detected",
            description: "Using your current location",
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({
            title: "Location Error",
            description: "Could not detect your location. Please enter manually.",
            variant: "destructive",
          });
          setIsLoadingLocation(false);
        }
      );
    } else {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      setIsLoadingLocation(false);
    }
  };

  const handleSavedLocationChange = (locationId: string) => {
    const location = savedLocations.find((loc) => loc.id === locationId);
    if (location) {
      onChange(location.address);
      setManualAddress(location.address);
    }
  };

  const handleManualAddressChange = (address: string) => {
    setManualAddress(address);
    onChange(address);
  };

  return (
    <Card className="border-border/50">
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label className="text-base font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {label}
          </Label>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={getCurrentLocation}
              disabled={isLoadingLocation}
              className="flex-1 min-w-[120px]"
            >
              <Navigation className="w-4 h-4 mr-2" />
              {isLoadingLocation ? "Detecting..." : "Current"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setLocationType("saved")}
              className="flex-1 min-w-[120px]"
            >
              <Home className="w-4 h-4 mr-2" />
              Saved
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setLocationType("search")}
              className="flex-1 min-w-[120px]"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {locationType === "saved" && savedLocations.length > 0 && (
          <Select onValueChange={handleSavedLocationChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a saved location" />
            </SelectTrigger>
            <SelectContent>
              {savedLocations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  <div className="flex items-center gap-2">
                    {loc.location_type === "home" && <Home className="w-4 h-4" />}
                    {loc.location_type === "hotel" && <Hotel className="w-4 h-4" />}
                    {loc.location_type === "airport" && <Plane className="w-4 h-4" />}
                    <span>{loc.location_name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            placeholder="Enter starting address"
            value={manualAddress}
            onChange={(e) => handleManualAddressChange(e.target.value)}
            className="w-full"
          />
        </div>

        {value && (
          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
            <MapPin className="w-3 h-3 inline mr-1" />
            Starting from: {value}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
