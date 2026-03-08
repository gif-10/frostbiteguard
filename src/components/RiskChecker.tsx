import { useState, useEffect } from "react";
import { Thermometer, Wind, AlertTriangle, Snowflake, MapPin, Loader2, CloudSnow, RefreshCw } from "lucide-react";
import { calculateWindChill, getRiskLevel, getRiskInfo, getClothingRecommendations, type RiskLevel } from "@/lib/weather";
import { toast } from "sonner";

interface OpenMeteoData {
  temperature: number;
  windSpeed: number;
  weatherCode: number;
}

function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Foggy", 48: "Depositing rime fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    71: "Slight snowfall", 73: "Moderate snowfall", 75: "Heavy snowfall",
    77: "Snow grains", 80: "Slight rain showers", 81: "Moderate rain showers",
    85: "Slight snow showers", 86: "Heavy snow showers",
    95: "Thunderstorm", 96: "Thunderstorm with hail",
  };
  return descriptions[code] || "Unknown";
}

async function fetchOpenMeteo(lat: number, lon: number): Promise<OpenMeteoData> {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,weather_code`
  );
  if (!res.ok) throw new Error("Failed to fetch weather data");
  const data = await res.json();
  return {
    temperature: Math.round(data.current.temperature_2m * 10) / 10,
    windSpeed: Math.round(data.current.wind_speed_10m * 10) / 10,
    weatherCode: data.current.weather_code,
  };
}

const RiskChecker = () => {
  const [temperature, setTemperature] = useState("");
  const [windSpeed, setWindSpeed] = useState("");
  const [weatherDesc, setWeatherDesc] = useState("");
  const [result, setResult] = useState<{ windChill: number; riskLevel: RiskLevel } | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [autoFetched, setAutoFetched] = useState(false);

  const fetchWeatherForLocation = async (lat: number, lon: number) => {
    setWeatherLoading(true);
    try {
      const data = await fetchOpenMeteo(lat, lon);
      setTemperature(String(data.temperature));
      setWindSpeed(String(data.windSpeed));
      setWeatherDesc(getWeatherDescription(data.weatherCode));
      setAutoFetched(true);
      toast.success("Real-time weather data loaded from Open-Meteo!");
    } catch {
      toast.error("Could not fetch weather data. Enter values manually.");
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Math.round(pos.coords.latitude * 10000) / 10000;
        const lon = Math.round(pos.coords.longitude * 10000) / 10000;
        setLocation({ lat, lon });
        setLocationLoading(false);
        fetchWeatherForLocation(lat, lon);
      },
      () => {
        setLocationError("Location access denied. Enter values manually.");
        setLocationLoading(false);
      }
    );
  }, []);

  const handleCheck = () => {
    const temp = parseFloat(temperature);
    const wind = parseFloat(windSpeed);
    if (isNaN(temp) || isNaN(wind)) {
      toast.error("Please enter valid numbers for both fields.");
      return;
    }
    if (wind < 0) {
      toast.error("Wind speed cannot be negative.");
      return;
    }
    const windChill = calculateWindChill(temp, wind);
    const riskLevel = getRiskLevel(windChill);
    setResult({ windChill, riskLevel });
    if (riskLevel === "high") {
      toast.warning("⚠️ High frostbite risk! Skin may freeze within 10–30 minutes.", { duration: 8000 });
    }
  };

  const handleRefresh = () => {
    if (location) fetchWeatherForLocation(location.lat, location.lon);
  };

  const riskInfo = result ? getRiskInfo(result.riskLevel) : null;
  const clothing = result ? getClothingRecommendations(result.windChill) : [];

  return (
    <section id="checker" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">Frostbite Risk Checker</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-4">
            Automatically detects your location and fetches real-time weather data, or enter values manually.
          </p>
          {/* Location Display */}
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary border border-border px-4 py-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            {locationLoading ? (
              <span className="flex items-center gap-1.5"><Loader2 className="h-3 w-3 animate-spin" /> Detecting location...</span>
            ) : location ? (
              <span>Your location: <span className="font-medium text-foreground">{location.lat}°, {location.lon}°</span></span>
            ) : (
              <span>{locationError || "Location unavailable"}</span>
            )}
          </div>
        </div>

        {/* Input Form */}
        <div className="max-w-md mx-auto frost-glass rounded-2xl p-6 sm:p-8 mb-8">
          {/* Auto-fetched banner */}
          {autoFetched && weatherDesc && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 p-3 mb-4 text-sm">
              <CloudSnow className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-foreground">
                Live weather: <span className="font-medium">{weatherDesc}</span>
              </span>
              <button onClick={handleRefresh} disabled={weatherLoading} className="ml-auto text-primary hover:text-primary/80 transition-colors">
                <RefreshCw className={`h-4 w-4 ${weatherLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5">
                <Thermometer className="h-4 w-4 text-primary" />
                Air Temperature (°C)
              </label>
              <input
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="e.g. -15"
                className="w-full rounded-lg bg-secondary border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5">
                <Wind className="h-4 w-4 text-accent" />
                Wind Speed (km/h)
              </label>
              <input
                type="number"
                value={windSpeed}
                onChange={(e) => setWindSpeed(e.target.value)}
                placeholder="e.g. 25"
                min="0"
                className="w-full rounded-lg bg-secondary border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <button
              onClick={handleCheck}
              disabled={weatherLoading}
              className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {weatherLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Snowflake className="h-4 w-4" />}
              Check Frostbite Risk
            </button>
          </div>
        </div>

        {/* Results */}
        {result && riskInfo && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {result.riskLevel === "high" && (
              <div className="flex items-center gap-3 rounded-lg bg-risk-high/20 border border-risk-high p-4">
                <AlertTriangle className="h-5 w-5 text-risk-high flex-shrink-0" />
                <p className="text-sm font-medium text-risk-high">
                  Warning: Frostbite may occur within 10–30 minutes in these conditions.
                </p>
              </div>
            )}

            <div className="frost-glass rounded-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading text-2xl font-bold text-foreground">Results</h3>
                <div className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                  result.riskLevel === "safe" ? "risk-safe" : result.riskLevel === "moderate" ? "risk-moderate" : "risk-high"
                }`}>
                  {riskInfo.label}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Thermometer, label: "Temperature", value: `${temperature}°C`, color: "text-primary" },
                  { icon: Wind, label: "Wind Speed", value: `${windSpeed} km/h`, color: "text-accent" },
                  { icon: Thermometer, label: "Wind Chill", value: `${result.windChill}°C`, color: result.riskLevel === "safe" ? "text-risk-safe" : result.riskLevel === "moderate" ? "text-risk-moderate" : "text-risk-high" },
                  { icon: CloudSnow, label: "Condition", value: weatherDesc || "Manual", color: "text-primary" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-muted/50 p-4 text-center">
                    <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
                    <div className={`text-lg font-heading font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-sm text-muted-foreground">{riskInfo.description}</p>
            </div>

            {clothing.length > 0 && (
              <div className="frost-glass rounded-2xl p-6 sm:p-8">
                <h4 className="font-heading text-lg font-semibold text-foreground mb-4">🧥 Clothing Recommendations</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {clothing.map((item) => (
                    <div key={item.item} className={`flex items-center gap-3 rounded-lg p-3 ${
                      item.priority === "essential" ? "bg-risk-high/20 border border-risk-high/30" : "bg-muted/50"
                    }`}>
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-foreground">{item.item}</div>
                        <div className={`text-xs ${item.priority === "essential" ? "text-risk-high" : "text-muted-foreground"}`}>
                          {item.priority === "essential" ? "Essential" : "Recommended"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default RiskChecker;
