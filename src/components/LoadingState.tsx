import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plane } from "lucide-react";

export const LoadingState = () => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-700">
      <div className="text-center space-y-4 mb-8">
        <div className="flex items-center justify-center gap-3">
          <Plane className="w-8 h-8 text-primary animate-pulse" />
          <h2 className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Crafting Your Perfect Journey
          </h2>
        </div>
        <p className="text-base text-muted-foreground font-medium animate-pulse">
          Our AI is analyzing destinations and creating your personalized itinerary...
        </p>
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="shadow-[var(--shadow-ocean)] border-2">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              
              <div className="space-y-3 mt-4">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};