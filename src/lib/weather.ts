const API_KEY = ""; // User must provide their OpenWeatherMap API key

export interface WeatherData {
  city: string;
  country: string;
  temperature: number; // °C
  windSpeed: number; // km/h
  humidity: number;
  description: string;
  icon: string;
  windChill: number;
  riskLevel: RiskLevel;
}

export type RiskLevel = "safe" | "moderate" | "high";

export function calculateWindChill(tempC: number, windKmh: number): number {
  if (windKmh < 4.8 || tempC > 10) return tempC;
  const wc = 13.12 + 0.6215 * tempC - 11.37 * Math.pow(windKmh, 0.16) + 0.3965 * tempC * Math.pow(windKmh, 0.16);
  return Math.round(wc * 10) / 10;
}

export function getRiskLevel(windChill: number): RiskLevel {
  if (windChill > -10) return "safe";
  if (windChill > -28) return "moderate";
  return "high";
}

export function getRiskInfo(level: RiskLevel) {
  switch (level) {
    case "safe":
      return {
        label: "Low Risk",
        description: "Frostbite risk is minimal. Stay warm and enjoy the outdoors.",
        color: "risk-safe",
      };
    case "moderate":
      return {
        label: "Moderate Risk",
        description: "Frostbite possible with prolonged exposure. Cover exposed skin.",
        color: "risk-moderate",
      };
    case "high":
      return {
        label: "High Risk",
        description: "Warning: Skin may freeze within 10–30 minutes. Limit outdoor exposure.",
        color: "risk-high",
      };
  }
}

export async function fetchWeatherByCity(city: string, apiKey: string): Promise<WeatherData> {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`
  );
  if (!res.ok) throw new Error("City not found or API error");
  return parseWeatherResponse(await res.json());
}

export async function fetchWeatherByCoords(lat: number, lon: number, apiKey: string): Promise<WeatherData> {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
  );
  if (!res.ok) throw new Error("Weather data unavailable");
  return parseWeatherResponse(await res.json());
}

function parseWeatherResponse(data: any): WeatherData {
  const temperature = Math.round(data.main.temp * 10) / 10;
  const windSpeed = Math.round(data.wind.speed * 3.6 * 10) / 10; // m/s to km/h
  const windChill = calculateWindChill(temperature, windSpeed);
  const riskLevel = getRiskLevel(windChill);

  return {
    city: data.name,
    country: data.sys.country,
    temperature,
    windSpeed,
    humidity: data.main.humidity,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    windChill,
    riskLevel,
  };
}

// Demo data for when no API key is set
export function getDemoWeatherData(): WeatherData[] {
  return [
    { city: "Yakutsk", country: "RU", temperature: -38, windSpeed: 15, humidity: 70, description: "clear sky", icon: "01d", windChill: calculateWindChill(-38, 15), riskLevel: getRiskLevel(calculateWindChill(-38, 15)) },
    { city: "Winnipeg", country: "CA", temperature: -22, windSpeed: 30, humidity: 65, description: "light snow", icon: "13d", windChill: calculateWindChill(-22, 30), riskLevel: getRiskLevel(calculateWindChill(-22, 30)) },
    { city: "Oslo", country: "NO", temperature: -5, windSpeed: 20, humidity: 80, description: "overcast clouds", icon: "04d", windChill: calculateWindChill(-5, 20), riskLevel: getRiskLevel(calculateWindChill(-5, 20)) },
    { city: "Denver", country: "US", temperature: 2, windSpeed: 10, humidity: 45, description: "few clouds", icon: "02d", windChill: calculateWindChill(2, 10), riskLevel: getRiskLevel(calculateWindChill(2, 10)) },
    { city: "Helsinki", country: "FI", temperature: -15, windSpeed: 25, humidity: 75, description: "snow", icon: "13d", windChill: calculateWindChill(-15, 25), riskLevel: getRiskLevel(calculateWindChill(-15, 25)) },
  ];
}

export function getClothingRecommendations(windChill: number): { item: string; icon: string; priority: "essential" | "recommended" | "optional" }[] {
  const recs: { item: string; icon: string; priority: "essential" | "recommended" | "optional" }[] = [];

  if (windChill < 10) {
    recs.push({ item: "Warm jacket", icon: "🧥", priority: "recommended" });
  }
  if (windChill < 0) {
    recs.push({ item: "Insulated gloves", icon: "🧤", priority: "essential" });
    recs.push({ item: "Warm hat / beanie", icon: "🧢", priority: "essential" });
    recs.push({ item: "Thermal socks", icon: "🧦", priority: "recommended" });
  }
  if (windChill < -10) {
    recs.push({ item: "Thermal underwear", icon: "👕", priority: "essential" });
    recs.push({ item: "Face mask / balaclava", icon: "😷", priority: "essential" });
    recs.push({ item: "Insulated boots", icon: "🥾", priority: "essential" });
  }
  if (windChill < -25) {
    recs.push({ item: "Heavy parka", icon: "🧥", priority: "essential" });
    recs.push({ item: "Hand warmers", icon: "🔥", priority: "recommended" });
    recs.push({ item: "Goggles / eye protection", icon: "🥽", priority: "recommended" });
  }

  return recs;
}
