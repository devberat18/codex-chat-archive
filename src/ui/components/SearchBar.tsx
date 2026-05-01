import { Search } from "lucide-react";
import { useSessionStore } from "../../app/useSessionStore";

export function SearchBar() {
  const { query, searchResults, setQuery } = useSessionStore();

  return (
    <div className="flex min-w-[260px] flex-1 items-center gap-2">
      <div className="relative min-w-[220px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" aria-hidden />
        <input
          className="w-full rounded-md border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-700"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Session içinde ara"
          aria-label="Session içinde ara"
        />
      </div>
      {query.trim().length > 0 ? (
        <span className="whitespace-nowrap text-sm text-stone-600">{searchResults.length} sonuç</span>
      ) : null}
    </div>
  );
}
