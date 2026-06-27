import { useEffect, useMemo, useState } from "react";

function DestinationPicker({ destinations = [], selected, onSelect }) {
  const [query, setQuery] = useState(selected?.name || "");

  useEffect(() => {
    setQuery(selected?.name || "");
  }, [selected?.name]);

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return destinations;

    return destinations.filter((dest) =>
      dest.name.toLowerCase().includes(term),
    );
  }, [destinations, query]);

  const handleGo = () => {
    if (!query.trim()) return;

    const exactMatch = destinations.find(
      (dest) => dest.name.toLowerCase() === query.trim().toLowerCase(),
    );

    if (exactMatch) {
      onSelect(exactMatch);
      return;
    }

    if (matches.length > 0) {
      onSelect(matches[0]);
    }
  };

  return (
    <div className="destination-picker">
      <label className="destination-picker__label">Where do you want to go?</label>

      <div className="destination-picker__search-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleGo();
            }
          }}
          placeholder="Search destination"
          className="destination-picker__input"
          list="destination-options"
        />
        <button onClick={handleGo} className="destination-picker__go">
          Go
        </button>
      </div>

      <datalist id="destination-options">
        {destinations.map((dest) => (
          <option key={dest.name} value={dest.name} />
        ))}
      </datalist>

      {destinations.length > 0 && matches.length > 0 && query.trim() && (
        <div className="destination-picker__results">
          {matches.slice(0, 5).map((dest) => (
            <button
              key={dest.name}
              type="button"
              onClick={() => {
                setQuery(dest.name);
                onSelect(dest);
              }}
              className={`destination-picker__result ${
                selected?.name === dest.name ? "is-active" : ""
              }`}
            >
              <span>{dest.name}</span>
              <span className="destination-picker__result-arrow">→</span>
            </button>
          ))}
        </div>
      )}

      {destinations.length === 0 ? (
        <div className="destination-picker__loading">Loading destinations...</div>
      ) : query.trim() && matches.length === 0 ? (
        <div className="destination-picker__loading">No matching destination</div>
      ) : null}
    </div>
  );
}

export default DestinationPicker;
