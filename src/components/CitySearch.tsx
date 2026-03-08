import { useState, useRef, useEffect } from "react";
import { Search, Loader2, MapPin } from "lucide-react";
import { searchCities, type GeocodingResult } from "@/lib/geocoding";

interface CitySearchProps {
  onSelect: (result: GeocodingResult) => void;
  loading?: boolean;
}

const CitySearch = ({ onSelect, loading }: CitySearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchCities(value);
        setResults(res);
        setOpen(res.length > 0);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleSelect = (result: GeocodingResult) => {
    setQuery(`${result.name}, ${result.country}`);
    setOpen(false);
    onSelect(result);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search any city worldwide..."
          className="w-full rounded-lg bg-secondary border border-border pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        {(searching || loading) && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 rounded-lg bg-card border border-border shadow-xl overflow-hidden">
          {results.map((r, i) => (
            <button
              key={`${r.name}-${r.latitude}-${i}`}
              onClick={() => handleSelect(r)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm hover:bg-secondary transition-colors"
            >
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <div>
                <span className="font-medium text-foreground">{r.name}</span>
                <span className="text-muted-foreground">
                  {r.admin1 ? `, ${r.admin1}` : ""}, {r.country}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CitySearch;
