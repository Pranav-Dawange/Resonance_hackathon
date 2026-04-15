// ============================================
// DermaAI SkinVision — IGA Score Card
// Animated circular gauge displaying IGA 0-4
// ============================================

import { motion } from 'framer-motion';
import { IGA_SCALE } from '../../utils/constants';

export default function IGAScoreCard({ score = 0, rawScore = 0, confidence = 0, keyIndicators = [] }) {
  const igaData = IGA_SCALE[score] || IGA_SCALE[0];
  const circumference = 2 * Math.PI * 44;
  const fillPercent = (score / 4) * 100;
  const dashOffset = circumference - (fillPercent / 100) * circumference;

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="section-label mb-4">IGA Clinical Score</div>

      <div className="flex items-center gap-6">
        {/* Circular gauge */}
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50" cy="50" r="44"
              fill="none"
              stroke="rgba(71, 85, 105, 0.3)"
              strokeWidth="6"
            />
            {/* Score ring */}
            <motion.circle
              cx="50" cy="50" r="44"
              fill="none"
              stroke={igaData.color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
              style={{
                filter: `drop-shadow(0 0 6px ${igaData.color}66)`,
              }}
            />
          </svg>
          {/* Center score */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-3xl font-bold"
              style={{ color: igaData.color }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8, type: 'spring' }}
            >
              {score}
            </motion.span>
            <span className="text-[9px] text-slate-500 font-medium">/4</span>
          </div>
        </div>

        {/* Score details */}
        <div className="flex-1">
          <motion.h3
            className="text-xl font-bold text-white mb-1"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            {igaData.label}
          </motion.h3>
          <motion.p
            className="text-xs text-slate-400 leading-relaxed mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {igaData.description}
          </motion.p>

          {/* Grade scale bar */}
          <div className="flex gap-1">
            {IGA_SCALE.map((iga) => (
              <motion.div
                key={iga.grade}
                className="flex-1 h-1.5 rounded-full"
                style={{
                  backgroundColor: iga.grade <= score ? iga.color : 'rgba(71, 85, 105, 0.3)',
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3 + iga.grade * 0.1 }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[8px] text-slate-600">Clear</span>
            <span className="text-[8px] text-slate-600">Severe</span>
          </div>
        </div>
      </div>

      {/* Raw computation note */}
      <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[9px] text-slate-600 font-mono">
            Raw severity index: {rawScore.toFixed(3)} &bull; Algorithm: log₂(1 + I×2.5 + C×1.0)
          </p>
          {confidence > 0 && (
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-medical-blue-500/10 text-medical-blue-300">
              {confidence}% confidence
            </span>
          )}
        </div>
        {keyIndicators.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {keyIndicators.map((indicator, i) => (
              <span
                key={i}
                className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-slate-400"
              >
                {indicator}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
