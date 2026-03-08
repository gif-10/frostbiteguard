import { useState, useCallback } from "react";
import { Search, MapPin, Thermometer, Wind, Droplets, AlertTriangle, Loader2 } from "lucide-react";
import { fetchWeatherByCity, fetchWeatherByCoords, getRiskInfo, getClothingRecommendations, type WeatherData } from "@/lib/weather";
import { toast } from "sonner";

const API_KEY_STORAGE = "owm_api_key";

const RiskChecker = () => {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) || "");
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem(API_KEY_STORAGE, key);
  };

  const fetchByCity = useCallback(async () => {
    if (!city.trim() || !apiKey.trim()) return;
    setLoading(true);
    try {
      const data = await fetchWeatherByCity(city, apiKey);
      setWeather(data);
      if (data.riskLevel === "high") {
        toast.warning("⚠️ High frostbite risk! Skin may freeze within 10–30 minutes.", { duration: 8000 });
      }
    } catch {
      toast.error("Could not find city. Please check the name and try again.");
    } finally {
      setLoading(false);
    }
  }, [city, apiKey]);

  const detectLocation = useCallback(async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter your OpenWeatherMap API key first.");
      return;
    }
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude, apiKey);
          setWeather(data);
          if (data.riskLevel === "high") {
            toast.warning("⚠️ High frostbite risk at your location!", { duration: 8000 });
          }
        } catch {
          toast.error("Could not fetch weather for your location.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        toast.error("Location access denied. Please search by city instead.");
        setLoading(false);
      }
    );
  }, [apiKey]);

  const riskInfo = weather ? getRiskInfo(weather.riskLevel) : null;
  const clothing = weather ? getClothingRecommendations(weather.windChill) : [];

  return (
    <section id="checker" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">Frostbite Risk Checker</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Enter a city or detect your location to check real-time frostbite risk.</p>
        </div>

        {/* API Key Input */}
        <div className="max-w-md mx-auto mb-6">
          <label className="block text-xs text-muted-foreground mb-1.5">OpenWeatherMap API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => saveApiKey(e.target.value)}
            placeholder="Paste your free API key here"
            className="w-full rounded-lg bg-secondary border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Get a free key at{" "}
            <a href="https://openweathermap.org/api" target="_blank" rel="noreferrer" className="text-primary underline">
              openweathermap.org
            </a>
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto flex gap-2 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchByCity()}
              placeholder="Search city..."
              className="w-full rounded-lg bg-secondary border border-border pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button
            onClick={fetchByCity}
            disabled={loading}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
          </button>
          <button
            onClick={detectLocation}
            disabled={loading}
            className="rounded-lg border border-border bg-secondary px-3 py-2.5 text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            title="Detect my location"
          >
            <MapPin className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        {weather && riskInfo && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Risk Banner */}
            {weather.riskLevel === "high" && (
              <div className="flex items-center gap-3 rounded-lg bg-risk-high/20 border border-risk-high p-4">
                <AlertTriangle className="h-5 w-5 text-risk-high flex-shrink-0" />
                <p className="text-sm font-medium text-risk-high">
                  Warning: High frostbite risk. Skin may freeze within 10–30 minutes. Limit outdoor exposure.
                </p>
              </div>
            )}

            {/* Weather Card */}
            <div className="frost-glass rounded-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-heading text-2xl font-bold text-foreground">
                    {weather.city}, {weather.country}
                  </h3>
                  <p className="text-sm text-muted-foreground capitalize">{weather.description}</p>
                </div>
                <div className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                  weather.riskLevel === "safe" ? "risk-safe" : weather.riskLevel === "moderate" ? "risk-moderate" : "risk-high"
                }`}>
                  {riskInfo.label}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Thermometer, label: "Temperature", value: `${weather.temperature}°C`, color: "text-primary" },
                  { icon: Wind, label: "Wind Speed", value: `${weather.windSpeed} km/h`, color: "text-accent" },
                  { icon: Thermometer, label: "Wind Chill", value: `${weather.windChill}°C`, color: weather.riskLevel === "safe" ? "text-risk-safe" : weather.riskLevel === "moderate" ? "text-risk-moderate" : "text-risk-high" },
                  { icon: Droplets, label: "Humidity", value: `${weather.humidity}%`, color: "text-primary" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-muted/50 p-4 text-center">
                    <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
                    <div className={`text-xl font-heading font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-sm text-muted-foreground">{riskInfo.description}</p>
            </div>

            {/* Clothing Recommendations */}
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
