// ============================================
// DermaAI SkinVision — Quality Gate
// Real-time Luminance Meter + Blur detection
// "Reliability Gate" UI (Requirement #5)
// ============================================

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeQuality, getLuminanceColor } from '../../services/qualityAnalysis';
import { useToast } from '../ui/Toast';

export default function QualityGate({ videoRef, isActive }) {
  const [quality, setQuality] = useState(null);
  const [isDanger, setIsDanger] = useState(false);
  const lastToastRef = useRef(0);
  const toast = useToast();

  useEffect(() => {
    if (!isActive || !videoRef?.current) return;

    let intervalId;

    const checkQuality = () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      const result = analyzeQuality(video);
      setQuality(result);
      setIsDanger(result.status === 'danger');

      // Trigger toast warnings (throttled to 8s)
      const now = Date.now();
      if (result.status !== 'good' && now - lastToastRef.current > 8000) {
        lastToastRef.current = now;
        if (result.status === 'danger') {
          toast.danger(result.message, {
            title: '⚠️ Clinical Quality Warning',
            duration: 6000,
          });
        } else if (result.status === 'warning') {
          toast.warning(result.message, {
            title: 'Quality Advisory',
            duration: 4000,
          });
        }
      }
    };

    // Check every 500ms
    intervalId = setInterval(checkQuality, 500);
    // Initial check
    setTimeout(checkQuality, 1000);

    return () => clearInterval(intervalId);
  }, [isActive, videoRef, toast]);

  if (!quality) return null;

  const luminancePct = Math.round(quality.lightingScore * 100);
  const meterColor = getLuminanceColor(quality.lightingScore);

  return (
    <div className="w-full">
      {/* Danger overlay — red border pulse */}
      <AnimatePresence>
        {isDanger && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-20 rounded-2xl"
            style={{
              boxShadow: 'inset 0 0 60px rgba(239, 68, 68, 0.3)',
              border: '2px solid rgba(239, 68, 68, 0.5)',
            }}
          >
            <motion.div
              className="absolute inset-0 rounded-2xl"
              animate={{
                boxShadow: [
                  'inset 0 0 30px rgba(239, 68, 68, 0.2)',
                  'inset 0 0 60px rgba(239, 68, 68, 0.4)',
                  'inset 0 0 30px rgba(239, 68, 68, 0.2)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Luminance meter panel */}
      <div className={`glass-card p-3 rounded-xl transition-all duration-300 ${isDanger ? 'border-red-500/50 bg-red-500/10' : ''}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* Light icon */}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={meterColor} strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="section-label" style={{ color: meterColor }}>
              {isDanger ? 'INSUFFICIENT LIGHTING' : 'LUMINANCE'}
            </span>
          </div>
          <span className="text-xs font-mono" style={{ color: meterColor }}>
            {luminancePct}%
          </span>
        </div>

        {/* Luminance bar */}
        <div className="relative h-2 bg-slate-700/60 rounded-full overflow-hidden">
          {/* Gradient background */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(90deg, #EF4444 0%, #F59E0B 30%, #22C55E 60%, #22C55E 100%)',
              opacity: 0.2,
            }}
          />
          {/* Fill bar */}
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full"
            style={{ backgroundColor: meterColor }}
            initial={{ width: 0 }}
            animate={{ width: `${luminancePct}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
          {/* Threshold marker at 30% */}
          <div
            className="absolute top-0 h-full w-px bg-white/30"
            style={{ left: '30%' }}
          />
        </div>

        {/* Status message */}
        <AnimatePresence mode="wait">
          <motion.p
            key={quality.message}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={`text-[10px] mt-2 font-medium ${
              isDanger ? 'text-red-400' :
              quality.status === 'warning' ? 'text-amber-400' :
              'text-emerald-400'
            }`}
          >
            {isDanger && '🔴 '}
            {quality.message}
          </motion.p>
        </AnimatePresence>

        {/* Sharpness sub-indicator */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[9px] text-slate-500 uppercase tracking-wider">Focus</span>
          <div className="flex-1 h-1 bg-slate-700/40 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                backgroundColor: quality.isBlurry ? '#F59E0B' : '#22C55E',
              }}
              animate={{ width: `${Math.min(100, (quality.sharpness / 200) * 100)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-[9px] font-mono text-slate-500">
            {quality.isBlurry ? 'BLURRY' : 'SHARP'}
          </span>
        </div>
      </div>
    </div>
  );
}
