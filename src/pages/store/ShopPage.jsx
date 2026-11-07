import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  SlidersHorizontal, ChevronDown, Search, X, Star, Check, 
  ArrowRight, Truck, Sparkles, ShieldCheck, Grid, List, CheckCircle2, RotateCcw,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import EnhancedSearchBox from '../../components/EnhancedSearchBox';
import { productAPI, categoryAPI } from '../../services/api';
import '../../styles/store.css';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [totalCatalogCount, setTotalCatalogCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const categoryPillsRef = useRef(null);

  const scrollPillsLeft = () => {
    if (categoryPillsRef.current) categoryPillsRef.current.scrollBy({ left: -280, behavior: 'smooth' });
  };
  const scrollPillsRight = () => {
    if (categoryPillsRef.current) categoryPillsRef.current.scrollBy({ left: 280, behavior: 'smooth' });
  };

  // URL Query Parameters
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const minRatingParam = searchParams.get('minRating') ? Number(searchParams.get('minRating')) : null;
  const minPriceParam = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : null;
  const maxPriceParam = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null;
  const inStockOnly = searchParams.get('inStock') === 'true';
  const assuredOnly = searchParams.get('assured') === 'true';
  const discountMin = searchParams.get('discount') ? Number(searchParams.get('discount')) : null;
  const sortBy = searchParams.get('sort') || 'id,desc';

  // Local Min/Max price states
  const [customMin, setCustomMin] = useState(minPriceParam ? String(minPriceParam) : '');
  const [customMax, setCustomMax] = useState(maxPriceParam ? String(maxPriceParam) : '');
  const [categoryCounts, setCategoryCounts] = useState({});

  useEffect(() => {
    categoryAPI.list()
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.content || []);
        setCategories(list);
        const counts = {};
        let total = 0;
        list.forEach((c) => {
          const count = c.products?.length || 0;
          counts[c.slug || c.id] = count;
          total += count;
        });
        setCategoryCounts(counts);
        setTotalCatalogCount(total || 122);
      })
      .catch(console.error);
  }, []);

  // Fetch filtered products
  useEffect(() => {
    setLoading(true);
    const params = { page, size: 24, sort: sortBy };
    if (search) params.search = search;
    if (category) params.category = category;
    if (minPriceParam != null) params.minPrice = minPriceParam;
    if (maxPriceParam != null) params.maxPrice = maxPriceParam;
    if (minRatingParam != null) params.minRating = minRatingParam;

    productAPI.list(params)
      .then((data) => {
        let items = data.content || [];
        
        // Client-side refinements
        if (inStockOnly) {
          items = items.filter((p) => p.stockQuantity > 0);
        }
        if (discountMin) {
          items = items.filter((p) => {
            const comp = p.comparePrice || (p.featured ? p.price * 1.25 : p.price * 1.15);
            const disc = Math.round((1 - p.price / comp) * 100);
            return disc >= discountMin;
          });
        }
        if (assuredOnly) {
          items = items.filter((p) => p.featured || (p.rating || 4.5) >= 4.4);
        }

        setProducts(items);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || items.length);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, category, minRatingParam, minPriceParam, maxPriceParam, inStockOnly, assuredOnly, discountMin, sortBy, page]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === undefined) {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
    params.set('page', '0');
    setPage(0);
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setCustomMin('');
    setCustomMax('');
    setPage(0);
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (customMin) params.set('minPrice', customMin);
    else params.delete('minPrice');
    if (customMax) params.set('maxPrice', customMax);
    else params.delete('maxPrice');
    setSearchParams(params);
  };

  const activeFiltersCount = [
    category,
    search,
    minPriceParam != null,
    maxPriceParam != null,
    minRatingParam != null,
    inStockOnly,
    assuredOnly,
    discountMin
  ].filter(Boolean).length;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '1.5rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '1440px', padding: '0 1.5rem' }}>
        
        {/* Amazon-Style Top Breadcrumb & Query Banner */}
        <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 0.5rem' }}>›</span>
            <Link to="/shop" style={{ color: '#64748b', textDecoration: 'none' }}>Department Store</Link>
            {category && (
              <>
                <span style={{ margin: '0 0.5rem' }}>›</span>
                <span style={{ color: '#0f172a', fontWeight: 700 }}>
                  {categories.find(c => (c.slug || c.id) === category)?.name || category}
                </span>
              </>
            )}
            {search && (
              <>
                <span style={{ margin: '0 0.5rem' }}>›</span>
                <span style={{ color: '#0f172a', fontWeight: 700 }}>"{search}"</span>
              </>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.82rem',
                  color: '#e11d48',
                  background: '#fff1f2',
                  border: '1px solid #fecdd3',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                <RotateCcw size={13} /> Clear {activeFiltersCount} Filters
              </button>
            )}
          </div>
        </div>

        {/* Horizontal All Categories Quick-Filter Bar */}
        <div className="shop-horizontal-categories-bar">
          <button
            type="button"
            className="shop-h-cat-nav-btn"
            onClick={scrollPillsLeft}
            aria-label="Scroll categories left"
            title="Scroll categories left"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="shop-h-cat-track" ref={categoryPillsRef}>
            {/* All Departments Pill */}
            <button
              type="button"
              onClick={() => updateFilter('category', null)}
              className={`shop-h-cat-pill ${!category ? 'active' : ''}`}
            >
              <span className="shop-h-cat-icon">🛍️</span>
              <span className="shop-h-cat-label">All Categories</span>
              <span className="shop-h-cat-count">{totalCatalogCount}</span>
            </button>

            {/* Dynamic Category Pills */}
            {categories.map((c) => {
              const slug = c.slug || c.id;
              const isSelected = category === slug;
              const count = categoryCounts[slug] || 0;
              let icon = '📦';
              if (slug.includes('mob')) icon = '📱';
              else if (slug.includes('elec')) icon = '💻';
              else if (slug.includes('audio')) icon = '🎧';
              else if (slug.includes('home')) icon = '🛋️';
              else if (slug.includes('fash')) icon = '👔';
              else if (slug.includes('fit')) icon = '🏃';

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => updateFilter('category', isSelected ? null : slug)}
                  className={`shop-h-cat-pill ${isSelected ? 'active' : ''}`}
                >
                  <span className="shop-h-cat-icon">{icon}</span>
                  <span className="shop-h-cat-label">{c.name}</span>
                  {count > 0 && <span className="shop-h-cat-count">{count}</span>}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="shop-h-cat-nav-btn"
            onClick={scrollPillsRight}
            aria-label="Scroll categories right"
            title="Scroll categories right"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* 2-Column Amazon / Flipkart Shop Layout */}
        <div className="shop-responsive-grid">
          
          {/* Mobile Filter Backdrop Overlay */}
          {mobileFilterOpen && (
            <div 
              className="shop-filter-overlay-mobile" 
              onClick={() => setMobileFilterOpen(false)} 
            />
          )}

          {/* ================= LEFT FILTER SIDEBAR ================= */}
          <aside className={`shop-filter-aside ${mobileFilterOpen ? 'mobile-open' : ''}`}>

            {/* Mobile Filter Sheet Header */}
            {mobileFilterOpen && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Filters & Refinements</h3>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#0f172a' }}
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* 1. AURA Assured Toggle */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 0.75rem 0' }}>
                Delivery Program
              </h4>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.86rem', color: '#0f172a', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={assuredOnly}
                  onChange={(e) => updateFilter('assured', e.target.checked ? 'true' : null)}
                  style={{ width: '16px', height: '16px', accentColor: '#4f46e5' }}
                />
                <span className="amz-assured-badge">
                  <ShieldCheck size={12} /> AURA ASSURED
                </span>
              </label>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.35rem', marginLeft: '1.65rem' }}>
                Free next-day express delivery & verified authentic wares
              </div>
            </div>

            {/* 2. Department / Categories */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 0.75rem 0' }}>
                Department
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => updateFilter('category', null)}
                  className={`shop-category-link ${!category ? 'active' : ''}`}
                >
                  <span>All Categories</span>
                  <span className="shop-cat-count">({totalCatalogCount})</span>
                </button>

                {categories.map((c) => {
                  const slug = c.slug || c.id;
                  const isSelected = category === slug;
                  const count = categoryCounts[slug] || 0;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => updateFilter('category', isSelected ? null : slug)}
                      className={`shop-category-link ${isSelected ? 'active' : ''}`}
                    >
                      <span>{c.name}</span>
                      {count > 0 && <span className="shop-cat-count">({count})</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Customer Reviews Filter (Amazon Star Rating) */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 0.75rem 0' }}>
                Customer Reviews
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {[4, 3, 2].map((r) => {
                  const isSelected = minRatingParam === r;
                  return (
                    <button
                      key={r}
                      onClick={() => updateFilter('minRating', isSelected ? null : r)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        background: isSelected ? '#ecfdf5' : 'transparent',
                        border: isSelected ? '1px solid #a7f3d0' : '1px solid transparent',
                        padding: '0.35rem 0.5rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < r ? '#f59e0b' : 'none'}
                            color={i < r ? '#f59e0b' : '#cbd5e1'}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>& Up</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Price Filter with Min/Max Inputs */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 0.75rem 0' }}>
                Price Range (₹)
              </h4>
              <form onSubmit={handlePriceApply} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={customMin}
                  onChange={(e) => setCustomMin(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.5rem',
                    fontSize: '0.82rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    background: '#ffffff',
                    color: '#0f172a'
                  }}
                />
                <span style={{ color: '#94a3b8' }}>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={customMax}
                  onChange={(e) => setCustomMax(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.5rem',
                    fontSize: '0.82rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    background: '#ffffff',
                    color: '#0f172a'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Go
                </button>
              </form>

              {/* Price Preset Chips */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem' }}>
                {[
                  { label: 'Under ₹10,000', max: 10000 },
                  { label: '₹10,000 - ₹30,000', min: 10000, max: 30000 },
                  { label: '₹30,000 - ₹75,000', min: 30000, max: 75000 },
                  { label: 'Over ₹75,000', min: 75000 },
                ].map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      if (p.min) params.set('minPrice', String(p.min));
                      else params.delete('minPrice');
                      if (p.max) params.set('maxPrice', String(p.max));
                      else params.delete('maxPrice');
                      setSearchParams(params);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#475569',
                      textAlign: 'left',
                      padding: '0.2rem 0',
                      cursor: 'pointer',
                      fontSize: '0.82rem'
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Discount Percentage Filter (Flipkart Style) */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 0.75rem 0' }}>
                Discount
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem' }}>
                {[50, 40, 30, 20, 10].map((d) => (
                  <button
                    key={d}
                    onClick={() => updateFilter('discount', discountMin === d ? null : d)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: discountMin === d ? '#4f46e5' : '#475569',
                      fontWeight: discountMin === d ? 800 : 500,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: discountMin === d ? '#4f46e5' : '#cbd5e1' }}></span>
                    {d}% or more
                  </button>
                ))}
              </div>
            </div>

            {/* 6. In Stock Availability */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : null)}
                  style={{ width: '16px', height: '16px', accentColor: '#4f46e5' }}
                />
                <span>Include In-Stock Only</span>
              </label>
            </div>

            {/* Mobile Filter Done Button */}
            {mobileFilterOpen && (
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                style={{
                  position: 'sticky',
                  bottom: '10px',
                  width: '100%',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '0.85rem',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)',
                  cursor: 'pointer',
                  marginTop: '1rem'
                }}
              >
                Apply & View {products.length} Results
              </button>
            )}

          </aside>

          {/* ================= RIGHT RESULTS MAIN ================= */}
          <main>
            
            {/* In-Catalog Quick Search & Active Filter Banner */}
            <div className="shop-inpage-search-banner">
              <div className="shop-inpage-search-info">
                <span className="shop-inpage-count-badge">
                  {loading ? 'Searching catalog...' : `${totalElements} Products Available`}
                </span>
                {search && (
                  <span className="shop-inpage-query-pill">
                    Keyword: "{search}"
                    <button 
                      type="button" 
                      onClick={() => updateFilter('search', null)}
                      title="Clear keyword filter"
                      aria-label="Clear search"
                    >
                      <X size={13} />
                    </button>
                  </span>
                )}
                {category && (
                  <span className="shop-inpage-query-pill" style={{ background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }}>
                    Dept: {categories.find(c => (c.slug || c.id) === category)?.name || category}
                    <button 
                      type="button" 
                      onClick={() => updateFilter('category', null)}
                      title="Clear category filter"
                      aria-label="Clear category"
                    >
                      <X size={13} />
                    </button>
                  </span>
                )}
              </div>
              <div style={{ flex: '1', maxWidth: '420px', minWidth: '260px' }}>
                <EnhancedSearchBox
                  compact={true}
                  placeholder="Refine in current results..."
                  initialQuery={search}
                  selectedCategory={category || 'all'}
                  onSearchSubmit={(cat, q) => {
                    updateFilter('search', q || null);
                  }}
                />
              </div>
            </div>

            {/* Header Results Bar with Sort & View Toggle */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '1rem 1.5rem',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div>
                <span style={{ fontSize: '0.92rem', color: '#0f172a', fontWeight: 800 }}>
                  Showing {products.length} {products.length === 1 ? 'result' : 'results'}
                </span>
                {category && (
                  <span style={{ fontSize: '0.85rem', color: '#64748b', marginLeft: '0.45rem' }}>
                    in {categories.find(c => (c.slug || c.id) === category)?.name || category}
                  </span>
                )}
              </div>

              {/* View Switcher & Sort By */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                
                {/* Mobile Filter Trigger Button */}
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className="mobile-filter-trigger-btn"
                >
                  <SlidersHorizontal size={14} />
                  <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
                </button>
                
                {/* Grid / List Mode Switcher */}
                <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '3px' }}>
                  <button
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                    style={{
                      background: viewMode === 'grid' ? '#ffffff' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.35rem 0.55rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      color: viewMode === 'grid' ? '#0f172a' : '#64748b',
                      boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    title="List View"
                    style={{
                      background: viewMode === 'list' ? '#ffffff' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.35rem 0.55rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      color: viewMode === 'list' ? '#0f172a' : '#64748b',
                      boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    <List size={16} />
                  </button>
                </div>

                {/* Sort By Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => updateFilter('sort', e.target.value)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '0.4rem 0.75rem',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="id,desc">Featured</option>
                    <option value="price,asc">Price: Low to High</option>
                    <option value="price,desc">Price: High to Low</option>
                    <option value="rating,desc">Avg. Customer Review</option>
                    <option value="discount,desc">Biggest Savings (% Off)</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Products Grid / List Rendering */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '5rem 0', color: '#64748b' }}>
                <div className="luxury-spinner" style={{ margin: '0 auto 1rem' }}></div>
                <p style={{ fontWeight: 600 }}>Loading catalog items...</p>
              </div>
            ) : products.length === 0 ? (
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '4rem 2rem',
                textAlign: 'center'
              }}>
                <Search size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                  No Products Found
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  We couldn't find any products matching your selected filters. Try broadening your criteria.
                </p>
                <button
                  onClick={clearAllFilters}
                  style={{
                    background: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '0.75rem 1.6rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="amz-products-grid">
                {products.map((prod) => (
                  <ProductCard key={prod.id} product={prod} viewMode="grid" />
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {products.map((prod) => (
                  <ProductCard key={prod.id} product={prod} viewMode="list" />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
                <button
                  disabled={page === 0}
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: page === 0 ? '#94a3b8' : '#0f172a',
                    cursor: page === 0 ? 'not-allowed' : 'pointer',
                    fontWeight: 700
                  }}
                >
                  Previous
                </button>
                <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', fontSize: '0.88rem', fontWeight: 700, color: '#475569' }}>
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: page >= totalPages - 1 ? '#94a3b8' : '#0f172a',
                    cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                    fontWeight: 700
                  }}
                >
                  Next
                </button>
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
}
