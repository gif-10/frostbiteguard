import { useState } from "react";
import { Thermometer, Wind, AlertTriangle, Snowflake } from "lucide-react";
import { calculateWindChill, getRiskLevel, getRiskInfo, getClothingRecommendations, type RiskLevel } from "@/lib/weather";
import { toast } from "sonner";

const RiskChecker = () => {
  const [temperature, setTemperature] = useState("");
  const [windSpeed, setWindSpeed] = useState("");
  const [result, setResult] = useState<{
    windChill: number;
    riskLevel: RiskLevel;
  } | null>(null);

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

  const riskInfo = result ? getRiskInfo(result.riskLevel) : null;
  const clothing = result ? getClothingRecommendations(result.windChill) : [];

  return (
    <section id="checker" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">Frostbite Risk Checker</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Enter air temperature and wind speed to calculate wind chill and frostbite risk.</p>
        </div>

        {/* Input Form */}
        <div className="max-w-md mx-auto frost-glass rounded-2xl p-6 sm:p-8 mb-8">
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
              className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <Snowflake className="h-4 w-4" />
              Check Frostbite Risk
            </button>
          </div>
        </div>

        {/* Results */}
        {result && riskInfo && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Risk Banner */}
            {result.riskLevel === "high" && (
              <div className="flex items-center gap-3 rounded-lg bg-risk-high/20 border border-risk-high p-4">
                <AlertTriangle className="h-5 w-5 text-risk-high flex-shrink-0" />
                <p className="text-sm font-medium text-risk-high">
                  Warning: Frostbite may occur within 10–30 minutes in these conditions.
                </p>
              </div>
            )}

            {/* Results Card */}
            <div className="frost-glass rounded-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading text-2xl font-bold text-foreground">Results</h3>
                <div className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                  result.riskLevel === "safe" ? "risk-safe" : result.riskLevel === "moderate" ? "risk-moderate" : "risk-high"
                }`}>
                  {riskInfo.label}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: Thermometer, label: "Temperature", value: `${temperature}°C`, color: "text-primary" },
                  { icon: Wind, label: "Wind Speed", value: `${windSpeed} km/h`, color: "text-accent" },
                  { icon: Thermometer, label: "Wind Chill", value: `${result.windChill}°C`, color: result.riskLevel === "safe" ? "text-risk-safe" : result.riskLevel === "moderate" ? "text-risk-moderate" : "text-risk-high" },
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
