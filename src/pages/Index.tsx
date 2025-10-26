import { useState } from "react";
import { ItineraryForm, FormData } from "@/components/ItineraryForm";
import { ItineraryDisplay } from "@/components/ItineraryDisplay";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plane } from "lucide-react";
import heroImage from "@/assets/hero-travel.jpg";

const Index = () => {
  const [itinerary, setItinerary] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async (formData: FormData) => {
    setIsLoading(true);
    setItinerary("");
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-itinerary", {
        body: formData,
      });

      if (error) throw error;

      if (data?.itinerary) {
        setItinerary(data.itinerary);
        setDestination(formData.destination);
        toast({
          title: "Itinerary Generated!",
          description: "Your personalized travel plan is ready.",
        });
      }
    } catch (error) {
      console.error("Error generating itinerary:", error);
      toast({
        title: "Generation Failed",
        description: "Unable to create your itinerary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
            <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-2xl">
              TripCraft AI
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-white/95 drop-shadow-lg max-w-2xl mx-auto">
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

      {/* Results Section */}
      {itinerary && (
        <section className="py-12 px-4 bg-background/50 backdrop-blur-sm">
          <div className="container mx-auto">
            <ItineraryDisplay itinerary={itinerary} destination={destination} />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 text-center text-muted-foreground border-t">
        <p className="text-sm">
          Powered by AI • Built with ❤️ for travelers
        </p>
      </footer>
    </div>
  );
};

export default Index;
