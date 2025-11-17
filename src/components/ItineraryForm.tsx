import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ChevronDown, MapPin, Sparkles, Users, CarFront } from "lucide-react";

interface ItineraryFormProps {
  onGenerate: (data: FormData) => void;
  isLoading: boolean;
}

export interface FormData {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: string;
  interests: string;
  budget: string;
  transportMode: string;
}

export const ItineraryForm = ({ onGenerate, isLoading }: ItineraryFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    destination: "",
    startDate: "",
    endDate: "",
    travelers: "2",
    interests: "",
    budget: "moderate",
    transportMode: "any",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-[var(--shadow-ocean)] border-2">
      <CardContent className="pt-8 pb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="destination" className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="w-4 h-4 text-primary" />
              Destination
            </Label>
            <Input
              id="destination"
              placeholder="e.g., Paris, Tokyo, New York"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              required
              className="text-base h-11"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-2 text-sm font-semibold">
                <Calendar className="w-4 h-4 text-primary" />
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="flex items-center gap-2 text-sm font-semibold">
                <Calendar className="w-4 h-4 text-primary" />
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
                min={formData.startDate}
                className="text-base h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="travelers" className="flex items-center gap-2 text-sm font-semibold">
              <Users className="w-4 h-4 text-primary" />
              Number of Travelers
            </Label>
            <Input
              id="travelers"
              type="number"
              min="1"
              max="20"
              value={formData.travelers}
              onChange={(e) => setFormData({ ...formData, travelers: e.target.value })}
              required
              className="text-base h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget" className="text-sm font-semibold">Travel Budget</Label>
            <div className="relative">
              <select
                id="budget"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full h-11 px-3 pr-10 rounded-md border-2 border-input bg-background text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-medium appearance-none cursor-pointer"
                required
              >
                <option value="budget">Budget-Friendly</option>
                <option value="moderate">Moderate</option>
                <option value="luxury">Luxury</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transportMode" className="flex items-center gap-2 text-sm font-semibold">
              <CarFront className="w-4 h-4 text-primary" />
              Preferred Transport Mode
            </Label>
            <div className="relative">
              <select
                id="transportMode"
                value={formData.transportMode}
                onChange={(e) => setFormData({ ...formData, transportMode: e.target.value })}
                className="w-full h-11 px-3 pr-10 rounded-md border-2 border-input bg-background text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-medium appearance-none cursor-pointer"
                required
              >
                <option value="any">Any (Flexible)</option>
                <option value="flight">Flight</option>
                <option value="train">Train</option>
                <option value="bus">Bus</option>
                <option value="car">Car/Self-Drive</option>
                <option value="bike">Bike/Motorcycle</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interests" className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="w-4 h-4 text-primary" />
              Interests & Preferences
            </Label>
            <Textarea
              id="interests"
              placeholder="e.g., art museums, local cuisine, hiking, nightlife, photography..."
              value={formData.interests}
              onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
              className="min-h-28 text-base resize-none"
              required
            />
          </div>

          <Button 
            type="submit" 
            variant="default" 
            size="lg" 
            className="w-full h-12 text-base font-bold"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                Generating Your Perfect Trip...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate My Itinerary
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
