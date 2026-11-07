import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Bot, X, Send, RotateCcw, ShoppingBag, 
  ArrowRight, Star, Check, ChevronDown, 
  MessageSquare, Compass, ShieldCheck, Zap
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { getConciergeResponse } from '../services/conciergeService';
import { formatINRCompact } from '../utils/currency';

const STARTER_PROMPTS = [
  { label: '🔍 iPhone 16 Pro Max', query: 'Apple iPhone 16 Pro Max' },
  { label: '🎧 Sony WH-1000XM5', query: 'Sony WH-1000XM5' },
  { label: '📱 OnePlus 12 5G', query: 'OnePlus 12 5G' },
  { label: '🎁 Luxury gift under ₹15,000', query: 'Find me a luxury gift under ₹15,000 for a tech enthusiast.' },
  { label: '🛡️ Shipping & Warranty info', query: 'What is your delivery speed, warranty, and return policy?' },
];

const INITIAL_MESSAGE = {
  id: 'welcome',
  sender: 'concierge',
  text: `Greetings. I am **AURA AI**, your personal shopping assistant.

Search any product name (e.g., *iPhone 15*, *Sony WH-1000XM5*, *OnePlus 12*, *AirPods Pro*) or tell me your budget and preferences, and I will find the exact matches for you.`,
  products: [],
  followUps: [
    'iPhone 16 Pro Max',
    'Sony WH-1000XM5',
    'OnePlus 12',
    'Luxury gift under ₹15,000'
  ],
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

export default function AuraConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState(new Set());
  const [showGreetingTooltip, setShowGreetingTooltip] = useState(true);

  const { addToCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setShowGreetingTooltip(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, messages, isTyping]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || inputVal).trim();
    if (!query || isTyping) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    try {
      const response = await getConciergeResponse(query, messages);
      
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'concierge',
        text: response.reply,
        products: response.products || [],
        followUps: response.followUps || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Concierge error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'concierge',
          text: `I apologize for the momentary interruption. Our catalog query service is momentarily busy. Please try asking again or explore our catalog directly.`,
          products: [],
          followUps: ['Show Best Sellers', 'Find gifts under ₹15,000'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAddToCart = async (product, e) => {
    e.stopPropagation();
    try {
      await addToCart(product.id, 1);
      setAddedItemIds((prev) => new Set([...prev, product.id]));
      toast.success(`Added ${product.name.slice(0, 28)}... to your bag!`);
      
      setTimeout(() => {
        setAddedItemIds((prev) => {
          const next = new Set(prev);
          next.delete(product.id);
          return next;
        });
      }, 3000);
    } catch (err) {
      toast.error('Could not add to cart. Please try again.');
    }
  };

  const handleProductNavigate = (productId) => {
    setIsOpen(false);
    navigate(`/products/${productId}`);
  };

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
    toast.info('Concierge session refreshed');
  };

  // Basic markdown bold formatter
  const renderFormattedText = (text) => {
    if (!text) return '';
    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
      // Bullet list
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      const cleanLine = isBullet ? line.trim().slice(2) : line;

      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={lIdx} style={{ marginLeft: '1rem', marginBottom: '0.25rem' }}>
            {renderedParts}
          </li>
        );
      }

      return (
        <p key={lIdx} style={{ marginBottom: lIdx === lines.length - 1 ? 0 : '0.45rem' }}>
          {renderedParts}
        </p>
      );
    });
  };

  return (
    <>
      {/* 1. Floating AI Assistant Trigger Button */}
      <div className="aura-concierge-trigger-wrap">
        {showGreetingTooltip && !isOpen && (
          <div className="aura-concierge-greeting-bubble">
            <div className="aura-concierge-greeting-content">
              <Sparkles size={14} className="aura-concierge-spark-icon" />
              <span>Need shopping or gift ideas? Ask <strong>Aura AI</strong></span>
            </div>
            <button 
              type="button" 
              onClick={() => setShowGreetingTooltip(false)}
              className="aura-concierge-greeting-close"
              aria-label="Dismiss greeting"
            >
              <X size={12} />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`aura-concierge-fab-btn ${isOpen ? 'is-active' : ''}`}
          title="Open AURA Concierge AI Shopping Stylist"
          aria-label="Toggle AURA Concierge AI"
          id="aura-concierge-fab-btn"
        >
          <div className="aura-concierge-fab-halo" />
          <div className="aura-concierge-fab-inner">
            {isOpen ? (
              <X size={24} color="#ffffff" />
            ) : (
              <>
                <Sparkles size={22} className="aura-fab-spark-icon" />
                <span className="aura-fab-label">Aura AI</span>
                <span className="aura-fab-pulse-dot" />
              </>
            )}
          </div>
        </button>
      </div>

      {/* 2. Floating Luxury Chat Window Modal */}
      {isOpen && (
        <div className="aura-concierge-window" role="dialog" aria-label="AURA Concierge Chat">
          {/* Header */}
          <div className="aura-concierge-header">
            <div className="aura-concierge-header-left">
              <div className="aura-concierge-avatar">
                <Bot size={20} color="#ffffff" />
                <span className="aura-concierge-status-dot" />
              </div>
              <div className="aura-concierge-title-block">
                <div className="aura-concierge-title-row">
                  <span className="aura-concierge-name">AURA Concierge</span>
                  <span className="aura-concierge-ai-badge">AI Stylist</span>
                </div>
                <div className="aura-concierge-sub">Connected to Live Catalog</div>
              </div>
            </div>

            <div className="aura-concierge-header-actions">
              <button
                type="button"
                onClick={handleResetChat}
                className="aura-concierge-header-btn"
                title="Restart conversation"
                aria-label="Restart chat"
              >
                <RotateCcw size={16} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="aura-concierge-header-btn"
                title="Minimize Concierge"
                aria-label="Minimize"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Starter Suggestions Bar (if first message) */}
          {messages.length === 1 && (
            <div className="aura-concierge-quick-prompts-bar">
              <div className="aura-concierge-quick-label">
                <Sparkles size={12} color="#4f46e5" /> Try asking:
              </div>
              <div className="aura-concierge-quick-chips-track">
                {STARTER_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSend(prompt.query)}
                    className="aura-concierge-prompt-chip"
                  >
                    {prompt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Stream */}
          <div className="aura-concierge-messages-body">
            {messages.map((msg) => (
              <div key={msg.id} className={`aura-concierge-msg-row ${msg.sender}`}>
                {msg.sender === 'concierge' && (
                  <div className="aura-msg-bot-avatar">
                    <Sparkles size={14} color="#ffffff" />
                  </div>
                )}

                <div className="aura-msg-bubble-wrap">
                  <div className="aura-msg-bubble">
                    <div className="aura-msg-text">
                      {renderFormattedText(msg.text)}
                    </div>

                    {/* Interactive Product Cards Grid */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="aura-msg-products-grid">
                        {msg.products.map((p) => {
                          const isAdded = addedItemIds.has(p.id);
                          const comp = p.comparePrice || (p.featured ? p.price * 1.25 : p.price * 1.15);
                          const discountPct = Math.round((1 - p.price / comp) * 100);

                          return (
                            <div 
                              key={p.id} 
                              className="aura-concierge-product-card"
                              onClick={() => handleProductNavigate(p.id)}
                            >
                              <div className="aura-card-img-wrap">
                                <img
                                  src={p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'}
                                  alt={p.name}
                                  loading="lazy"
                                />
                                {discountPct > 0 && (
                                  <span className="aura-card-discount-badge">{discountPct}% OFF</span>
                                )}
                              </div>

                              <div className="aura-card-details">
                                <div className="aura-card-cat">{p.category?.name || 'Exclusive Luxury'}</div>
                                <div className="aura-card-name" title={p.name}>{p.name}</div>
                                
                                <div className="aura-card-rating">
                                  <Star size={11} fill="#f59e0b" color="#f59e0b" />
                                  <span>{p.rating || 4.8}</span>
                                  <span className="aura-card-reviews">({p.reviewsCount || 120})</span>
                                </div>

                                <div className="aura-card-pricing-row">
                                  <span className="aura-card-price">{formatINRCompact(p.price)}</span>
                                  {comp > p.price && (
                                    <span className="aura-card-compare">{formatINRCompact(comp)}</span>
                                  )}
                                </div>

                                <div className="aura-card-actions">
                                  <button
                                    type="button"
                                    onClick={(e) => handleAddToCart(p, e)}
                                    className={`aura-card-add-btn ${isAdded ? 'is-added' : ''}`}
                                    title="Add to shopping cart"
                                  >
                                    {isAdded ? (
                                      <>
                                        <Check size={13} />
                                        <span>Added</span>
                                      </>
                                    ) : (
                                      <>
                                        <ShoppingBag size={13} />
                                        <span>Add to Bag</span>
                                      </>
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleProductNavigate(p.id);
                                    }}
                                    className="aura-card-view-btn"
                                    title="View product details"
                                  >
                                    Details
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="aura-msg-time">{msg.timestamp}</div>
                  </div>

                  {/* Follow-up Suggestion Chips */}
                  {msg.followUps && msg.followUps.length > 0 && (
                    <div className="aura-msg-followups">
                      {msg.followUps.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSend(chip)}
                          className="aura-followup-pill"
                        >
                          <span>{chip}</span>
                          <ArrowRight size={11} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="aura-concierge-msg-row concierge">
                <div className="aura-msg-bot-avatar">
                  <Sparkles size={14} color="#ffffff" />
                </div>
                <div className="aura-msg-bubble aura-typing-bubble">
                  <div className="aura-typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="aura-typing-text">AURA is exploring the catalog...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="aura-concierge-footer">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="aura-concierge-input-form"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Search product name (e.g., 'iPhone 15', 'Sony WH-1000XM5')..."
                className="aura-concierge-input"
                disabled={isTyping}
              />

              <button
                type="submit"
                disabled={!inputVal.trim() || isTyping}
                className="aura-concierge-send-btn"
                title="Send message"
                aria-label="Send"
              >
                <Send size={16} />
              </button>
            </form>

            <div className="aura-concierge-footer-tag">
              <Zap size={10} color="#4f46e5" />
              <span>AURA Intelligence • Live Catalog Integration</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
