import { useEffect, useState } from 'react';

const RiskIndicator = ({ riskScore, label, confidence }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Show confidence percentage (how sure the model is), not risk score
  const displayPercent = Math.round((confidence || 0) * 100);

  useEffect(() => {
    let start = 0;
    const end = displayPercent;
    if (end === 0) { setAnimatedScore(0); return; }
    const duration = 800;
    const stepTime = Math.max(duration / end, 10);

    const timer = setInterval(() => {
      start += 1;
      setAnimatedScore(start);
      if (start >= end) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, [displayPercent]);

  const getColor = () => {
    if (label === 'JAILBREAK') return { ring: '#ff0040', text: 'text-red-400', glow: 'animate-pulse-red' };
    if (label === 'PROMPT_INJECTION') return { ring: '#ffaa00', text: 'text-yellow-400', glow: 'animate-pulse-yellow' };
    return { ring: '#00ff88', text: 'text-green-400', glow: 'animate-pulse-green' };
  };

  const colors = getColor();
  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      {/* Circular Gauge */}
      <div className={`relative w-16 h-16 ${colors.glow} rounded-full`}>
        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" stroke="#1e293b" strokeWidth="4" fill="transparent" />
          <circle
            cx="32" cy="32" r="28"
            stroke={colors.ring}
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-sm font-bold ${colors.text}`}>{animatedScore}%</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-bold ${colors.text} uppercase tracking-wider`}>{label}</span>
        </div>
        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${animatedScore}%`, backgroundColor: colors.ring }}
          />
        </div>
        <span className="text-[10px] text-gray-500 mt-1 block">Confidence Level</span>
      </div>
    </div>
  );
};

export default RiskIndicator;