import { useState, useEffect } from "react";
import { Thermometer, Wind, AlertTriangle, Snowflake, MapPin, Loader2, CloudSnow, RefreshCw, Navigation } from "lucide-react";
import { calculateWindChill, getRiskLevel, getRiskInfo, getClothingRecommendations, type RiskLevel } from "@/lib/weather";
import { fetchOpenMeteo, getWeatherDescription } from "@/lib/geocoding";
import CitySearch from "./CitySearch";
import { toast } from "sonner";

const RiskChecker = () => {
  const [temperature, setTemperature] = useState("");
  const [windSpeed, setWindSpeed] = useState("");
  const [weatherDesc, setWeatherDesc] = useState("");
  const [cityName, setCityName] = useState("");
  const [result, setResult] = useState<{ windChill: number; riskLevel: RiskLevel } | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [autoFetched, setAutoFetched] = useState(false);

  const fetchWeatherForLocation = async (lat: number, lon: number, name?: string) => {
    setWeatherLoading(true);
    try {
      const data = await fetchOpenMeteo(lat, lon);
      setTemperature(String(data.temperature));
      setWindSpeed(String(data.windSpeed));
      setWeatherDesc(getWeatherDescription(data.weatherCode));
      setAutoFetched(true);
      if (name) setCityName(name);
      toast.success(`Weather data loaded${name ? ` for ${name}` : ""}!`);
    } catch {
      toast.error("Could not fetch weather data. Enter values manually.");
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setLocationLoading(true);
    setCityName("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Math.round(pos.coords.latitude * 10000) / 10000;
        const lon = Math.round(pos.coords.longitude * 10000) / 10000;
        setLocation({ lat, lon });
        setLocationLoading(false);
        fetchWeatherForLocation(lat, lon);
      },
      () => {
        toast.error("Location access denied. Search a city or enter values manually.");
        setLocationLoading(false);
      }
    );
  };

  const handleCitySelect = (r: { name: string; country: string; latitude: number; longitude: number }) => {
    const lat = Math.round(r.latitude * 10000) / 10000;
    const lon = Math.round(r.longitude * 10000) / 10000;
    setLocation({ lat, lon });
    fetchWeatherForLocation(lat, lon, `${r.name}, ${r.country}`);
  };

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
    if (location) fetchWeatherForLocation(location.lat, location.lon, cityName || undefined);
  };

  const riskInfo = result ? getRiskInfo(result.riskLevel) : null;
  const clothing = result ? getClothingRecommendations(result.windChill) : [];

  return (
    <section id="checker" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">Frostbite Risk Checker</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Use your location, search any city worldwide, or enter values manually.
          </p>

          {/* Location display */}
          {location && (
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary border border-border px-4 py-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span>
                {cityName ? <span className="font-medium text-foreground">{cityName}</span> : null}
                {" "}
                <span className="text-muted-foreground">({location.lat}°, {location.lon}°)</span>
              </span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="max-w-md mx-auto frost-glass rounded-2xl p-6 sm:p-8 mb-8">
          {/* Location options */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleUseMyLocation}
              disabled={locationLoading || weatherLoading}
              className="w-full rounded-lg bg-secondary border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {locationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4 text-primary" />}
              Use My Location
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <CitySearch onSelect={handleCitySelect} loading={weatherLoading} />
          </div>

          {/* Auto-fetched banner */}
          {autoFetched && weatherDesc && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 p-3 mb-4 text-sm">
              <CloudSnow className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-foreground">
                Live: <span className="font-medium">{weatherDesc}</span>
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

              {location && (
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {cityName && <span className="font-medium text-foreground">{cityName} · </span>}
                  {location.lat}°, {location.lon}°
                </div>
              )}

              <p className="mt-4 text-sm text-muted-foreground">{riskInfo.description}</p>
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
