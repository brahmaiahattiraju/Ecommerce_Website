import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Star, Sparkles, ShieldCheck, Truck, RefreshCw, 
  Headphones, Laptop, Smartphone, Home, Watch, ChevronRight, ChevronLeft,
  Flame, Clock, CreditCard, ShoppingBag, Zap, CheckCircle2, Award
} from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import { productAPI, categoryAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import '../../styles/store.css';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 15 });

  const dealsScrollRef = useRef(null);
  const electronicsScrollRef = useRef(null);
  const audioScrollRef = useRef(null);
  const categoryScrollRef = useRef(null);

  // Amazon/Flipkart Hero Banner Promotions
  const heroBanners = [
    {
      title: 'THE GREAT ELECTRONICS FESTIVAL',
      headline: 'Up to 70% Off on Flagship Tech & Hi-Fi Audio',
      subtext: 'Instant 10% Bank Discount on HDFC & ICICI Bank Cards • No Cost EMI Available',
      badge: 'BLOCKBUSTER SALE 2026',
      bgGradient: 'linear-gradient(135deg, #0b0f19 0%, #1e1b4b 50%, #312e81 100%)',
      accentColor: '#38bdf8',
      buttonText: 'Shop All Deals',
      link: '/shop?sort=discount,desc',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=85',
    },
    {
      title: 'TITANIUM SMARTPHONE & PRO COMPUTING',
      headline: 'Next-Gen Silicon & Grade-5 Titanium Mobiles',
      subtext: 'Complimentary Express Courier • Extra ₹5,000 Exchange Bonus on Old Devices',
      badge: 'LIMITED TIME DEAL',
      bgGradient: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #065f46 100%)',
      accentColor: '#34d399',
      buttonText: 'Explore Mobiles',
      link: '/shop?category=mobiles',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&q=85',
    },
    {
      title: 'AUDIOPHILE ACOUSTICS & HI-FI SOUND',
      headline: 'Beryllium Drivers & Spatial Head-Tracking Monitors',
      subtext: 'Experience Master Tape Clarity • 2-Year International Replacement Warranty',
      badge: 'AURA SOUND LABS',
      bgGradient: 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #3f3f46 100%)',
      accentColor: '#f59e0b',
      buttonText: 'Discover Audio',
      link: '/shop?category=audio',
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200&q=85',
    },
  ];

  // Live Countdown Timer for Lightning Deals
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 30, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Hero Slider Auto-rotation
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroBanners.length);
    }, 5500);
    return () => clearInterval(slideTimer);
  }, [heroBanners.length]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      productAPI.list({ size: 40 }),
      categoryAPI.list(),
    ])
      .then(([prodRes, catRes]) => {
        const prodList = Array.isArray(prodRes) ? prodRes : (prodRes?.content || []);
        const catList = Array.isArray(catRes) ? catRes : (catRes?.content || []);
        setProducts(prodList);
        setCategories(catList);
      })
      .catch((err) => console.error('Failed to load store creations', err))
      .finally(() => setLoading(false));
  }, []);

  const scrollLeft = (ref) => {
    if (ref.current) ref.current.scrollBy({ left: -360, behavior: 'smooth' });
  };

  const scrollRight = (ref) => {
    if (ref.current) ref.current.scrollBy({ left: 360, behavior: 'smooth' });
  };

  const currentBanner = heroBanners[activeSlide];

  // Categorized product slices
  const lightningDeals = products.slice(0, 10);
  const electronicsProducts = products.filter(p => 
    p.category?.slug === 'electronics' || p.category?.name?.toLowerCase().includes('elec') || p.category?.name?.toLowerCase().includes('comput')
  );
  const audioProducts = products.filter(p => 
    p.category?.slug === 'audio' || p.category?.name?.toLowerCase().includes('audio') || p.category?.name?.toLowerCase().includes('sound')
  );

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* 1. Amazon / Flipkart Hero Promo Banner Carousel */}
      <div style={{ position: 'relative', overflow: 'hidden', background: '#0b0f19' }}>
        <div style={{
          minHeight: '380px',
          background: currentBanner.bgGradient,
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.5s ease',
          position: 'relative'
        }}>
          <div className="container" style={{ maxWidth: '1440px', padding: '2.5rem 1.5rem', width: '100%' }}>
            <div className="hero-responsive-grid">
              
              {/* Promo Copy */}
              <div>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: currentBanner.accentColor,
                  padding: '0.3rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  marginBottom: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}>
                  <Flame size={14} /> {currentBanner.badge}
                </span>

                <h1 style={{
                  fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                  fontWeight: 900,
                  color: '#ffffff',
                  lineHeight: '1.15',
                  margin: '0 0 1rem 0',
                  letterSpacing: '-0.02em'
                }}>
                  {currentBanner.headline}
                </h1>

                <p style={{ color: '#cbd5e1', fontSize: '1rem', margin: '0 0 1.5rem 0', maxWidth: '580px', lineHeight: '1.4' }}>
                  {currentBanner.subtext}
                </p>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Link
                    to={currentBanner.link}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                      color: '#ffffff',
                      padding: '0.75rem 1.6rem',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      textDecoration: 'none',
                      boxShadow: '0 6px 20px rgba(79, 70, 229, 0.4)',
                    }}
                  >
                    <span>{currentBanner.buttonText}</span>
                    <ArrowRight size={16} />
                  </Link>

                  <Link
                    to="/shop"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      padding: '0.75rem 1.4rem',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      textDecoration: 'none',
                    }}
                  >
                    All Categories
                  </Link>
                </div>
              </div>

              {/* Promo Visual Showcase */}
              <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                <img
                  src={currentBanner.image}
                  alt={currentBanner.title}
                  style={{
                    maxHeight: '320px',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    borderRadius: '18px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                />
              </div>

            </div>
          </div>
        </div>

        {/* Carousel Indicator Dots */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0.5rem',
          zIndex: 10
        }}>
          {heroBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              style={{
                width: idx === activeSlide ? '24px' : '8px',
                height: '8px',
                borderRadius: '9999px',
                background: idx === activeSlide ? '#ffffff' : 'rgba(255, 255, 255, 0.35)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 2. Bank Offer & Trust Ribbon */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0.65rem 0',
        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)'
      }}>
        <div className="container" style={{ maxWidth: '1440px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflowX: 'auto', gap: '1.5rem', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', fontSize: '0.82rem', color: '#0f172a', fontWeight: 700 }}>
            <CreditCard size={16} color="#4f46e5" />
            <span>10% Instant Discount on HDFC & ICICI Cards (Up to ₹2,500)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', fontSize: '0.82rem', color: '#0f172a', fontWeight: 700 }}>
            <Truck size={16} color="#059669" />
            <span>FREE Next-Day Delivery across 10,000+ PIN codes</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', fontSize: '0.82rem', color: '#0f172a', fontWeight: 700 }}>
            <ShieldCheck size={16} color="#0284c7" />
            <span>AURA ASSURED: 100% Genuine with 2-Year Warranty</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', fontSize: '0.82rem', color: '#0f172a', fontWeight: 700 }}>
            <RefreshCw size={16} color="#d97706" />
            <span>7-Day Frictionless Replacement Guarantee</span>
          </div>
        </div>
      </div>

      {/* 2.5. Dedicated Horizontal All Categories Showcase Strip */}
      <section className="amz-horizontal-category-strip">
        <div className="container" style={{ maxWidth: '1440px', padding: '0 1.5rem' }}>
          <div className="amz-cat-strip-header">
            <div>
              <h2 className="amz-cat-strip-title">Explore All Categories</h2>
              <p className="amz-cat-strip-sub">Direct access to genuine brands with express courier & verified authenticity</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/shop" className="amz-cat-strip-viewall">
                <span>All Departments ({categories.length || 6})</span>
                <ArrowRight size={14} />
              </Link>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button 
                  type="button" 
                  onClick={() => scrollLeft(categoryScrollRef)} 
                  className="btn-h-nav-arrow" 
                  title="Previous Categories"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#0f172a'
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  type="button" 
                  onClick={() => scrollRight(categoryScrollRef)} 
                  className="btn-h-nav-arrow" 
                  title="Next Categories"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#0f172a'
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <div ref={categoryScrollRef} className="amz-cat-scroll-track">
            {/* All Categories Pill Card */}
            <Link to="/shop" className="amz-cat-card all-card">
              <div className="amz-cat-img-box all-box">
                <ShoppingBag size={28} color="#ffffff" />
              </div>
              <span className="amz-cat-name">All Categories</span>
              <span className="amz-cat-badge">Full Catalog</span>
            </Link>

            {/* Dynamic Real Categories */}
            {categories.map((c) => {
              const slug = c.slug || c.id;
              let badge = 'Explore';
              if (slug.includes('mob')) badge = '5G Flagships';
              else if (slug.includes('elec')) badge = 'Pro Silicon';
              else if (slug.includes('audio')) badge = 'Hi-Fi Studio';
              else if (slug.includes('home')) badge = 'Smart Living';
              else if (slug.includes('fash')) badge = 'Trending';
              else if (slug.includes('fit')) badge = 'Active Gear';

              return (
                <Link key={c.id} to={`/shop?category=${slug}`} className="amz-cat-card">
                  <div className="amz-cat-img-box">
                    <img 
                      src={c.imageUrl || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=300'} 
                      alt={c.name} 
                      className="amz-cat-img"
                    />
                  </div>
                  <span className="amz-cat-name">{c.name}</span>
                  <span className="amz-cat-badge">{badge}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Amazon Signature 4-Quadrant Category Deal Grid */}
      <section className="amz-quad-section">
        <div className="container" style={{ maxWidth: '1440px', padding: '0 1.5rem' }}>
          <div className="amz-quad-grid">
            
            {/* Box 1: Blockbuster Deals */}
            <div className="amz-quad-card">
              <div>
                <h3 className="amz-quad-title">Today's Deals of the Day</h3>
                <div className="amz-quad-items-grid">
                  <Link to="/shop?category=audio" className="amz-quad-mini-item">
                    <div className="amz-quad-mini-img-wrap">
                      <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80" alt="Audio" />
                      <span className="amz-quad-mini-tag">Min 40% Off</span>
                    </div>
                    <span className="amz-quad-mini-label">Hi-Fi Audio</span>
                  </Link>

                  <Link to="/shop?category=electronics" className="amz-quad-mini-item">
                    <div className="amz-quad-mini-img-wrap">
                      <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&q=80" alt="Laptops" />
                      <span className="amz-quad-mini-tag">Up to 35% Off</span>
                    </div>
                    <span className="amz-quad-mini-label">Pro Laptops</span>
                  </Link>

                  <Link to="/shop?category=mobiles" className="amz-quad-mini-item">
                    <div className="amz-quad-mini-img-wrap">
                      <img src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&q=80" alt="Mobiles" />
                      <span className="amz-quad-mini-tag">Save ₹12,000</span>
                    </div>
                    <span className="amz-quad-mini-label">5G Mobiles</span>
                  </Link>

                  <Link to="/shop?category=home" className="amz-quad-mini-item">
                    <div className="amz-quad-mini-img-wrap">
                      <img src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=300&q=80" alt="Living" />
                      <span className="amz-quad-mini-tag">Up to 50% Off</span>
                    </div>
                    <span className="amz-quad-mini-label">Smart Living</span>
                  </Link>
                </div>
              </div>
              <Link to="/shop?sort=discount,desc" className="amz-quad-link">
                See all deals <ArrowRight size={14} />
              </Link>
            </div>

            {/* Box 2: Flagship Audio & Acoustic Wearables */}
            <div className="amz-quad-card">
              <div>
                <h3 className="amz-quad-title">AURA Hi-Fi Acoustic Sound</h3>
                <div className="amz-quad-items-grid">
                  <Link to="/shop?category=audio" className="amz-quad-mini-item">
                    <div className="amz-quad-mini-img-wrap">
                      <img src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&q=80" alt="Headphones" />
                      <span className="amz-quad-mini-tag">4.8 ★</span>
                    </div>
                    <span className="amz-quad-mini-label">ANC Over-Ear</span>
                  </Link>

                  <Link to="/shop?category=audio" className="amz-quad-mini-item">
                    <div className="amz-quad-mini-img-wrap">
                      <img src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&q=80" alt="Earbuds" />
                      <span className="amz-quad-mini-tag">40h Play</span>
                    </div>
                    <span className="amz-quad-mini-label">Studio Pods</span>
                  </Link>

                  <Link to="/shop?category=audio" className="amz-quad-mini-item">
                    <div className="amz-quad-mini-img-wrap">
                      <img src="https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300&q=80" alt="Speakers" />
                      <span className="amz-quad-mini-tag">Bass Boost</span>
                    </div>
                    <span className="amz-quad-mini-label">Hi-Fi Soundbars</span>
                  </Link>

                  <Link to="/shop?category=audio" className="amz-quad-mini-item">
                    <div className="amz-quad-mini-img-wrap">
                      <img src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&q=80" alt="Studio" />
                      <span className="amz-quad-mini-tag">Lossless</span>
                    </div>
                    <span className="amz-quad-mini-label">Desk Monitors</span>
                  </Link>
                </div>
              </div>
              <Link to="/shop?category=audio" className="amz-quad-link">
                Explore Sound Lab <ArrowRight size={14} />
              </Link>
            </div>

            {/* Box 3: Pro Computing & Silicon Powerhouses */}
            <div className="amz-quad-card">
              <div>
                <h3 className="amz-quad-title">Pro Computing & Workstations</h3>
                <div className="amz-quad-items-grid">
                  <Link to="/shop?category=electronics" className="amz-quad-mini-item">
                    <div className="amz-quad-mini-img-wrap">
                      <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&q=80" alt="MacBook" />
                      <span className="amz-quad-mini-tag">M3 Max</span>
                    </div>
                    <span className="amz-quad-mini-label">Studio Laptops</span>
                  </Link>

                  <Link to="/shop?category=electronics" className="amz-quad-mini-item">
                    <div className="amz-quad-mini-img-wrap">
                      <img src="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&q=80" alt="Displays" />
                      <span className="amz-quad-mini-tag">4K Retina</span>
                    </div>
                    <span className="amz-quad-mini-label">Monitors & Displays</span>
                  </Link>

                  <Link to="/shop?category=electronics" className="amz-quad-mini-item">
                    <div className="amz-quad-mini-img-wrap">
                      <img src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&q=80" alt="Keyboards" />
                      <span className="amz-quad-mini-tag">RGB Switch</span>
                    </div>
                    <span className="amz-quad-mini-label">Keyboards & Mice</span>
                  </Link>

                  <Link to="/shop?category=electronics" className="amz-quad-mini-item">
                    <div className="amz-quad-mini-img-wrap">
                      <img src="https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=300&q=80" alt="Accessories" />
                      <span className="amz-quad-mini-tag">Thunderbolt</span>
                    </div>
                    <span className="amz-quad-mini-label">Hubs & Docks</span>
                  </Link>
                </div>
              </div>
              <Link to="/shop?category=electronics" className="amz-quad-link">
                View Computing Hub <ArrowRight size={14} />
              </Link>
            </div>

            {/* Box 4: AURA Assured Prime Privilege */}
            <div className="amz-quad-card">
              <div>
                <h3 className="amz-quad-title">AURA Assured Prime Drops</h3>
                <div className="amz-quad-items-grid">
                  <Link to="/shop?sort=rating,desc" className="amz-quad-mini-item">
                    <div className="amz-quad-mini-img-wrap">
                      <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80" alt="Timepieces" />
                      <span className="amz-quad-mini-tag">Luxury</span>
                    </div>
                    <span className="amz-quad-mini-label">Smart Watches</span>
                  </Link>

                  <Link to="/shop?category=home" className="amz-quad-mini-item">
                    <div className="amz-quad-mini-img-wrap">
                      <img src="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&q=80" alt="Lamps" />
                      <span className="amz-quad-mini-tag">Ambient</span>
                    </div>
                    <span className="amz-quad-mini-label">Designer Lighting</span>
                  </Link>

                  <Link to="/shop" className="amz-quad-mini-item">
                    <div className="amz-quad-mini-img-wrap">
                      <img src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&q=80" alt="Cases" />
                      <span className="amz-quad-mini-tag">Leather</span>
                    </div>
                    <span className="amz-quad-mini-label">Bespoke Cases</span>
                  </Link>

                  <Link to="/shop?sort=price,asc" className="amz-quad-mini-item">
                    <div className="amz-quad-mini-img-wrap">
                      <img src="https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=300&q=80" alt="Chargers" />
                      <span className="amz-quad-mini-tag">GaN Fast</span>
                    </div>
                    <span className="amz-quad-mini-label">Fast Chargers</span>
                  </Link>
                </div>
              </div>
              <Link to="/shop" className="amz-quad-link">
                Shop Assured Collection <ArrowRight size={14} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Flipkart & Amazon Horizontal Deals Carousel: TODAY'S LIGHTNING DEALS with Live Countdown */}
      <section className="amz-carousel-section">
        <div className="container" style={{ maxWidth: '1440px', padding: '0 1.5rem' }}>
          
          <div className="amz-carousel-header">
            <div className="amz-carousel-title-group">
              <h2 className="amz-carousel-heading">
                ⚡ Today's Lightning Deals
              </h2>
              <div className="amz-timer-badge">
                <Clock size={15} />
                <span>Ends in</span>
                <span className="amz-timer-clock">
                  {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/shop?sort=discount,desc" style={{ color: '#4f46e5', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
                See all deals →
              </Link>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button onClick={() => scrollLeft(dealsScrollRef)} className="btn-h-nav-arrow" title="Previous Deals">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => scrollRight(dealsScrollRef)} className="btn-h-nav-arrow" title="Next Deals">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Horizontal Track of Products in High-Density Grid Cards */}
          <div 
            ref={dealsScrollRef}
            style={{
              display: 'flex',
              gap: '1.25rem',
              overflowX: 'auto',
              paddingBottom: '0.85rem',
              scrollbarWidth: 'none',
              scrollSnapType: 'x mandatory'
            }}
          >
            {lightningDeals.map((prod) => (
              <div key={prod.id} style={{ minWidth: '240px', maxWidth: '260px', flexShrink: 0, scrollSnapAlign: 'start' }}>
                <ProductCard product={prod} viewMode="grid" />
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. Best of Electronics & Computers (Horizontal Carousel) */}
      <section className="amz-carousel-section" style={{ background: '#f8fafc' }}>
        <div className="container" style={{ maxWidth: '1440px', padding: '0 1.5rem' }}>
          
          <div className="amz-carousel-header">
            <div className="amz-carousel-title-group">
              <h2 className="amz-carousel-heading">
                💻 Best of Electronics & Precision Computing
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Extra ₹1,500 off on select bank credit cards
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/shop?category=electronics" style={{ color: '#4f46e5', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
                Explore Electronics ({electronicsProducts.length || products.length}) →
              </Link>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button onClick={() => scrollLeft(electronicsScrollRef)} className="btn-h-nav-arrow" title="Previous">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => scrollRight(electronicsScrollRef)} className="btn-h-nav-arrow" title="Next">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <div 
            ref={electronicsScrollRef}
            style={{
              display: 'flex',
              gap: '1.25rem',
              overflowX: 'auto',
              paddingBottom: '0.85rem',
              scrollbarWidth: 'none',
              scrollSnapType: 'x mandatory'
            }}
          >
            {(electronicsProducts.length > 0 ? electronicsProducts : products).map((prod) => (
              <div key={prod.id} style={{ minWidth: '240px', maxWidth: '260px', flexShrink: 0, scrollSnapAlign: 'start' }}>
                <ProductCard product={prod} viewMode="grid" />
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. Hi-Fi Sound & Acoustics Collection */}
      <section className="amz-carousel-section">
        <div className="container" style={{ maxWidth: '1440px', padding: '0 1.5rem' }}>
          
          <div className="amz-carousel-header">
            <div className="amz-carousel-title-group">
              <h2 className="amz-carousel-heading">
                🎧 Top Rated in Hi-Fi Audio & Soundstage
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 700 }}>
                ⚡ Free Express Delivery on All Audio
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/shop?category=audio" style={{ color: '#4f46e5', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
                Explore All Audio →
              </Link>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button onClick={() => scrollLeft(audioScrollRef)} className="btn-h-nav-arrow" title="Previous">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => scrollRight(audioScrollRef)} className="btn-h-nav-arrow" title="Next">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <div 
            ref={audioScrollRef}
            style={{
              display: 'flex',
              gap: '1.25rem',
              overflowX: 'auto',
              paddingBottom: '0.85rem',
              scrollbarWidth: 'none',
              scrollSnapType: 'x mandatory'
            }}
          >
            {(audioProducts.length > 0 ? audioProducts : products).map((prod) => (
              <div key={prod.id} style={{ minWidth: '240px', maxWidth: '260px', flexShrink: 0, scrollSnapAlign: 'start' }}>
                <ProductCard product={prod} viewMode="grid" />
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. Flipkart-Style Trust Strip */}
      <div className="container" style={{ maxWidth: '1440px', padding: '2rem 1.5rem 0' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>100% Genuine Products</h4>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Direct from verified authorized brands</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RefreshCw size={24} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>Easy 7-Day Returns</h4>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Doorstep pickup & immediate refund</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={24} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>Free & Fast Delivery</h4>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>On all orders above ₹499 across India</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={24} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>24/7 Dedicated Support</h4>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Direct line concierge & setup guidance</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
