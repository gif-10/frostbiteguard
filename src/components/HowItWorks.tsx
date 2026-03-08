import { Thermometer, Wind, Calculator, ShieldAlert } from "lucide-react";

const steps = [
  {
    icon: Thermometer,
    title: "Measure Temperature",
    description: "Real-time air temperature (T) in °C is fetched from weather stations via OpenWeatherMap.",
  },
  {
    icon: Wind,
    title: "Measure Wind Speed",
    description: "Current wind speed (V) in km/h is measured, as wind dramatically increases heat loss from exposed skin.",
  },
  {
    icon: Calculator,
    title: "Calculate Wind Chill",
    description: "The standard formula is applied: W = 13.12 + 0.6215T − 11.37V⁰·¹⁶ + 0.3965TV⁰·¹⁶ to get the perceived temperature.",
  },
  {
    icon: ShieldAlert,
    title: "Assess Risk Level",
    description: "Wind chill above -10°C = Low Risk. Between -10°C and -28°C = Moderate. Below -28°C = High Risk — frostbite within 10–30 minutes.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">How It Works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Understanding wind chill and how frostbite risk is calculated from weather data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div key={step.title} className="relative">
              <div className="frost-glass rounded-2xl p-6 h-full">
                <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center mb-4">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-xs text-primary font-semibold mb-2">Step {i + 1}</div>
                <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-border" />
              )}
            </div>
          ))}
        </div>

        {/* Formula callout */}
        <div className="max-w-2xl mx-auto mt-12">
          <div className="frost-glass frost-glow rounded-2xl p-6 text-center">
            <div className="text-xs text-primary font-semibold uppercase tracking-wider mb-3">Wind Chill Formula</div>
            <div className="font-heading text-lg sm:text-xl font-bold text-foreground">
              W = 13.12 + 0.6215T − 11.37V<sup>0.16</sup> + 0.3965TV<sup>0.16</sup>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mt-4 text-sm text-muted-foreground">
              <span><strong className="text-foreground">T</strong> = Air temp (°C)</span>
              <span><strong className="text-foreground">V</strong> = Wind speed (km/h)</span>
              <span><strong className="text-foreground">W</strong> = Wind chill (°C)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
