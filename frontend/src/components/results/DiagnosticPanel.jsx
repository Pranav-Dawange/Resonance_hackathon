// ============================================
// DermaAI SkinVision — Diagnostic Panel
// Master results container with staggered animations
// ============================================

import { motion } from 'framer-motion';
import IGAScoreCard from './IGAScoreCard';
import LesionOverlay from './LesionOverlay';
import HyperpigCard from './HyperpigCard';
import SkincarePlan from './SkincarePlan';
import TechnicalAudit from './TechnicalAudit';

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function DiagnosticPanel({ analysisData }) {
  if (!analysisData) return null;

  const { image, results, timestamp, quality } = analysisData;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Diagnostic Report</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generated {timestamp ? new Date(timestamp).toLocaleString() : 'just now'}
            {results.processing_time_ms && (
              <span className="ml-2 text-medical-blue-400">
                • {results.processing_time_ms}ms
              </span>
            )}
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
            Analysis Complete
          </span>
        </div>
      </motion.div>

      {/* Top row: IGA + Hyperpigmentation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <IGAScoreCard
            score={results.acne_severity?.score || 0}
            rawScore={results.acne_severity?.raw_score || 0}
            confidence={results.acne_severity?.confidence || 0}
            keyIndicators={results.acne_severity?.key_indicators || []}
          />
        </motion.div>
        <motion.div variants={item}>
          <HyperpigCard
            coverage={results.hyperpigmentation?.coverage_pct || 0}
            coverageRange={results.hyperpigmentation?.coverage_range || '0–10%'}
            severity={results.hyperpigmentation?.severity || 'minimal'}
          />
        </motion.div>
      </div>

      {/* Lesion overlay */}
      <motion.div variants={item}>
        <LesionOverlay
          imageUrl={image}
          lesions={results.lesions || []}
          counts={results.lesion_counts}
        />
      </motion.div>

      {/* Skincare recommendations */}
      <motion.div variants={item}>
        <SkincarePlan recommendations={results.recommendations || []} />
      </motion.div>

      {/* Technical Audit Panel (Interpretability) */}
      <motion.div variants={item}>
        <TechnicalAudit analysisData={analysisData} />
      </motion.div>

      {/* Model info footer */}
      <motion.div variants={item} className="text-center pt-2">
        <p className="text-[9px] text-slate-600 font-mono">
          Model: YOLOv11n-skin • Color Space: CIE L*a*b* • Grading: IGA 0-4 (logarithmic) • Diversity: Fitzpatrick I-VI validated
        </p>
      </motion.div>
    </motion.div>
  );
}
