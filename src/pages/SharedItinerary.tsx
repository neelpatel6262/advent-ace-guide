import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ItineraryCard } from "@/components/ItineraryCard";
import { WeatherWidget } from "@/components/WeatherWidget";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plane } from "lucide-react";

interface ItineraryData {
  destination: string;
  start_date: string;
  end_date: string;
  travelers: number;
  budget: string;
  interests: string;
  itinerary_data: {
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
  };
}

const SharedItinerary = () => {
  const { id } = useParams<{ id: string }>();
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Calculate total budget
  const calculateTotalBudget = (itineraryData: ItineraryData) => {
    let total = 0;
    itineraryData.itinerary_data.days.forEach(day => {
      day.items.forEach(item => {
        if (item.cost) {
          const costMatch = item.cost.match(/[\d,]+/);
          if (costMatch) {
            const numericCost = parseFloat(costMatch[0].replace(/,/g, ''));
            total += numericCost;
          }
        }
      });
    });
    return total;
  };

  useEffect(() => {
    const fetchItinerary = async () => {
      if (!id) {
        setError("Invalid itinerary link");
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("itineraries")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (!data) {
          setError("Itinerary not found");
        } else {
          setItinerary(data as unknown as ItineraryData);
        }
      } catch (err: any) {
        console.error("Error fetching itinerary:", err);
        setError("Unable to load itinerary. It may have been deleted.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchItinerary();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--gradient-hero)] flex items-center justify-center p-4">
        <LoadingState />
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-[var(--gradient-hero)] flex items-center justify-center p-4">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--gradient-hero)]">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Plane className="w-6 h-6 text-primary" />
            <span className="text-xl font-display font-bold">TripCraft AI</span>
          </Link>
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Create Your Own
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                {itinerary.itinerary_data.destination} Adventure
              </h2>
              <p className="text-base text-muted-foreground font-medium">
                {itinerary.travelers} traveler(s) • {itinerary.budget} budget • {itinerary.interests}
              </p>
            </div>

            {/* Budget Summary */}
            {(() => {
              const totalBudget = calculateTotalBudget(itinerary);
              const budgetPerPerson = totalBudget / itinerary.travelers;
              return totalBudget > 0 ? (
                <div className="bg-card/50 backdrop-blur-sm border rounded-lg p-6 shadow-sm mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Estimated Total Budget</p>
                      <p className="text-2xl font-bold text-foreground mt-1">₹{totalBudget.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground font-medium">Per Person</p>
                      <p className="text-2xl font-bold text-primary mt-1">₹{budgetPerPerson.toLocaleString()}</p>
                    </div>
                  </div>
                  {itinerary.travelers > 1 && (
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      Based on {itinerary.travelers} travelers
                    </p>
                  )}
                </div>
              ) : null;
            })()}

            {/* Weather widget */}
            <WeatherWidget destination={itinerary.destination} date={itinerary.start_date} />

            {/* Days */}
            <div className="space-y-6">
              {itinerary.itinerary_data.days.map((dayData) => (
                <ItineraryCard key={dayData.day} dayData={dayData} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-muted-foreground border-t bg-card/50 backdrop-blur-sm">
        <p className="text-sm font-medium">
          Powered by AI • Built with ❤️ for travelers
        </p>
      </footer>
    </div>
  );
};

export default SharedItinerary;
