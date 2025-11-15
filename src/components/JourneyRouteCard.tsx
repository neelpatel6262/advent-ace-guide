import { useState } from "react";
import {
  Plane,
  Train,
  Bus,
  Ship,
  Car,
  Bike,
  Clock,
  DollarSign,
  Leaf,
  Users,
  Star,
  Zap,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { JourneyTimeline } from "./JourneyTimeline";

interface JourneySegment {
  transport_type: string;
  from_location: string;
  to_location: string;
  departure_time: string;
  arrival_time: string;
  duration_minutes: number;
  cost: number;
  provider_name?: string;
  booking_link?: string;
  luggage_policy?: string;
  notes?: string;
}

interface RouteData {
  id: string;
  route_type: string;
  total_duration_minutes: number;
  total_cost: number;
  carbon_footprint_kg: number;
  num_transfers: number;
  comfort_rating: number;
  is_recommended: boolean;
  journey_segments: JourneySegment[];
}

interface JourneyRouteCardProps {
  route: RouteData;
  onSave?: (routeId: string) => void;
}

const transportIcons: Record<string, any> = {
  flight: Plane,
  train: Train,
  bus: Bus,
  ferry: Ship,
  car: Car,
  bike: Bike,
  walk: Users,
  taxi: Car,
  uber: Car,
};

const routeTypeLabels: Record<string, { label: string; icon: any; color: string }> = {
  cheapest: { label: "Best Value", icon: DollarSign, color: "text-green-600" },
  fastest: { label: "Fastest Route", icon: Zap, color: "text-yellow-600" },
  eco: { label: "Greenest Option", icon: Leaf, color: "text-green-700" },
  experience: { label: "Best Experience", icon: Star, color: "text-purple-600" },
  balanced: { label: "Balanced", icon: Star, color: "text-blue-600" },
};

export const JourneyRouteCard = ({ route, onSave }: JourneyRouteCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(0)}`;
  };

  const routeTypeInfo = routeTypeLabels[route.route_type] || routeTypeLabels.balanced;
  const RouteIcon = routeTypeInfo.icon;

  return (
    <Card className="border-border/50 hover:border-primary/50 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {route.is_recommended && (
                <Badge variant="default" className="bg-accent text-accent-foreground">
                  <RouteIcon className="w-3 h-3 mr-1" />
                  {routeTypeInfo.label}
                </Badge>
              )}
              <CardTitle className="text-lg">
                {route.journey_segments[0]?.from_location} → {route.journey_segments[route.journey_segments.length - 1]?.to_location}
              </CardTitle>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Transport Icons Timeline */}
        <div className="flex items-center gap-2 py-2 overflow-x-auto">
          {route.journey_segments.map((segment, idx) => {
            const Icon = transportIcons[segment.transport_type] || Car;
            return (
              <div key={idx} className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                {idx < route.journey_segments.length - 1 && (
                  <div className="w-8 h-0.5 bg-border"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Duration</span>
            </div>
            <p className="font-semibold">{formatDuration(route.total_duration_minutes)}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">Total Cost</span>
            </div>
            <p className="font-semibold">{formatCost(route.total_cost)}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Leaf className="w-4 h-4" />
              <span className="text-xs">CO₂</span>
            </div>
            <p className="font-semibold">{route.carbon_footprint_kg} kg</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="text-xs">Transfers</span>
            </div>
            <p className="font-semibold">{route.num_transfers}</p>
          </div>
        </div>

        {/* Comfort Rating */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Comfort Level</span>
            <span>{(route.comfort_rating * 10).toFixed(0)}/10</span>
          </div>
          <Progress value={route.comfort_rating * 10} className="h-2" />
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-border/50">
            <JourneyTimeline segments={route.journey_segments} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="default"
            className="flex-1"
            onClick={() => {
              // Open booking links
              route.journey_segments.forEach((segment) => {
                if (segment.booking_link) {
                  window.open(segment.booking_link, "_blank");
                }
              });
            }}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Book This Journey
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Less" : "Details"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
