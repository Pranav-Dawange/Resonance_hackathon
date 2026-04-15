// ============================================
// DermaAI SkinVision — Skincare Recommendations
// RAG-lite AI Skincare Engine display
// ============================================

import { motion } from 'framer-motion';

export default function SkincarePlan({ recommendations = [] }) {
  const evidenceColors = {
    Essential: 'bg-medical-blue-500/20 text-medical-blue-400',
    Strong: 'bg-emerald-500/20 text-emerald-400',
    Moderate: 'bg-amber-500/20 text-amber-400',
    Limited: 'bg-slate-500/20 text-slate-400',
  };

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="section-label">AI Skincare Recommendations</div>
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-medical-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-[9px] text-medical-blue-400 font-medium">RAG-Lite Engine</span>
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, i) => (
          <motion.div
            key={`${rec.ingredient}-${i}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-medical-blue-500/20 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-white">{rec.ingredient}</h4>
                  {rec.concentration !== '-' && (
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-700/30 px-1.5 py-0.5 rounded">
                      {rec.concentration}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{rec.reason}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${evidenceColors[rec.evidence] || evidenceColors.Limited}`}>
                  {rec.evidence}
                </span>
                <span className="text-[9px] text-slate-600">{rec.frequency}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {recommendations.length === 0 && (
        <div className="text-center py-6 text-slate-500 text-sm">
          No recommendations generated yet. Run a scan first.
        </div>
      )}
    </div>
  );
}
