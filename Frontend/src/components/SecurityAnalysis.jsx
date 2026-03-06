import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  { name: 'Input Validation', icon: '📝', desc: 'Validating prompt structure' },
  { name: 'Pattern Scanning', icon: '🔍', desc: 'Scanning for known attack patterns' },
  { name: 'AI Classification', icon: '🧠', desc: 'DistilBERT deep analysis' },
  { name: 'Risk Assessment', icon: '⚡', desc: 'Computing threat level' },
  { name: 'Decision Engine', icon: '🛡️', desc: 'Rendering final verdict' },
];

const SecurityAnalysis = ({ isAnalyzing, result, onComplete }) => {
  const [phase, setPhase] = useState('scanning'); // scanning | result
  const [activeStep, setActiveStep] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const resultShownRef = useRef(false);

  // Reset when analysis starts
  useEffect(() => {
    if (isAnalyzing) {
      setPhase('scanning');
      setActiveStep(0);
      setScanProgress(0);
      resultShownRef.current = false;
    }
  }, [isAnalyzing]);

  // Animate scan progress smoothly
  useEffect(() => {
    if (!isAnalyzing || phase !== 'scanning') return;

    const hasResult = !!result;
    let frame;
    let start = null;
    // If result already arrived, rush to 100% in 400ms.  Otherwise creep to 85% over 3s.
    const targetProgress = hasResult ? 100 : 85;
    const duration = hasResult ? 400 : 3000;
    const startProgress = scanProgress;

    const animate = (ts) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const t = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = startProgress + (targetProgress - startProgress) * eased;
      setScanProgress(current);
      setActiveStep(Math.min(Math.floor((current / 100) * steps.length), steps.length - 1));

      if (t < 1) {
        frame = requestAnimationFrame(animate);
      } else if (hasResult && !resultShownRef.current) {
        resultShownRef.current = true;
        // Show result with enough time to read the verdict
        setPhase('result');
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 2500);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isAnalyzing, result, phase]);

  // When result arrives during scanning, the effect above reruns and rushes progress
  useEffect(() => {
    if (result && phase === 'scanning' && scanProgress >= 85) {
      // Already past 85%, rush to finish
      setScanProgress(100);
      resultShownRef.current = true;
      setTimeout(() => {
        setPhase('result');
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 2500);
      }, 300);
    }
  }, [result]);

  if (!isAnalyzing && phase !== 'result') return null;

  const getAccentColor = () => {
    if (!result) return { text: 'text-cyan-400', bg: 'bg-cyan-500', border: 'border-cyan-500/40', glow: 'shadow-cyan-500/20' };
    switch (result.action) {
      case 'ALLOWED': return { text: 'text-green-400', bg: 'bg-green-500', border: 'border-green-500/40', glow: 'shadow-green-500/20' };
      case 'SANITIZED': return { text: 'text-yellow-400', bg: 'bg-yellow-500', border: 'border-yellow-500/40', glow: 'shadow-yellow-500/20' };
      case 'BLOCKED': return { text: 'text-red-400', bg: 'bg-red-500', border: 'border-red-500/40', glow: 'shadow-red-500/20' };
      default: return { text: 'text-cyan-400', bg: 'bg-cyan-500', border: 'border-cyan-500/40', glow: 'shadow-cyan-500/20' };
    }
  };

  const accent = getAccentColor();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-2xl mx-auto my-3"
    >
      <div className={`relative bg-gray-900/90 backdrop-blur-2xl rounded-2xl border ${phase === 'result' ? accent.border : 'border-gray-700/40'} overflow-hidden shadow-2xl ${phase === 'result' ? accent.glow : 'shadow-black/20'} transition-all duration-700`}>

        {/* Scanning glow line at top */}
        {phase === 'scanning' && (
          <motion.div
            className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            animate={{ left: ['-30%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            style={{ width: '30%' }}
          />
        )}

        {/* Header */}
        <div className="px-5 py-3.5 flex items-center gap-3">
          <motion.div
            animate={phase === 'scanning' ? { rotate: [0, 360] } : { rotate: 0, scale: [1, 1.15, 1] }}
            transition={phase === 'scanning'
              ? { duration: 3, repeat: Infinity, ease: 'linear' }
              : { duration: 0.5 }
            }
            className="text-xl"
          >
            🛡️
          </motion.div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-sm">
              {phase === 'result' ? 'Analysis Complete' : 'Security Analysis'}
            </h3>
            <p className="text-gray-500 text-xs truncate">
              {phase === 'result'
                ? `Verdict: ${result?.action}`
                : steps[activeStep]?.desc}
            </p>
          </div>
          {phase === 'scanning' && (
            <span className="text-cyan-400 text-xs font-mono tabular-nums">
              {Math.round(scanProgress)}%
            </span>
          )}
        </div>

        {/* Scan Progress Pipeline */}
        {phase === 'scanning' && (
          <div className="px-5 pb-4">
            {/* Progress bar */}
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mb-3">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"
                style={{ width: `${scanProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* Steps row */}
            <div className="flex items-center justify-between">
              {steps.map((step, i) => {
                const isActive = i === activeStep;
                const isDone = i < activeStep;
                const isPending = i > activeStep;

                return (
                  <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                    {/* Step circle */}
                    <motion.div
                      animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                      transition={isActive ? { duration: 1, repeat: Infinity } : {}}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-500 ${
                        isDone
                          ? 'bg-green-500/20 ring-1 ring-green-500/40'
                          : isActive
                          ? 'bg-cyan-500/20 ring-2 ring-cyan-400/60 shadow-lg shadow-cyan-500/20'
                          : 'bg-gray-800/60 ring-1 ring-gray-700/40'
                      }`}
                    >
                      {isDone ? (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.span>
                      ) : (
                        <span className={isPending ? 'opacity-30' : ''}>{step.icon}</span>
                      )}
                    </motion.div>
                    {/* Step name */}
                    <span className={`text-[9px] font-medium text-center leading-tight transition-colors duration-300 ${
                      isDone ? 'text-green-400/80' : isActive ? 'text-cyan-300' : 'text-gray-600'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Result */}
        <AnimatePresence>
          {phase === 'result' && result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="px-5 pb-4"
            >
              {/* Action badge */}
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="text-2xl"
                >
                  {result.action === 'ALLOWED' ? '✅' : result.action === 'SANITIZED' ? '⚠️' : '🚫'}
                </motion.div>
                <div>
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`text-lg font-black ${accent.text}`}
                  >
                    {result.action}
                  </motion.span>
                  <p className="text-gray-500 text-xs">
                    {result.label} • Confidence {Math.round(result.confidence * 100)}% • Risk {Math.round(result.riskScore * 100)}%
                  </p>
                </div>
              </div>

              {/* Compact stat bars */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-800/40 rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-500 text-[10px]">Confidence</span>
                    <span className="text-white font-bold text-xs">{Math.round(result.confidence * 100)}%</span>
                  </div>
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: `${Math.round(result.confidence * 100)}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                    />
                  </div>
                </div>
                <div className="bg-gray-800/40 rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-500 text-[10px]">Risk Score</span>
                    <span className="text-white font-bold text-xs">{Math.round(result.riskScore * 100)}%</span>
                  </div>
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        result.riskScore > 0.7
                          ? 'bg-gradient-to-r from-red-500 to-red-400'
                          : result.riskScore > 0.4
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-400'
                          : 'bg-gradient-to-r from-green-500 to-emerald-400'
                      }`}
                      initial={{ width: '0%' }}
                      animate={{ width: `${Math.max(Math.round(result.riskScore * 100), 3)}%` }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer message */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`text-xs mt-2.5 ${accent.text}`}
              >
                {result.action === 'ALLOWED'
                  ? '→ Forwarding safe prompt to LLM...'
                  : result.action === 'SANITIZED'
                  ? '→ Forwarding sanitized prompt to LLM...'
                  : '→ Prompt blocked. Not forwarded to LLM.'}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SecurityAnalysis;