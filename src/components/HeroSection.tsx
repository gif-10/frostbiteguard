import { Snowflake, ArrowDown } from "lucide-react";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-frost-glow/5 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-8">
          <Snowflake className="h-4 w-4 text-primary animate-spin" style={{ animationDuration: "8s" }} />
          <span className="text-sm font-medium text-primary">Real-time Frostbite Detection</span>
        </div>

        <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
          <span className="text-foreground">Stay Safe in</span>
          <br />
          <span className="bg-gradient-to-r from-primary via-frost-glow to-accent bg-clip-text text-transparent">
            Extreme Cold
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Frostbite occurs when skin and underlying tissue freeze from prolonged cold exposure.
          Our system analyzes real-time weather data to calculate your risk and keep you protected.
        </p>

        <a
          href="#checker"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 font-heading font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
        >
          Check Your Risk
          <ArrowDown className="h-4 w-4" />
        </a>

        <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[
            { value: "< -28°C", label: "High Risk Zone" },
            { value: "10-30", label: "Minutes to Frostbite" },
            { value: "24/7", label: "Live Monitoring" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-heading font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
