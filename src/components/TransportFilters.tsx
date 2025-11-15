import { useState } from "react";
import {
  Plane,
  Train,
  Bus,
  Ship,
  Car,
  Bike,
  Leaf,
  Zap,
  DollarSign,
  Star,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterState {
  sortBy: string;
  transportTypes: string[];
  maxTransfers: number;
  budgetRange: [number, number];
  travelStyle: string;
}

interface TransportFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const transportOptions = [
  { value: "flight", label: "Flights", icon: Plane },
  { value: "train", label: "Trains", icon: Train },
  { value: "bus", label: "Buses", icon: Bus },
  { value: "ferry", label: "Ferries", icon: Ship },
  { value: "car", label: "Cars", icon: Car },
  { value: "bike", label: "Bikes", icon: Bike },
];

const sortOptions = [
  { value: "cheapest", label: "Cheapest First", icon: DollarSign },
  { value: "fastest", label: "Fastest First", icon: Zap },
  { value: "eco", label: "Most Eco-Friendly", icon: Leaf },
  { value: "experience", label: "Best Experience", icon: Star },
];

const travelStyles = [
  { value: "budget", label: "Budget Traveler", icon: DollarSign, color: "bg-green-100 text-green-700" },
  { value: "eco", label: "Eco-Conscious", icon: Leaf, color: "bg-emerald-100 text-emerald-700" },
  { value: "time", label: "Time-Saver", icon: Zap, color: "bg-yellow-100 text-yellow-700" },
  { value: "adventure", label: "Adventure Seeker", icon: Star, color: "bg-purple-100 text-purple-700" },
];

export const TransportFilters = ({ filters, onFiltersChange }: TransportFiltersProps) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const toggleTransportType = (type: string) => {
    const newTypes = localFilters.transportTypes.includes(type)
      ? localFilters.transportTypes.filter((t) => t !== type)
      : [...localFilters.transportTypes, type];
    
    const updated = { ...localFilters, transportTypes: newTypes };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const updateSortBy = (sortBy: string) => {
    const updated = { ...localFilters, sortBy };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const updateTravelStyle = (travelStyle: string) => {
    const updated = { ...localFilters, travelStyle };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const updateMaxTransfers = (value: number[]) => {
    const updated = { ...localFilters, maxTransfers: value[0] };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const updateBudgetRange = (value: number[]) => {
    const updated = { ...localFilters, budgetRange: [value[0], value[1]] as [number, number] };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const activeFiltersCount = 
    (localFilters.transportTypes.length < 6 ? localFilters.transportTypes.length : 0) +
    (localFilters.travelStyle !== "all" ? 1 : 0);

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Sort Dropdown */}
      <Select value={localFilters.sortBy} onValueChange={updateSortBy}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => {
            const Icon = option.icon;
            return (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {/* Travel Style Quick Select */}
      <div className="flex gap-2">
        {travelStyles.map((style) => {
          const Icon = style.icon;
          const isActive = localFilters.travelStyle === style.value;
          return (
            <Button
              key={style.value}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => updateTravelStyle(isActive ? "all" : style.value)}
              className={isActive ? style.color : ""}
            >
              <Icon className="w-4 h-4 mr-1" />
              {style.label}
            </Button>
          );
        })}
      </div>

      {/* Advanced Filters Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filter Options</SheetTitle>
            <SheetDescription>
              Customize your journey preferences
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Transport Types */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Transport Types</Label>
              <div className="space-y-2">
                {transportOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.value}
                        checked={localFilters.transportTypes.includes(option.value)}
                        onCheckedChange={() => toggleTransportType(option.value)}
                      />
                      <Label
                        htmlFor={option.value}
                        className="flex items-center gap-2 font-normal cursor-pointer"
                      >
                        <Icon className="w-4 h-4" />
                        {option.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Max Transfers */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-base font-semibold">Max Transfers</Label>
                <span className="text-sm text-muted-foreground">{localFilters.maxTransfers}</span>
              </div>
              <Slider
                value={[localFilters.maxTransfers]}
                onValueChange={updateMaxTransfers}
                max={5}
                step={1}
                className="w-full"
              />
            </div>

            {/* Budget Range */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-base font-semibold">Budget Range</Label>
                <span className="text-sm text-muted-foreground">
                  ${localFilters.budgetRange[0]} - ${localFilters.budgetRange[1]}
                </span>
              </div>
              <Slider
                value={localFilters.budgetRange}
                onValueChange={updateBudgetRange}
                max={5000}
                step={50}
                min={0}
                className="w-full"
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
