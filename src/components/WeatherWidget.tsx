import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Cloud, CloudRain, CloudSnow, Sun, Wind } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

interface WeatherWidgetProps {
  destination: string;
  date?: string;
}

export const WeatherWidget = ({ destination, date }: WeatherWidgetProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(false);
        
        // For demo: random weather - in production you'd call OpenWeather API via edge function
        const conditions = ["Clear", "Clouds", "Rain", "Snow"];
        const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setWeather({
          temp: Math.floor(Math.random() * 20) + 15,
          condition: randomCondition,
          icon: randomCondition.toLowerCase(),
          humidity: Math.floor(Math.random() * 40) + 40,
          windSpeed: Math.floor(Math.random() * 15) + 5,
        });
      } catch (err) {
        console.error("Weather fetch error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (destination) {
      fetchWeather();
    }
  }, [destination, date]);

  const getWeatherIcon = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case "clear":
        return <Sun className="w-6 h-6 text-yellow-500" />;
      case "rain":
        return <CloudRain className="w-6 h-6 text-blue-500" />;
      case "snow":
        return <CloudSnow className="w-6 h-6 text-blue-300" />;
      case "clouds":
        return <Cloud className="w-6 h-6 text-gray-400" />;
      default:
        return <Cloud className="w-6 h-6 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <Card className="border-2 backdrop-blur-sm bg-card/95">
        <CardContent className="p-4">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !weather) {
    return null;
  }

  return (
    <Card className="border-2 backdrop-blur-sm bg-gradient-to-br from-primary/5 to-secondary/5 shadow-[var(--shadow-ocean)]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getWeatherIcon(weather.condition)}
            <div>
              <div className="text-2xl font-bold">{weather.temp}°C</div>
              <div className="text-sm text-muted-foreground">{weather.condition}</div>
            </div>
          </div>
          
          <div className="text-right text-sm space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Wind className="w-3 h-3" />
              <span>{weather.windSpeed} km/h</span>
            </div>
            <div className="text-muted-foreground">
              Humidity: {weather.humidity}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};