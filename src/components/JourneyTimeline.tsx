import {
  Plane,
  Train,
  Bus,
  Ship,
  Car,
  Bike,
  Users,
  Clock,
  DollarSign,
  Package,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

interface JourneyTimelineProps {
  segments: JourneySegment[];
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

const transportColors: Record<string, string> = {
  flight: "text-blue-600 bg-blue-100",
  train: "text-green-600 bg-green-100",
  bus: "text-orange-600 bg-orange-100",
  ferry: "text-cyan-600 bg-cyan-100",
  car: "text-purple-600 bg-purple-100",
  bike: "text-yellow-600 bg-yellow-100",
  walk: "text-gray-600 bg-gray-100",
  taxi: "text-red-600 bg-red-100",
  uber: "text-pink-600 bg-pink-100",
};

export const JourneyTimeline = ({ segments }: JourneyTimelineProps) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const calculateLayover = (currentSegment: JourneySegment, nextSegment: JourneySegment) => {
    const arrivalTime = new Date(currentSegment.arrival_time);
    const departureTime = new Date(nextSegment.departure_time);
    const diffMinutes = Math.floor((departureTime.getTime() - arrivalTime.getTime()) / 60000);
    return diffMinutes;
  };

  return (
    <div className="space-y-4">
      {segments.map((segment, index) => {
        const Icon = transportIcons[segment.transport_type] || Car;
        const colorClass = transportColors[segment.transport_type] || "text-gray-600 bg-gray-100";
        const isLastSegment = index === segments.length - 1;
        const layoverMinutes = !isLastSegment ? calculateLayover(segment, segments[index + 1]) : 0;

        return (
          <div key={index} className="space-y-3">
            {/* Segment Details */}
            <div className="relative pl-12 pb-6 border-l-2 border-border ml-6">
              {/* Icon */}
              <div className={`absolute left-[-1.75rem] top-0 w-12 h-12 rounded-full ${colorClass} flex items-center justify-center shadow-sm`}>
                <Icon className="w-6 h-6" />
              </div>

              {/* Time */}
              <div className="text-sm font-semibold mb-1">
                {formatTime(segment.departure_time)}
              </div>

              {/* Transport Type & Provider */}
              <div className="space-y-2">
                <div>
                  <Badge variant="outline" className="capitalize mb-2">
                    {segment.transport_type}
                    {segment.provider_name && ` - ${segment.provider_name}`}
                  </Badge>
                  <p className="text-sm font-medium">
                    {segment.from_location} → {segment.to_location}
                  </p>
                </div>

                {/* Duration & Cost */}
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDuration(segment.duration_minutes)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    <span>${segment.cost.toFixed(0)}</span>
                  </div>
                  {segment.luggage_policy && (
                    <div className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      <span>{segment.luggage_policy}</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {segment.notes && (
                  <div className="flex items-start gap-2 text-xs bg-muted/30 p-2 rounded">
                    <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{segment.notes}</span>
                  </div>
                )}
              </div>

              {/* Arrival Time */}
              <div className="text-sm font-semibold mt-3">
                {formatTime(segment.arrival_time)}
              </div>
            </div>

            {/* Layover */}
            {!isLastSegment && layoverMinutes > 0 && (
              <div className="relative pl-12 pb-2 ml-6">
                <div className="absolute left-[-0.875rem] top-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="text-xs text-muted-foreground bg-muted/20 px-3 py-2 rounded inline-block">
                  <span className="font-medium">⏱️ Layover: {formatDuration(layoverMinutes)}</span>
                  {layoverMinutes > 120 && (
                    <span className="ml-2">• Time to explore!</span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
