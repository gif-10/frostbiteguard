import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchOpenMeteo, getWeatherDescription } from "@/lib/geocoding";
import { calculateWindChill, getRiskLevel, getRiskInfo } from "@/lib/weather";
import { Loader2, Trash2, Globe } from "lucide-react";

const MARKER_COLORS: Record<string, string> = {
  safe: "#22c55e",
  moderate: "#eab308",
  high: "#ef4444",
};

function createColorIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:24px;height:24px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
}

const FrostbiteMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [30, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 12,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    map.on("click", async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setLoading(true);
      try {
        const data = await fetchOpenMeteo(lat, lng);
        const windChill = calculateWindChill(data.temperature, data.windSpeed);
        const riskLevel = getRiskLevel(windChill);
        const info = getRiskInfo(riskLevel);

        const marker = L.marker([lat, lng], {
          icon: createColorIcon(MARKER_COLORS[riskLevel]),
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family:'Inter',sans-serif;min-width:180px;">
            <div style="font-weight:600;font-size:14px;margin-bottom:6px;">📍 ${lat.toFixed(3)}°, ${lng.toFixed(3)}°</div>
            <div style="font-size:12px;color:#888;margin-bottom:8px;">${getWeatherDescription(data.weatherCode)}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:12px;">
              <span>🌡 Temp:</span><span style="font-weight:500;">${data.temperature}°C</span>
              <span>💨 Wind:</span><span style="font-weight:500;">${data.windSpeed} km/h</span>
              <span>❄ Chill:</span><span style="font-weight:500;">${windChill}°C</span>
            </div>
            <div style="margin-top:8px;padding:4px 10px;border-radius:12px;text-align:center;font-size:11px;font-weight:600;background:${MARKER_COLORS[riskLevel]}20;color:${MARKER_COLORS[riskLevel]};">
              ${info.label}
            </div>
            ${riskLevel === "high" ? '<div style="margin-top:6px;font-size:11px;color:#ef4444;">⚠ Frostbite possible in 10–30 min</div>' : ""}
          </div>
        `).openPopup();

        markersRef.current.push(marker);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  const clearMarkers = () => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  };

  return (
    <section id="risk-map" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-4">
            <Globe className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Interactive Map</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Global Frostbite Risk Map
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Click anywhere on the map to instantly check frostbite risk using real-time weather data.
          </p>
        </div>

        {/* Legend & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 max-w-5xl mx-auto">
          <div className="flex gap-5">
            {[
              { label: "Low Risk", color: "bg-risk-safe" },
              { label: "Moderate", color: "bg-risk-moderate" },
              { label: "High Risk", color: "bg-risk-high" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: l.color === "bg-risk-safe" ? MARKER_COLORS.safe : l.color === "bg-risk-moderate" ? MARKER_COLORS.moderate : MARKER_COLORS.high }} />
                <span className="text-xs text-muted-foreground">{l.label}</span>
              </div>
            ))}
          </div>
          <button
            onClick={clearMarkers}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear Markers
          </button>
        </div>

        {/* Map */}
        <div className="relative max-w-5xl mx-auto rounded-2xl overflow-hidden border border-border frost-glow">
          <div ref={mapRef} className="w-full h-[500px] sm:h-[600px]" />
          {loading && (
            <div className="absolute top-4 right-4 flex items-center gap-2 rounded-lg bg-card/90 backdrop-blur-sm border border-border px-3 py-2 text-xs text-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              Fetching weather…
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FrostbiteMap;
