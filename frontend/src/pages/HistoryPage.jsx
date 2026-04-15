// ============================================
// DermaAI SkinVision — History Page
// Longitudinal Progress Tracking Dashboard
// "Healing Journey" — ComparisonSlider + ProgressChart
// ============================================

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, LoadingSpinner } from '../components/ui/Components';
import ComparisonSlider from '../components/history/ComparisonSlider';
import ProgressChart from '../components/history/ProgressChart';
import { IGA_SCALE } from '../utils/constants';
import { getDemoScans, getDemoChartData, DEMO_USER_ID } from '../services/mockDemoData';

export default function HistoryPage() {
  const [scans, setScans] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState(null);
  const [comparisonMode, setComparisonMode] = useState('longterm'); // 'shortterm' | 'longterm'

  useEffect(() => {
    async function loadHistory() {
      try {
        // Try Firebase first
        const { getScanHistory } = await import('../services/firebase');
        const data = await getScanHistory(20);
        if (data.length >= 3) {
          setScans(data);
        } else {
          // Fall back to demo data
          loadDemoData();
        }
      } catch {
        loadDemoData();
      }
      setLoading(false);
    }

    function loadDemoData() {
      const demoScans = getDemoScans();
      const demoChart = getDemoChartData();
      setScans(demoScans);
      setChartData(demoChart);
    }

    loadHistory();
  }, []);

  // Prepare comparison data
  const comparisonPair = useMemo(() => {
    if (scans.length < 2) return null;
    // Day 1 (oldest) = scanBefore, Day 30 (newest) = scanAfter for longterm
    // Day 1 vs Day 14 for shortterm
    if (comparisonMode === 'shortterm') {
      return { before: scans[0], after: scans[1] };
    }
    return { before: scans[0], after: scans[scans.length - 1] };
  }, [scans, comparisonMode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner label="Loading healing journey..." />
      </div>
    );
  }

  return (
    <div className="pb-12">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          <h1 className="text-2xl font-bold text-white">Healing Journey</h1>
        </div>
        <p className="text-sm text-slate-500 ml-5">
          Longitudinal progress tracking via Temporal Feature Ledger — {scans.length} scans recorded
        </p>
      </motion.div>

      {/* Healing summary banner */}
      {scans.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-5 rounded-2xl mb-6 border border-emerald-500/10"
        >
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-bold text-emerald-400">Treatment Responding</span>
              </div>
              <p className="text-xs text-slate-400">
                Patient showed consistent improvement from IGA {scans[0]?.results?.iga?.score} → {scans[scans.length - 1]?.results?.iga?.score} over 30 days.
                Inflammatory lesion count reduced by {
                  (scans[0]?.results?.lesions?.counts?.inflammatory || 0) -
                  (scans[scans.length - 1]?.results?.lesions?.counts?.inflammatory || 0)
                } lesions.
              </p>
            </div>

            {/* Quick stat badges */}
            <div className="flex items-center gap-3">
              {[
                { label: 'Start', value: `IGA ${scans[0]?.results?.iga?.score}`, color: 'text-red-400' },
                { label: '14 Days', value: `IGA ${scans[1]?.results?.iga?.score}`, color: 'text-amber-400' },
                { label: '30 Days', value: `IGA ${scans[2]?.results?.iga?.score}`, color: 'text-emerald-400' },
              ].map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-2">
                  {i > 0 && <svg className="w-3 h-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
                  <div className="text-center px-3 py-1.5 rounded-lg bg-white/[0.03]">
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider">{stat.label}</div>
                    <div className={`text-sm font-bold ${stat.color}`}>{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Main dashboard grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Left: Progress Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ProgressChart chartData={chartData} />
        </motion.div>

        {/* Right: Comparison Slider */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {comparisonPair && (
            <ComparisonSlider
              scanBefore={comparisonPair.before}
              scanAfter={comparisonPair.after}
            />
          )}
        </motion.div>
      </div>

      {/* Scan Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="glass-card p-6 rounded-2xl">
          <div className="section-label mb-4">Scan Archive</div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scans.map((scan, i) => {
              const igaData = IGA_SCALE[scan.results?.iga?.score || 0];
              const stageLabels = ['Day 1 — Baseline', 'Day 14 — Short Term', 'Day 30 — Long Term'];
              const stageColors = ['text-red-400', 'text-amber-400', 'text-emerald-400'];
              const isSelected = selectedScan?.id === scan.id;

              return (
                <motion.div
                  key={scan.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  onClick={() => setSelectedScan(isSelected ? null : scan)}
                  className={`rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border ${
                    isSelected ? 'border-medical-blue-500/40 ring-1 ring-medical-blue-500/20' : 'border-white/[0.05] hover:border-white/[0.12]'
                  }`}
                >
                  {/* Image preview */}
                  {scan.image && (
                    <div className="relative aspect-[3/4] bg-slate-800 overflow-hidden">
                      <img
                        src={scan.image}
                        alt={stageLabels[i]}
                        className="w-full h-full object-cover"
                      />
                      {/* Stage label overlay */}
                      <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm">
                        <span className={`text-[10px] font-bold ${stageColors[i]}`}>
                          {stageLabels[i]}
                        </span>
                      </div>
                      {/* IGA badge */}
                      <div
                        className="absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2"
                        style={{
                          backgroundColor: `${igaData?.color}20`,
                          borderColor: `${igaData?.color}60`,
                          color: igaData?.color,
                        }}
                      >
                        {scan.results?.iga?.score}
                      </div>
                    </div>
                  )}

                  {/* Details */}
                  <div className="p-3 bg-white/[0.01]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white">
                        IGA: {igaData?.label}
                      </span>
                      <span className="text-[9px] text-slate-600">
                        {new Date(scan.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-2 text-[9px]">
                      <span className="text-slate-500">
                        {scan.results?.lesions?.counts?.total || 0} lesions
                      </span>
                      <span className="text-slate-700">•</span>
                      <span className="text-slate-500">
                        {scan.results?.hyperpigmentation?.coverage_pct || 0}% hyperpig
                      </span>
                    </div>

                    {/* Milestone tag */}
                    {scan.milestone && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-medical-blue-400" />
                        <span className="text-[9px] font-medium text-medical-blue-400">
                          {scan.milestone.label}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Selected scan detail panel */}
      {selectedScan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl mt-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="section-label">Scan Detail — {selectedScan.results?.iga?.label}</div>
            <button
              onClick={() => setSelectedScan(null)}
              className="text-slate-500 hover:text-white transition-colors p-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-white/[0.02] text-center">
              <div className="text-[9px] text-slate-500 uppercase mb-1">IGA Score</div>
              <div className="text-2xl font-bold" style={{ color: IGA_SCALE[selectedScan.results?.iga?.score]?.color }}>
                {selectedScan.results?.iga?.score}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] text-center">
              <div className="text-[9px] text-slate-500 uppercase mb-1">Total Lesions</div>
              <div className="text-2xl font-bold text-white">
                {selectedScan.results?.lesions?.counts?.total}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] text-center">
              <div className="text-[9px] text-slate-500 uppercase mb-1">Inflammatory</div>
              <div className="text-2xl font-bold text-red-400">
                {selectedScan.results?.lesions?.counts?.inflammatory}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] text-center">
              <div className="text-[9px] text-slate-500 uppercase mb-1">Hyperpig</div>
              <div className="text-2xl font-bold text-amber-400">
                {selectedScan.results?.hyperpigmentation?.coverage_pct}%
              </div>
            </div>
          </div>

          {/* Recommendations for this scan */}
          {selectedScan.results?.recommendations?.length > 0 && (
            <div className="mt-4 pt-3 border-t border-white/5">
              <div className="text-[9px] text-slate-600 uppercase tracking-wider mb-2">Treatment at this stage</div>
              <div className="flex flex-wrap gap-2">
                {selectedScan.results.recommendations.map((rec, i) => (
                  <span key={i} className="px-2 py-1 rounded-md text-[9px] font-medium bg-medical-blue-500/5 border border-medical-blue-500/10 text-medical-blue-400">
                    {rec.ingredient} {rec.concentration !== '-' ? rec.concentration : ''}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
