import { getDemoWeatherData, getRiskInfo } from "@/lib/weather";

const cities = getDemoWeatherData();

const RiskMap = () => {
  return (
    <section id="risk-map" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">Global Frostbite Risk</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Color-coded risk levels for cities around the world based on current conditions.
          </p>
        </div>

        <div className="flex justify-center gap-6 mb-8">
          {[
            { label: "Low Risk", cls: "bg-risk-safe" },
            { label: "Moderate", cls: "bg-risk-moderate" },
            { label: "High Risk", cls: "bg-risk-high" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${l.cls}`} style={{ backgroundColor: undefined }} />
              <span className="text-xs text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 max-w-6xl mx-auto">
          {cities.map((city) => {
            const info = getRiskInfo(city.riskLevel);
            return (
              <div
                key={city.city}
                className={`frost-glass rounded-2xl p-5 border-l-4 ${
                  city.riskLevel === "safe" ? "border-risk-safe" : city.riskLevel === "moderate" ? "border-risk-moderate" : "border-risk-high"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-semibold text-foreground">{city.city}</h3>
                  <span className="text-xs text-muted-foreground">{city.country}</span>
                </div>
                <div className={`text-2xl font-heading font-bold mb-1 ${
                  city.riskLevel === "safe" ? "text-risk-safe" : city.riskLevel === "moderate" ? "text-risk-moderate" : "text-risk-high"
                }`}>
                  {city.windChill}°C
                </div>
                <div className="text-xs text-muted-foreground mb-2">Wind chill</div>
                <div className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  city.riskLevel === "safe" ? "risk-safe" : city.riskLevel === "moderate" ? "risk-moderate" : "risk-high"
                }`}>
                  {info.label}
                </div>
                <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                  <span>{city.temperature}°C</span>
                  <span>{city.windSpeed} km/h</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RiskMap;
