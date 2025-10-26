import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Utensils, Camera, Info } from "lucide-react";

interface ItineraryDisplayProps {
  itinerary: string;
  destination: string;
}

export const ItineraryDisplay = ({ itinerary, destination }: ItineraryDisplayProps) => {
  // Parse the itinerary into structured sections
  const sections = itinerary.split(/\n\n+/).filter(Boolean);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Your Perfect {destination} Adventure
        </h2>
        <p className="text-muted-foreground">AI-crafted itinerary tailored just for you</p>
      </div>

      <div className="space-y-4">
        {sections.map((section, index) => {
          const isDay = section.match(/Day \d+/i);
          const hasActivity = section.toLowerCase().includes("morning") || 
                             section.toLowerCase().includes("afternoon") || 
                             section.toLowerCase().includes("evening");
          
          return (
            <Card 
              key={index} 
              className="shadow-[var(--shadow-ocean)] hover:shadow-[var(--shadow-sunset)] transition-all duration-300 hover:scale-[1.01]"
            >
              <CardHeader className={isDay ? "bg-gradient-to-r from-primary/10 to-primary-glow/10 border-b" : ""}>
                <CardTitle className="flex items-center gap-2">
                  {isDay ? (
                    <>
                      <Calendar className="w-5 h-5 text-primary" />
                      {section.split('\n')[0]}
                    </>
                  ) : (
                    <>
                      <Info className="w-5 h-5 text-accent" />
                      Overview
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="prose prose-sm max-w-none">
                  {section.split('\n').slice(isDay ? 1 : 0).map((line, lineIndex) => {
                    if (!line.trim()) return null;
                    
                    const isMorning = line.toLowerCase().includes("morning");
                    const isAfternoon = line.toLowerCase().includes("afternoon");
                    const isEvening = line.toLowerCase().includes("evening");
                    const isDining = line.toLowerCase().includes("lunch") || 
                                   line.toLowerCase().includes("dinner") ||
                                   line.toLowerCase().includes("breakfast");
                    
                    let icon = null;
                    if (isMorning || isAfternoon || isEvening) {
                      icon = <Camera className="w-4 h-4 text-primary inline mr-2" />;
                    } else if (isDining) {
                      icon = <Utensils className="w-4 h-4 text-secondary inline mr-2" />;
                    } else if (line.startsWith('•') || line.startsWith('-')) {
                      icon = <MapPin className="w-4 h-4 text-accent inline mr-2" />;
                    }
                    
                    return (
                      <p 
                        key={lineIndex} 
                        className="mb-2 leading-relaxed text-foreground flex items-start"
                      >
                        {icon}
                        <span className={isMorning || isAfternoon || isEvening ? "font-semibold" : ""}>
                          {line.replace(/^[•\-]\s*/, '')}
                        </span>
                      </p>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
