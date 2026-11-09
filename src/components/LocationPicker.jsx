import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search, Loader2, X, CheckCircle2, ChevronDown } from 'lucide-react';

// Free reverse geocoding via OpenStreetMap Nominatim (no API key needed)
async function reverseGeocode(lat, lon) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
    { headers: { 'Accept-Language': 'en' } }
  );
  const data = await res.json();
  const a = data.address || {};
  const city = a.city || a.town || a.village || a.county || a.state_district || 'Your Location';
  const pincode = a.postcode || '';
  return { city, pincode, display: `${city}${pincode ? ' ' + pincode : ''}` };
}

// Free forward geocoding — search by city or pincode
async function searchLocation(query) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=6&countrycodes=in`,
    { headers: { 'Accept-Language': 'en' } }
  );
  const data = await res.json();
  return data.map((item) => {
    const a = item.address || {};
    const city = a.city || a.town || a.village || a.county || a.state_district || item.display_name.split(',')[0];
    const pincode = a.postcode || '';
    return { city, pincode, display: `${city}${pincode ? ' ' + pincode : ''}`, state: a.state || '' };
  }).filter((v, i, arr) => arr.findIndex(x => x.display === v.display) === i); // deduplicate
}

const STORAGE_KEY = 'aura_delivery_location';

function getStoredLocation() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function storeLocation(loc) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(loc)); } catch {}
}

export default function LocationPicker() {
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState(
    getStoredLocation() || { city: 'Bengaluru', pincode: '560001', display: 'Bengaluru 560001' }
  );
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const dropRef = useRef(null);
  const searchTimer = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Prevent background scroll when bottom sheet is open on mobile
  useEffect(() => {
    if (open) {
      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = origOverflow;
      };
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchLocation(query.trim());
        setResults(res);
      } catch (err) {
        console.error('Search location error:', err);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(searchTimer.current);
  }, [query]);

  // Use browser Geolocation API
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const loc = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          applyLocation(loc);
        } catch (err) {
          console.error('Reverse geocode error:', err);
          applyLocation({ city: 'Current Location', pincode: '', display: 'Current Location' });
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        setGeoLoading(false);
        alert(`Location permission denied or unavailable: ${err.message}`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const applyLocation = (loc) => {
    setLocation(loc);
    storeLocation(loc);
    setConfirmed(true);
    setTimeout(() => {
      setConfirmed(false);
      setOpen(false);
    }, 500);
  };

  // Popular Indian cities for quick pick
  const quickCities = [
    { city: 'Bengaluru', pincode: '560001', display: 'Bengaluru 560001' },
    { city: 'Mumbai', pincode: '400001', display: 'Mumbai 400001' },
    { city: 'Delhi', pincode: '110001', display: 'Delhi 110001' },
    { city: 'Hyderabad', pincode: '500001', display: 'Hyderabad 500001' },
    { city: 'Chennai', pincode: '600001', display: 'Chennai 600001' },
    { city: 'Kolkata', pincode: '700001', display: 'Kolkata 700001' },
    { city: 'Pune', pincode: '411001', display: 'Pune 411001' },
    { city: 'Ahmedabad', pincode: '380001', display: 'Ahmedabad 380001' },
  ];

  return (
    <div className="amz-location-picker-container" ref={dropRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="nav-location-btn amz-header-location-btn"
        title="Change delivery location"
        type="button"
        aria-label={`Deliver to ${location.display}`}
      >
        <MapPin size={15} className="amz-location-pin-icon" style={{ flexShrink: 0 }} />
        <div className="nav-location-text-wrap">
          <span className="nav-location-label">
            Deliver to
          </span>
          <span className="nav-location-dest">
            {location.display}
          </span>
        </div>
        <ChevronDown size={14} className="amz-location-chevron" style={{ flexShrink: 0, opacity: 0.7 }} />
      </button>

      {/* Backdrop for Mobile & Desktop click-away */}
      {open && (
        <div 
          className="amz-location-backdrop"
          onClick={() => setOpen(false)}
          aria-label="Close location picker"
        />
      )}

      {/* Dropdown Panel / Mobile Bottom Sheet */}
      {open && (
        <div className="amz-location-dropdown-panel" role="dialog" aria-modal="true" aria-label="Choose delivery destination">
          {/* Mobile Sheet Drag Indicator Pill */}
          <div className="amz-sheet-drag-pill" />

          {/* Header */}
          <div className="amz-location-panel-header">
            <div>
              <div className="amz-location-panel-title">Choose your location</div>
              <div className="amz-location-panel-sub">Select delivery destination to check express arrival times</div>
            </div>
            <button 
              type="button"
              onClick={() => setOpen(false)} 
              className="amz-location-close-btn"
              aria-label="Close location picker"
            >
              <X size={16} />
            </button>
          </div>

          <div className="amz-location-panel-body">
            {/* Current Active Location Display */}
            <div className="amz-location-active-badge">
              {confirmed ? <CheckCircle2 size={18} color="#10b981" /> : <MapPin size={18} color="#4f46e5" />}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Active Destination</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{location.display}</div>
              </div>
              {confirmed && (
                <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 800 }}>Saved!</span>
              )}
            </div>

            {/* Use My Location Button */}
            <button
              onClick={useMyLocation}
              disabled={geoLoading}
              type="button"
              className="amz-detect-location-btn"
            >
              {geoLoading ? <Loader2 size={16} className="amz-spin" /> : <Navigation size={16} />}
              <span>{geoLoading ? 'Pinpointing Coordinates...' : 'Detect My Current Location'}</span>
            </button>

            {/* Search Box */}
            <div style={{ position: 'relative' }}>
              <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Enter city or 6-digit pincode..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="amz-location-search-input"
              />
              {searching && (
                <Loader2 size={14} color="#64748b" className="amz-spin" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              )}
            </div>

            {/* Search Results */}
            {results.length > 0 && (
              <div className="amz-location-results-list">
                {results.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => applyLocation(r)}
                    className="amz-location-result-item"
                  >
                    <MapPin size={15} color="#4f46e5" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{r.city}</div>
                      {r.pincode && <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{r.state} {r.pincode}</div>}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Popular Metros Chips */}
            <div className="amz-popular-metros-wrap">
              <div className="amz-popular-metros-title">Popular Delivery Hubs</div>
              <div className="amz-popular-metros-chips">
                {quickCities.map((c) => (
                  <button
                    key={c.city}
                    type="button"
                    onClick={() => applyLocation(c)}
                    className={`amz-metro-chip ${location.city === c.city ? 'active' : ''}`}
                  >
                    {c.city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="amz-location-panel-footer">
            Powered by OpenStreetMap · Instant Pincode Routing
          </div>
        </div>
      )}
    </div>
  );
}
