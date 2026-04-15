// ============================================
// DermaAI SkinVision — Scan Page
// Camera → Face Mesh → Analysis → Results
// ============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CameraCapture from '../components/camera/CameraCapture';
import DiagnosticPanel from '../components/results/DiagnosticPanel';

export default function ScanPage() {
  const [analysisData, setAnalysisData] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const handleAnalysisComplete = (data) => {
    setAnalysisData(data);
    setShowResults(true);
  };

  return (
    <div className="pb-12">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-2 rounded-full bg-medical-blue-400 animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
          <h1 className="text-2xl font-bold text-white">Facial Health Scan</h1>
        </div>
        <p className="text-sm text-slate-500 ml-5">
          Position your face in the camera frame. The AI will map 468 facial landmarks in real-time.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left: Camera + Controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <CameraCapture onAnalysisComplete={handleAnalysisComplete} />
        </motion.div>

        {/* Right: Results */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {showResults && analysisData ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <DiagnosticPanel analysisData={analysisData} />
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card p-8 rounded-2xl h-full flex flex-col items-center justify-center text-center min-h-[400px]"
              >
                {/* Animated pulse ring */}
                <div className="relative w-24 h-24 mb-6">
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-medical-blue-500/20"
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.3, 0, 0.3],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-2 rounded-full border-2 border-medical-blue-500/30"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.4, 0, 0.4],
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-10 h-10 text-medical-blue-500/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-slate-300 mb-2">
                  Ready for Analysis
                </h3>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Click <span className="text-medical-blue-400 font-medium">"Start Analysis"</span> to begin the diagnostic scan. Ensure your face is well-lit and centered in the frame.
                </p>

                {/* Feature badges */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                  {[
                    'Face Mesh 468pts',
                    'Lesion Detection',
                    'IGA Scoring',
                    'Hyperpigmentation',
                  ].map(badge => (
                    <span
                      key={badge}
                      className="px-2 py-1 rounded-md text-[9px] font-medium bg-white/[0.03] border border-white/[0.05] text-slate-600"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
