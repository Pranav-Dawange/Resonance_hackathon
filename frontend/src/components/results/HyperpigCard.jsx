// ============================================
// DermaAI SkinVision — Hyperpigmentation Card
// CIE LAB analysis results display
// ============================================

import { motion } from 'framer-motion';

export default function HyperpigCard({ coverage = 0, coverageRange = '0–10%', severity = 'minimal' }) {
  const severityColors = {
    minimal: { bar: '#22C55E', bg: 'rgba(34, 197, 94, 0.1)', text: 'text-emerald-400' },
    mild: { bar: '#FBBF24', bg: 'rgba(251, 191, 36, 0.1)', text: 'text-amber-400' },
    moderate: { bar: '#F97316', bg: 'rgba(249, 115, 22, 0.1)', text: 'text-orange-400' },
    severe: { bar: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', text: 'text-red-400' },
  };

  const s = severityColors[severity] || severityColors.minimal;
  const maxCoverage = 30;
  const fillPct = Math.min(100, (coverage / maxCoverage) * 100);

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="section-label mb-4">Hyperpigmentation Analysis</div>

      <div className="flex items-start gap-4">
        {/* Coverage percentage */}
        <div className="text-center">
          <motion.div
            className="text-4xl font-bold text-white"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            {coverage}
            <span className="text-lg text-slate-500">%</span>
          </motion.div>
          <p className="text-[10px] text-slate-500 mt-1">Coverage</p>
          <p className="text-[9px] font-mono text-slate-600 mt-0.5">{coverageRange}</p>
        </div>

        <div className="flex-1">
          {/* Severity badge */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className="px-2.5 py-1 rounded-lg text-xs font-semibold capitalize"
              style={{ backgroundColor: s.bg, color: s.bar }}
            >
              {severity}
            </div>
          </div>

          {/* Coverage bar */}
          <div className="mb-3">
            <div className="h-2.5 bg-slate-700/40 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: s.bar }}
                initial={{ width: 0 }}
                animate={{ width: `${fillPct}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[8px] text-slate-600">0%</span>
              <span className="text-[8px] text-slate-600">30%+</span>
            </div>
          </div>

          {/* Method note */}
          <div className="p-2 rounded-lg bg-medical-blue-500/5 border border-medical-blue-500/10">
            <p className="text-[9px] text-slate-500 leading-relaxed">
              <span className="text-medical-blue-400 font-semibold">CIE L*a*b*</span> color space analysis — stable across Fitzpatrick skin types I–VI. L* channel isolates lightness independently from chrominance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
