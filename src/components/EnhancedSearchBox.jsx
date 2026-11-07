import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, X, Clock, Flame, 
  Sparkles, ArrowRight, CornerDownLeft, Star, ChevronDown, Check
} from 'lucide-react';
import { productAPI } from '../services/api';
import { formatINRCompact } from '../utils/currency';

const RECENT_SEARCHES_KEY = 'aura_recent_searches';
const MAX_RECENTS = 6;

const TRENDING_SEARCHES = [
  { label: 'iPhone 16 Pro Max', tag: 'iphone' },
  { label: 'Sony WH-1000XM5', tag: 'sony' },
  { label: 'MacBook Air M3', tag: 'macbook' },
  { label: 'Nothing Phone (2)', tag: 'nothing' },
  { label: 'OLED 4K Smart TV', tag: 'tv' },
  { label: 'Mechanical Keyboard', tag: 'keyboard' },
  { label: 'Noise Cancelling Audio', tag: 'audio' },
];

export default function EnhancedSearchBox({
  categories = [],
  selectedCategory = 'all',
  onCategoryChange,
  initialQuery = '',
  placeholder = 'Search AURA for flagships, headphones, laptops, luxury tech...',
  onSearchSubmit,
  compact = false,
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const [mobilePlaceholder, setMobilePlaceholder] = useState('Search AURA...');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 640) {
        setMobilePlaceholder('Search AURA...');
      } else if (window.innerWidth <= 992) {
        setMobilePlaceholder('Search products & brands...');
      } else {
        setMobilePlaceholder(placeholder);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [placeholder]);

  // Sync initial query
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to parse recent searches', e);
    }
  }, []);

  // Save term to recent searches
  const saveRecentSearch = useCallback((term) => {
    const clean = (term || '').trim();
    if (!clean) return;
    try {
      setRecentSearches((prev) => {
        const filtered = prev.filter((item) => item.toLowerCase() !== clean.toLowerCase());
        const updated = [clean, ...filtered].slice(0, MAX_RECENTS);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.warn('Could not save search history', e);
    }
  }, []);

  const removeRecentSearch = (termToRemove, e) => {
    e.stopPropagation();
    try {
      setRecentSearches((prev) => {
        const updated = prev.filter((t) => t !== termToRemove);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (_) {}
  };

  const clearAllRecent = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  // Debounced Live Search Suggestions
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      setTotalMatches(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      const params = {
        search: trimmed,
        size: 5,
      };
      if (selectedCategory && selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      productAPI.list(params)
        .then((res) => {
          const items = res.content || [];
          setSuggestions(items);
          setTotalMatches(res.totalElements || items.length);
        })
        .catch((err) => {
          console.error('Search suggestion query error', err);
          setSuggestions([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 220);

    return () => clearTimeout(timer);
  }, [query, selectedCategory]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const executeSearch = (catVal, queryVal) => {
    const trimmed = (queryVal || '').trim();
    if (trimmed) {
      saveRecentSearch(trimmed);
    }
    setIsOpen(false);
    setActiveIndex(-1);

    if (onSearchSubmit) {
      onSearchSubmit(catVal, trimmed);
    } else {
      const params = new URLSearchParams();
      if (trimmed) params.set('search', trimmed);
      if (catVal && catVal !== 'all') params.set('category', catVal);
      const qs = params.toString();
      navigate(qs ? `/shop?${qs}` : '/shop');
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      handleProductClick(suggestions[activeIndex]);
      return;
    }
    executeSearch(selectedCategory, query);
  };

  const handleProductClick = (product) => {
    saveRecentSearch(product.name);
    setIsOpen(false);
    navigate(`/products/${product.id}`);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        handleProductClick(suggestions[activeIndex]);
      }
    }
  };

  // Highlight matching letters in product title
  const highlightMatch = (text, match) => {
    if (!match || !text) return text;
    const parts = text.split(new RegExp(`(${match.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === match.toLowerCase() ? (
        <span key={i} className="aura-search-highlight">{part}</span>
      ) : part
    );
  };

  return (
    <div 
      ref={containerRef} 
      className={`aura-enhanced-search-root ${compact ? 'is-compact' : ''} ${isOpen ? 'dropdown-active' : ''}`}
    >
      <form onSubmit={handleSubmit} className="aura-search-bar-frame" role="search">
        {/* Category Selector Pill */}
        {categories.length > 0 && onCategoryChange && (
          <div className="aura-search-cat-wrapper">
            <select
              value={selectedCategory}
              onChange={(e) => {
                const newCat = e.target.value;
                onCategoryChange(e);
                if (query.trim()) {
                  // Keep dropdown open and update results with new department
                  inputRef.current?.focus();
                }
              }}
              className="aura-search-cat-select"
              aria-label="Filter department"
            >
              <option value="all">All Departments</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug || c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="aura-search-cat-arrow" />
          </div>
        )}

        {/* Search Input Box */}
        <div className="aura-search-input-field">
          <Search size={17} className="aura-search-lens-icon" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={mobilePlaceholder}
            className="aura-search-native-input"
            autoComplete="off"
            spellCheck="false"
            id="aura-main-search-input"
          />

          {/* Clear button (X) */}
          {query.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="aura-search-clear-btn"
              title="Clear search text"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Submit Search Button */}
        <button 
          type="submit" 
          className="aura-search-action-btn" 
          title="Search catalog"
          aria-label="Submit search"
        >
          <Search size={18} />
          <span className="aura-search-btn-label">Search</span>
        </button>
      </form>

      {/* Floating Smart Suggestion & Autocomplete Dropdown */}
      {isOpen && (
        <div className="aura-search-dropdown-panel" role="listbox">
          {/* STATE 1: User has typed query */}
          {query.trim().length > 0 ? (
            <>
              {/* Loading State */}
              {isLoading && (
                <div className="aura-search-loading-row">
                  <div className="aura-search-shimmer-line" />
                  <div className="aura-search-shimmer-line short" />
                </div>
              )}

              {/* Instant Product Results */}
              {!isLoading && suggestions.length > 0 && (
                <div className="aura-search-section">
                  <div className="aura-search-section-header">
                    <span>Products ({totalMatches} matches)</span>
                    <span className="aura-search-hint-key">Use ↑ ↓ arrows, ↵ Enter</span>
                  </div>

                  <div className="aura-search-products-list">
                    {suggestions.map((p, idx) => {
                      const comp = p.comparePrice || (p.featured ? p.price * 1.25 : p.price * 1.15);
                      const discountPct = Math.round((1 - p.price / comp) * 100);
                      const isHighlighted = idx === activeIndex;

                      return (
                        <div
                          key={p.id}
                          className={`aura-search-product-row ${isHighlighted ? 'is-active' : ''}`}
                          onClick={() => handleProductClick(p)}
                          onMouseEnter={() => setActiveIndex(idx)}
                          role="option"
                          aria-selected={isHighlighted}
                        >
                          <div className="aura-search-img-wrap">
                            <img 
                              src={p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120'} 
                              alt={p.name}
                              loading="lazy"
                            />
                          </div>

                          <div className="aura-search-item-info">
                            <div className="aura-search-item-title">
                              {highlightMatch(p.name, query)}
                            </div>
                            <div className="aura-search-item-meta">
                              {p.category?.name && (
                                <span className="aura-search-cat-badge">{p.category.name}</span>
                              )}
                              <span className="aura-search-rating-badge">
                                <Star size={11} fill="#f59e0b" color="#f59e0b" />
                                {p.rating || 4.7}
                              </span>
                              {p.stockQuantity <= 5 && p.stockQuantity > 0 && (
                                <span className="aura-search-stock-badge">Only {p.stockQuantity} left</span>
                              )}
                            </div>
                          </div>

                          <div className="aura-search-item-pricing">
                            <span className="aura-search-price-now">
                              {formatINRCompact(p.price)}
                            </span>
                            {discountPct > 0 && (
                              <span className="aura-search-discount-chip">
                                {discountPct}% OFF
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer Action: See All X Results */}
                  <div 
                    className="aura-search-footer-action" 
                    onClick={() => executeSearch(selectedCategory, query)}
                  >
                    <span>
                      See all <strong>{totalMatches}</strong> results for "<strong>{query}</strong>"
                      {selectedCategory !== 'all' && ` in this department`}
                    </span>
                    <ArrowRight size={15} />
                  </div>
                </div>
              )}

              {/* Empty / No Matches State */}
              {!isLoading && suggestions.length === 0 && (
                <div className="aura-search-empty-state">
                  <div className="aura-search-empty-title">
                    No exact products found for "<strong>{query}</strong>"
                  </div>
                  <p className="aura-search-empty-sub">
                    Try checking your spelling, removing filters, or explore our popular collections:
                  </p>
                  <div className="aura-search-suggest-chips">
                    {TRENDING_SEARCHES.slice(0, 4).map((t) => (
                      <button
                        key={t.tag}
                        type="button"
                        onClick={() => {
                          setQuery(t.label);
                          executeSearch('all', t.label);
                        }}
                        className="aura-search-chip-btn"
                      >
                        <Sparkles size={12} color="#4f46e5" />
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* STATE 2: Zero query (Input is focused but empty) */
            <div className="aura-search-zero-panel">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="aura-search-section">
                  <div className="aura-search-section-header">
                    <span className="aura-search-section-title">
                      <Clock size={13} /> Recent Searches
                    </span>
                    <button 
                      type="button" 
                      onClick={clearAllRecent}
                      className="aura-search-clear-all-link"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="aura-search-recent-list">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        className="aura-search-recent-item"
                        onClick={() => {
                          setQuery(term);
                          executeSearch(selectedCategory, term);
                        }}
                      >
                        <div className="aura-search-recent-left">
                          <Clock size={14} className="aura-search-recent-clock" />
                          <span>{term}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(term, e)}
                          className="aura-search-remove-recent-btn"
                          title="Remove from history"
                          aria-label={`Remove ${term}`}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              <div className="aura-search-section">
                <div className="aura-search-section-header">
                  <span className="aura-search-section-title">
                    <Flame size={13} color="#f43f5e" /> Trending Searches
                  </span>
                </div>

                <div className="aura-search-trending-grid">
                  {TRENDING_SEARCHES.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setQuery(item.label);
                        executeSearch(selectedCategory, item.label);
                      }}
                      className="aura-search-trending-pill"
                    >
                      <Sparkles size={12} className="aura-trending-star-icon" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Department Shortcuts */}
              {categories.length > 0 && (
                <div className="aura-search-section">
                  <div className="aura-search-section-header">
                    <span className="aura-search-section-title">
                      <Sparkles size={13} color="#3b82f6" /> Popular Departments
                    </span>
                  </div>

                  <div className="aura-search-dept-tags">
                    {categories.slice(0, 6).map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          if (onCategoryChange) {
                            onCategoryChange({ target: { value: cat.slug || cat.id } });
                          }
                          executeSearch(cat.slug || cat.id, '');
                        }}
                        className="aura-search-dept-btn"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
