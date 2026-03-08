const tips = [
  {
    emoji: "🧥",
    title: "Dress in Layers",
    description: "Wear multiple layers of loose-fitting clothing. Inner moisture-wicking, middle insulating, outer windproof.",
  },
  {
    emoji: "🧤",
    title: "Cover Extremities",
    description: "Always wear insulated gloves, warm socks, and a hat. Ears, fingers, toes, and nose are most vulnerable.",
  },
  {
    emoji: "🏠",
    title: "Limit Exposure",
    description: "Take regular breaks indoors during extreme cold. Avoid prolonged outdoor activity below -20°C wind chill.",
  },
  {
    emoji: "💧",
    title: "Stay Dry",
    description: "Wet clothing dramatically increases heat loss. Change out of wet clothes immediately.",
  },
  {
    emoji: "🍵",
    title: "Stay Hydrated & Fed",
    description: "Drink warm fluids and eat high-calorie food. Your body needs fuel to generate heat.",
  },
  {
    emoji: "🚗",
    title: "Emergency Kit",
    description: "Keep blankets, extra clothing, and emergency supplies in your vehicle during winter travel.",
  },
];

const PreventionTips = () => {
  return (
    <section id="prevention" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">Prevention Tips</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Protect yourself from frostbite with these essential safety guidelines.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {tips.map((tip) => (
            <div key={tip.title} className="frost-glass rounded-2xl p-6 hover:border-primary/30 transition-colors">
              <div className="text-3xl mb-3">{tip.emoji}</div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{tip.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{tip.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PreventionTips;
