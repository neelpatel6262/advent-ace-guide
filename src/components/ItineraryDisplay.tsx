import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ItineraryCard } from "./ItineraryCard";
import { WeatherWidget } from "./WeatherWidget";
import { ShareModal } from "./ShareModal";
import { AuthPromptModal } from "./AuthPromptModal";
import { Download, Share2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ItineraryItem {
  title: string;
  type: "activity" | "meal" | "transport" | "evening";
  timeStart: string;
  timeEnd?: string;
  location: string;
  cost?: string;
  description: string;
  highlights: string[];
}

interface DayData {
  day: number;
  date?: string;
  summary?: string;
  items: ItineraryItem[];
}

interface ItineraryJSON {
  destination: string;
  days: DayData[];
  raw?: string;
}

interface ItineraryDisplayProps {
  itineraryData: ItineraryJSON;
  formData: {
    destination: string;
    startDate: string;
    endDate: string;
    travelers: string;
    interests: string;
    budget: string;
  };
}

export const ItineraryDisplay = ({ itineraryData, formData }: ItineraryDisplayProps) => {
  const { toast } = useToast();
  const [savedItineraryId, setSavedItineraryId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setShowAuthPrompt(true);
        setIsSaving(false);
        return;
      }

      const { data, error } = await supabase.from("itineraries").insert([
        {
          user_id: session.user.id,
          destination: formData.destination,
          start_date: formData.startDate,
          end_date: formData.endDate,
          travelers: parseInt(formData.travelers),
          budget: formData.budget,
          interests: formData.interests,
          itinerary_data: itineraryData as any,
          is_favorite: false,
        }
      ]).select().single();

      if (error) throw error;

      setSavedItineraryId(data.id);
      
      toast({
        title: "✅ Itinerary saved!",
        description: "Your itinerary has been saved successfully.",
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Save Failed",
        description: "Unable to save your itinerary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    // If not saved yet, save it first
    if (!savedItineraryId) {
      await handleSave();
      return;
    }
    
    setShowShareModal(true);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(itineraryData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formData.destination.replace(/\s+/g, "-")}-itinerary.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "Your itinerary has been downloaded.",
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          Your Perfect {itineraryData.destination} Adventure
        </h2>
        <p className="text-base text-muted-foreground font-medium">
          AI-crafted itinerary for {formData.travelers} traveler(s) • {formData.budget} budget
        </p>

        {/* Action buttons */}
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <Button 
            onClick={handleSave} 
            variant="default" 
            className="gap-2"
            disabled={isSaving || !!savedItineraryId}
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : savedItineraryId ? "Saved!" : "Save Itinerary"}
          </Button>
          <Button 
            onClick={handleShare} 
            variant="outline" 
            className="gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button onClick={handleDownload} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Download JSON
          </Button>
        </div>
      </div>

      {/* Weather widget */}
      <WeatherWidget destination={itineraryData.destination} date={formData.startDate} />

      {/* Days */}
      <div className="space-y-6">
        {itineraryData.days.map((dayData) => (
          <ItineraryCard key={dayData.day} dayData={dayData} />
        ))}
      </div>

      {/* Fallback for raw text if structured data is incomplete */}
      {itineraryData.raw && itineraryData.days.length === 0 && (
        <div className="p-6 border-2 rounded-lg bg-card/50 backdrop-blur-sm">
          <pre className="whitespace-pre-wrap text-sm">{itineraryData.raw}</pre>
        </div>
      )}

      {/* Modals */}
      {savedItineraryId && (
        <ShareModal
          open={showShareModal}
          onOpenChange={setShowShareModal}
          itineraryId={savedItineraryId}
          destination={itineraryData.destination}
        />
      )}
      
      <AuthPromptModal
        open={showAuthPrompt}
        onOpenChange={setShowAuthPrompt}
      />
    </div>
  );
};
