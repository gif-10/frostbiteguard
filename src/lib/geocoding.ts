export interface GeocodingResult {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  admin1?: string;
}

export async function searchCities(query: string): Promise<GeocodingResult[]> {
  if (!query || query.length < 2) return [];
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
  );
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  return (data.results || []).map((r: any) => ({
    name: r.name,
    country: r.country || "",
    latitude: r.latitude,
    longitude: r.longitude,
    admin1: r.admin1,
  }));
}

export async function fetchOpenMeteo(lat: number, lon: number) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,weather_code`
  );
  if (!res.ok) throw new Error("Failed to fetch weather data");
  const data = await res.json();
  return {
    temperature: Math.round(data.current.temperature_2m * 10) / 10,
    windSpeed: Math.round(data.current.wind_speed_10m * 10) / 10,
    weatherCode: data.current.weather_code as number,
  };
}

export function getWeatherDescription(code: number): string {
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
