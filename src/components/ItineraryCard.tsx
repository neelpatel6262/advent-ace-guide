import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, MapPin, Clock, DollarSign, Sparkles, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface ItineraryCardProps {
  dayData: DayData;
  onSave?: () => void;
  isFavorite?: boolean;
}

const typeColors = {
  activity: "bg-primary/10 text-primary border-primary/20",
  meal: "bg-secondary/10 text-secondary border-secondary/20",
  transport: "bg-accent/10 text-accent border-accent/20",
  evening: "bg-primary-glow/10 text-primary-glow border-primary-glow/20",
};

const typeIcons = {
  activity: Sparkles,
  meal: "🍽️",
  transport: "🚗",
  evening: "🌙",
};

export const ItineraryCard = ({ dayData, onSave, isFavorite }: ItineraryCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card className="group relative overflow-hidden border-2 backdrop-blur-sm bg-card/95 shadow-[var(--shadow-ocean)] hover:shadow-[var(--shadow-sunset)] transition-all duration-500 hover:scale-[1.01]">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      
      <CardHeader className="relative border-b-2 bg-gradient-to-r from-primary/10 via-primary-glow/5 to-secondary/5">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-2xl font-display">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold shadow-lg">
              {dayData.day}
            </div>
            <div>
              <div className="text-lg">Day {dayData.day}</div>
              {dayData.date && (
                <div className="text-sm text-muted-foreground font-normal">
                  {new Date(dayData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
              )}
            </div>
          </CardTitle>
          
          <div className="flex gap-2">
            {onSave && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onSave}
                className={cn(
                  "transition-all duration-300",
                  isFavorite ? "text-destructive hover:text-destructive/80" : "text-muted-foreground hover:text-primary"
                )}
              >
                <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="transition-transform duration-300"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        
        {dayData.summary && (
          <p className="text-sm text-muted-foreground mt-2 font-medium">{dayData.summary}</p>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="relative pt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {dayData.items.map((item, idx) => {
            const IconComponent = typeof typeIcons[item.type] !== "string" ? typeIcons[item.type] : null;
            const iconEmoji = typeof typeIcons[item.type] === "string" ? String(typeIcons[item.type]) : null;
            
            return (
              <div
                key={idx}
                className="group/item p-4 rounded-lg border-2 backdrop-blur-sm bg-card/50 hover:bg-card/80 transition-all duration-300 hover:scale-[1.01] space-y-3"
              >
                {/* Header with title and badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      {IconComponent && <IconComponent className="w-4 h-4 text-primary flex-shrink-0 mt-1" />}
                      {iconEmoji && <span className="text-lg flex-shrink-0">{iconEmoji}</span>}
                      <h3 className="font-semibold text-base sm:text-lg break-words">{item.title}</h3>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn("flex-shrink-0 border-2 text-xs", typeColors[item.type])}>
                    {item.type}
                  </Badge>
                </div>

                {/* Time, location, cost */}
                <div className="flex flex-col gap-2 text-xs sm:text-sm">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="font-medium whitespace-nowrap">
                        {item.timeStart}{item.timeEnd ? ` - ${item.timeEnd}` : ""}
                      </span>
                    </div>
                    
                    {item.cost && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <DollarSign className="w-4 h-4 text-accent flex-shrink-0" />
                        <span className="font-medium whitespace-nowrap">{item.cost}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-start gap-1.5 text-muted-foreground">
                    <MapPin className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                    <span className="font-medium break-words leading-relaxed">{item.location}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-foreground leading-relaxed break-words">{item.description}</p>

                {/* Highlights */}
                {item.highlights && item.highlights.length > 0 && (
                  <div className="pt-2 border-t">
                    <div className="flex flex-wrap gap-2">
                      {item.highlights.map((highlight, hIdx) => (
                        <Badge
                          key={hIdx}
                          variant="secondary"
                          className="text-xs bg-primary/5 text-primary border border-primary/20"
                        >
                          ✨ {highlight}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
};