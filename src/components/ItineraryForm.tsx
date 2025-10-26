import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Sparkles, Users } from "lucide-react";

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
}

export const ItineraryForm = ({ onGenerate, isLoading }: ItineraryFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    destination: "",
    startDate: "",
    endDate: "",
    travelers: "2",
    interests: "",
    budget: "moderate",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-[var(--shadow-ocean)]">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="destination" className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Destination
            </Label>
            <Input
              id="destination"
              placeholder="e.g., Paris, Tokyo, New York"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              required
              className="text-base"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="flex items-center gap-2">
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
                className="text-base"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="travelers" className="flex items-center gap-2">
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
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Travel Budget</Label>
            <select
              id="budget"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            >
              <option value="budget">Budget-Friendly</option>
              <option value="moderate">Moderate</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interests" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Interests & Preferences
            </Label>
            <Textarea
              id="interests"
              placeholder="e.g., art museums, local cuisine, hiking, nightlife, photography..."
              value={formData.interests}
              onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
              className="min-h-24 text-base resize-none"
              required
            />
          </div>

          <Button 
            type="submit" 
            variant="hero" 
            size="lg" 
            className="w-full"
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
