import { useState } from "react";
import { ItineraryForm, FormData } from "@/components/ItineraryForm";
import { ItineraryDisplay } from "@/components/ItineraryDisplay";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plane } from "lucide-react";
import heroImage from "@/assets/hero-travel.jpg";

interface ItineraryJSON {
  destination: string;
  days: Array<{
    day: number;
    date?: string;
    summary?: string;
    items: Array<{
      title: string;
      type: "activity" | "meal" | "transport" | "evening";
      timeStart: string;
      timeEnd?: string;
      location: string;
      cost?: string;
      description: string;
      highlights: string[];
    }>;
  }>;
  raw?: string;
}

const Index = () => {
  const [itineraryData, setItineraryData] = useState<ItineraryJSON | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const { toast } = useToast();

  const handleGenerate = async (data: FormData) => {
    setIsLoading(true);
    setItineraryData(null);
    setError("");
    setFormData(data);
    
    try {
      const { data: response, error: invokeError } = await supabase.functions.invoke("generate-itinerary", {
        body: data,
      });

      if (invokeError) throw invokeError;

      if (response?.itinerary_json) {
        setItineraryData(response.itinerary_json);
        toast({
          title: "Itinerary Generated!",
          description: "Your personalized travel plan is ready.",
        });
      } else {
        throw new Error("No itinerary data received");
      }
    } catch (err: any) {
      console.error("Error generating itinerary:", err);
      const errorMessage = err?.message || "Unable to create your itinerary. Please try again.";
      setError(errorMessage);
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (formData) {
      handleGenerate(formData);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--gradient-hero)]">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-background" />
        </div>
        
        <div className="relative z-10 text-center px-4 space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Plane className="w-12 h-12 text-white drop-shadow-lg" />
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white drop-shadow-2xl tracking-tight">
              TripCraft AI
            </h1>
          </div>
          <p className="text-lg md:text-xl text-white/95 drop-shadow-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Your personal AI travel planner. Create perfect itineraries in seconds, tailored to your dreams.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <ItineraryForm onGenerate={handleGenerate} isLoading={isLoading} />
        </div>
      </section>

      {/* Loading Section */}
      {isLoading && (
        <section className="py-12 px-4 bg-background/50 backdrop-blur-sm">
          <div className="container mx-auto">
            <LoadingState />
          </div>
        </section>
      )}

      {/* Error Section */}
      {error && !isLoading && (
        <section className="py-12 px-4 bg-background/50 backdrop-blur-sm">
          <div className="container mx-auto">
            <ErrorState message={error} onRetry={handleRetry} />
          </div>
        </section>
      )}

      {/* Results Section */}
      {itineraryData && !isLoading && formData && (
        <section className="py-12 px-4 bg-background/50 backdrop-blur-sm">
          <div className="container mx-auto">
            <ItineraryDisplay itineraryData={itineraryData} formData={formData} />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 text-center text-muted-foreground border-t bg-card/50 backdrop-blur-sm">
        <p className="text-sm font-medium">
          Powered by AI • Built with ❤️ for travelers
        </p>
      </footer>
    </div>
  );
};

export default Index;
