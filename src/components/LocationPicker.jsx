import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search, Loader2, X, CheckCircle2 } from 'lucide-react';

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
    }, 600);
  };

  // Popular Indian cities for quick pick
  const quickCities = [
    { city: 'Mumbai', pincode: '400001', display: 'Mumbai 400001' },
    { city: 'Delhi', pincode: '110001', display: 'Delhi 110001' },
    { city: 'Bengaluru', pincode: '560001', display: 'Bengaluru 560001' },
    { city: 'Hyderabad', pincode: '500001', display: 'Hyderabad 500001' },
    { city: 'Chennai', pincode: '600001', display: 'Chennai 600001' },
    { city: 'Kolkata', pincode: '700001', display: 'Kolkata 700001' },
    { city: 'Pune', pincode: '411001', display: 'Pune 411001' },
    { city: 'Ahmedabad', pincode: '380001', display: 'Ahmedabad 380001' },
  ];

  return (
    <div style={{ position: 'relative' }} ref={dropRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="nav-location-btn amz-header-location-btn"
        title="Change delivery location"
        type="button"
      >
        <MapPin size={16} color="#4f46e5" style={{ flexShrink: 0 }} />
        <div className="nav-location-text-wrap">
          <span className="nav-location-label">
            Deliver to
          </span>
          <span className="nav-location-dest">
            {location.display}
          </span>
        </div>
      </button>

      {/* Mobile Backdrop */}
      {open && (
        <div 
          className="location-backdrop-mobile"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Dropdown Panel */}
      {open && (
        <div className="amz-location-dropdown-panel" style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          left: 'auto',
          zIndex: 9999,
          width: '320px',
          maxWidth: 'calc(100vw - 20px)',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.15)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ padding: '1rem 1.15rem 0.85rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>Select Destination</div>
              <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>White glove courier & transit estimated to this region</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '50%', cursor: 'pointer', color: '#64748b', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
              <X size={15} />
            </button>
          </div>

          <div style={{ padding: '1rem 1.15rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Current location display */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 0.85rem', background: '#eef2ff', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              {confirmed ? <CheckCircle2 size={18} color="#10b981" /> : <MapPin size={18} color="#4f46e5" />}
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Active Destination</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{location.display}</div>
              </div>
            </div>

            {/* Use My Location Button */}
            <button
              onClick={useMyLocation}
              disabled={geoLoading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem',
                background: '#0f172a',
                border: 'none',
                borderRadius: '10px',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: geoLoading ? 'wait' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {geoLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Navigation size={16} />}
              {geoLoading ? 'Pinpointing Coordinates...' : 'Detect Current Location'}
            </button>

            {/* Search Box */}
            <div style={{ position: 'relative' }}>
              <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search city or pincode..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '0.6rem 1rem 0.6rem 2.25rem',
                  color: '#0f172a',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {searching && <Loader2 size={14} color="#64748b" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', animation: 'spin 1s linear infinite' }} />}
            </div>

            {/* Search Results */}
            {results.length > 0 && (
              <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {results.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => applyLocation(r)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.55rem 0.75rem',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#0f172a',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <MapPin size={14} color="#64748b" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{r.city}</div>
                      {r.pincode && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.state} {r.pincode}</div>}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Divider */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.6rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Popular Metros</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {quickCities.map((c) => (
                  <button
                    key={c.city}
                    onClick={() => applyLocation(c)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      background: location.city === c.city ? '#0f172a' : '#f8fafc',
                      border: location.city === c.city ? '1px solid #0f172a' : '1px solid #e2e8f0',
                      borderRadius: '9999px',
                      color: location.city === c.city ? '#ffffff' : '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {c.city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div style={{ padding: '0.6rem 1rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9', fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center' }}>
            Powered by OpenStreetMap · Realtime Geolocation
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: translateY(-50%) rotate(0deg); } to { transform: translateY(-50%) rotate(360deg); } }
      `}</style>
    </div>
  );
}
