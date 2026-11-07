import { useState, useEffect } from 'react';
import { 
  CheckCircle2, Clock, Truck, Package, ShieldCheck, MapPin, 
  Phone, Copy, Check, Navigation, AlertCircle, Play, RotateCcw, 
  ExternalLink, Sparkles
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const DEFAULT_STAGES = [
  {
    id: 'CONFIRMED',
    title: 'Order Confirmed',
    subtitle: 'Payment verified & reservation token generated',
    detail: 'Order payment successfully authorized via Razorpay. Allocated in Central Inventory.',
    timeOffset: 'Just now',
    icon: CheckCircle2,
    color: '#10b981',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0'
  },
  {
    id: 'PROCESSING',
    title: 'Atelier Processing & Quality Seal',
    subtitle: 'Acoustic & cosmetic audit completed',
    detail: 'Serial number verified. Packaged in AURA tamper-evident magnetic luxury case.',
    timeOffset: '+2 hours',
    icon: Package,
    color: '#6366f1',
    bgColor: '#eef2ff',
    borderColor: '#c7d2fe'
  },
  {
    id: 'SHIPPED',
    title: 'Dispatched with BlueDart Express',
    subtitle: 'Airway bill generated • In transit via Air Express',
    detail: 'Departed from Bengaluru Tech Hub Airport Cargo Terminal. En route to regional distribution center.',
    timeOffset: '+6 hours',
    icon: Truck,
    color: '#0284c7',
    bgColor: '#f0f9ff',
    borderColor: '#bae6fd'
  },
  {
    id: 'OUT_FOR_DELIVERY',
    title: 'Out for Delivery',
    subtitle: 'Courier partner is approaching your destination',
    detail: 'Executive assigned. Delivery van en route. Please keep your 4-digit Delivery PIN ready.',
    timeOffset: 'Today',
    icon: Navigation,
    color: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#fde68a'
  },
  {
    id: 'DELIVERED',
    title: 'Delivered & Signature Secured',
    subtitle: 'Handed directly to client at doorstep',
    detail: 'Package safely delivered and verified via contactless OTP verification. Warranty activated.',
    timeOffset: 'Completed',
    icon: ShieldCheck,
    color: '#059669',
    bgColor: '#ecfdf5',
    borderColor: '#6ee7b7'
  }
];

function getStageIndex(status) {
  const s = (status || 'PENDING').toUpperCase();
  if (s === 'DELIVERED' || s === 'COMPLETED') return 4;
  if (s === 'OUT_FOR_DELIVERY') return 3;
  if (s === 'SHIPPED') return 2;
  if (s === 'PROCESSING') return 1;
  return 0; // PENDING or CONFIRMED
}

export default function OrderTrackingTimeline({ order, interactive = true }) {
  const toast = useToast();
  const initialIndex = getStageIndex(order?.status);
  const [activeStep, setActiveStep] = useState(initialIndex);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);

  useEffect(() => {
    setActiveStep(getStageIndex(order?.status));
  }, [order?.status]);

  // Derived tracking metadata
  const orderNumClean = (order?.orderNumber || 'AURA-84920').replace(/[^a-zA-Z0-9]/g, '');
  const trackingNumber = `BLR-${orderNumClean.slice(-6)}-IN`;
  const deliveryOtp = order?.id ? String(1000 + (order.id * 17) % 9000) : '8492';
  
  const estimatedDelivery = (() => {
    const d = order?.createdAt ? new Date(order.createdAt) : new Date();
    d.setDate(d.getDate() + 2);
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  })();

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopiedTracking(true);
    toast.success('BlueDart tracking AWB copied to clipboard');
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const handleReplaySimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setActiveStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step <= 4) {
        setActiveStep(step);
      } else {
        clearInterval(interval);
        setIsSimulating(false);
        toast.success('Transit simulation completed! 🎉');
      }
    }, 1200);
  };

  const currentStage = DEFAULT_STAGES[activeStep];
  const progressPercent = (activeStep / (DEFAULT_STAGES.length - 1)) * 100;

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '20px',
      border: '1px solid #e2e8f0',
      padding: '1.75rem',
      boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top Banner: Courier & Live Badge */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid #f1f5f9'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
          }}>
            <Truck size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                BlueDart Luxury Air Express
              </span>
              <span style={{
                background: activeStep === 4 ? '#ecfdf5' : '#f0f9ff',
                color: activeStep === 4 ? '#059669' : '#0284c7',
                border: activeStep === 4 ? '1px solid #a7f3d0' : '1px solid #bae6fd',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: activeStep === 4 ? '#059669' : '#0284c7',
                  animation: activeStep === 4 ? 'none' : 'pulse 1.5s infinite'
                }} />
                {activeStep === 4 ? 'DELIVERED' : 'IN LIVE TRANSIT'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem', fontSize: '0.82rem', color: '#64748b' }}>
              <span>AWB: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{trackingNumber}</strong></span>
              <button
                type="button"
                onClick={handleCopyTracking}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4f46e5',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px',
                  fontSize: '0.78rem',
                  fontWeight: 600
                }}
              >
                {copiedTracking ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                <span>{copiedTracking ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Info: ETA & OTP */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Est. Arrival
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
              {activeStep === 4 ? 'Delivered safely' : `${estimatedDelivery}, by 2:00 PM`}
            </div>
          </div>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '0.4rem 0.75rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Secure Delivery PIN
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', letterSpacing: '0.12em', fontFamily: 'monospace' }}>
              {deliveryOtp}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar with Moving Van Indicator */}
      <div style={{ position: 'relative', margin: '2rem 1rem 3rem' }}>
        {/* Background Track */}
        <div style={{
          height: '6px',
          background: '#f1f5f9',
          borderRadius: '9999px',
          overflow: 'hidden'
        }}>
          {/* Active Fill with gradient */}
          <div style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: 'linear-gradient(90deg, #4f46e5 0%, #06b6d4 50%, #10b981 100%)',
            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: '9999px'
          }} />
        </div>

        {/* Moving Vehicle Pulse */}
        <div style={{
          position: 'absolute',
          top: '-15px',
          left: `calc(${progressPercent}% - 18px)`,
          transition: 'left 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: 'none'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#0f172a',
            color: '#38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25), 0 0 0 4px rgba(56, 189, 248, 0.25)'
          }}>
            <Truck size={17} />
          </div>
        </div>
      </div>

      {/* Milestone Steps Stepper */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '0.5rem',
        marginBottom: '2rem'
      }}>
        {DEFAULT_STAGES.map((st, idx) => {
          const isCompleted = idx < activeStep;
          const isCurrent = idx === activeStep;
          const isPending = idx > activeStep;
          const Icon = st.icon;

          return (
            <div
              key={st.id}
              onClick={() => interactive && setActiveStep(idx)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: interactive ? 'pointer' : 'default',
                opacity: isPending ? 0.45 : 1,
                transition: 'all 0.25s ease'
              }}
              title={interactive ? `Click to preview ${st.title} stage` : st.title}
            >
              {/* Milestone Icon Node */}
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: isCurrent ? st.color : isCompleted ? '#0f172a' : '#f8fafc',
                color: isCurrent || isCompleted ? '#ffffff' : '#94a3b8',
                border: isCurrent 
                  ? `3px solid ${st.borderColor}` 
                  : isCompleted 
                    ? '2px solid #0f172a' 
                    : '2px solid #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.65rem',
                boxShadow: isCurrent ? `0 0 0 5px ${st.bgColor}` : 'none',
                transition: 'all 0.3s ease'
              }}>
                {isCompleted ? (
                  <Check size={18} strokeWidth={3} />
                ) : (
                  <Icon size={18} />
                )}
              </div>

              {/* Title */}
              <div style={{
                fontSize: '0.82rem',
                fontWeight: isCurrent ? 800 : 700,
                color: isCurrent ? st.color : isCompleted ? '#0f172a' : '#64748b',
                lineHeight: 1.25,
                marginBottom: '0.2rem'
              }}>
                {st.title}
              </div>

              {/* Timestamp Offset */}
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                {st.timeOffset}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Stage Detail Highlight Card */}
      <div style={{
        background: currentStage.bgColor,
        border: `1.5px solid ${currentStage.borderColor}`,
        borderRadius: '14px',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flex: 1 }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: currentStage.color,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <currentStage.icon size={19} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                {currentStage.title}
              </h4>
              <span style={{ fontSize: '0.72rem', color: currentStage.color, fontWeight: 700 }}>
                • Current Active Milestone
              </span>
            </div>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.84rem', color: '#334155', lineHeight: 1.5 }}>
              {currentStage.detail}
            </p>
          </div>
        </div>

        {/* Courier Driver & Support info if shipped/out for delivery */}
        {activeStep >= 2 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '0.55rem 0.85rem'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.82rem'
            }}>
              RK
            </div>
            <div style={{ fontSize: '0.78rem' }}>
              <div style={{ fontWeight: 800, color: '#0f172a' }}>Rajesh Kumar</div>
              <div style={{ color: '#059669', fontWeight: 600 }}>BlueDart Lead Courier</div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Simulation Controls */}
      {interactive && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid #f1f5f9',
          fontSize: '0.8rem',
          color: '#64748b'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={14} color="#6366f1" />
            <span>Interactive Live Simulation: Click any stage above to preview</span>
          </span>

          <button
            type="button"
            onClick={handleReplaySimulation}
            disabled={isSimulating}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              borderRadius: '8px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: isSimulating ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease'
            }}
          >
            {isSimulating ? <RotateCcw size={13} className="spin" /> : <Play size={13} />}
            <span>{isSimulating ? 'Simulating Transit...' : '▶ Replay Journey'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
