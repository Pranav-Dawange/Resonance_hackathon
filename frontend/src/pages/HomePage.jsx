// ============================================
// DermaAI SkinVision — Home Page
// Hero + feature showcase
// ============================================

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Components';

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Real-Time Face Mesh',
    description: '468 3D landmarks tracked at 30fps using MediaPipe Vision. Clinical zone mapping for forehead, cheeks, nose, and chin.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'IGA Clinical Grading',
    description: "Investigator's Global Assessment 0-4 scale with logarithmic severity calculation. Evidence-based acne classification.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    title: 'CIE LAB Analysis',
    description: 'Hyperpigmentation detection in CIE L*a*b* color space. Stable across Fitzpatrick skin types I-VI for equitable screening.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    title: 'AI Skincare Engine',
    description: 'Evidence-based ingredient recommendations based on detected IGA scores. Salicylic acid, benzoyl peroxide, retinoids, and more.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Progress Tracking',
    description: 'Longitudinal temporal feature ledger with side-by-side comparison. Track your skin health journey over time.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: 'Quality Assurance',
    description: 'Real-time luminance monitoring and blur detection. Clinical-grade image quality gating before analysis.',
  },
];

export default function HomePage() {
  return (
    <div className="pb-12">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center py-16 md:py-24 relative"
      >
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-medical-blue-500/5 blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-medical-blue-500/10 border border-medical-blue-500/20 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-medical-blue-400 animate-pulse" />
            <span className="text-xs font-medium text-medical-blue-400">AI-Powered Dermatological Screening</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gradient-hero mb-6 leading-tight">
            DermaAI
            <br />
            <span className="text-gradient-blue">SkinVision</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Production-grade facial health screening powered by MediaPipe Face Mesh, 
            YOLOv11 lesion detection, and CIE L*a*b* color space analysis.
            Clinical IGA 0–4 grading with diversity equity across all skin tones.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link to="/scan">
              <Button
                variant="primary"
                size="lg"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                }
              >
                Start Screening
              </Button>
            </Link>
            <Link to="/history">
              <Button variant="ghost" size="lg">
                View History
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Floating tech badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-12">
          {['MediaPipe', 'YOLOv11', 'CIE LAB', 'IGA 0-4', 'FastAPI', 'Fitzpatrick I-VI'].map((tech, i) => (
            <motion.span
              key={tech}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className="px-3 py-1 rounded-full text-[10px] font-medium bg-white/[0.04] border border-white/[0.06] text-slate-500"
            >
              {tech}
            </motion.span>
          ))}
        </div>
      </motion.section>

      {/* Features Grid */}
      <section className="py-12">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-2">Clinical Pipeline</h2>
          <p className="text-sm text-slate-500">Six-stage diagnostic architecture for comprehensive skin analysis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="glass-card-hover p-6"
            >
              <div className="w-10 h-10 rounded-xl bg-medical-blue-500/10 flex items-center justify-center text-medical-blue-400 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Architecture note */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="glass-card p-6 rounded-2xl text-center"
      >
        <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold mb-2">System Architecture</p>
        <p className="text-xs text-slate-400 max-w-3xl mx-auto leading-relaxed">
          React 18 (Vite) → MediaPipe Face Mesh (468 landmarks) → FastAPI → YOLOv11 Lesion Detection + CIE LAB Hyperpigmentation → IGA Scoring → RAG-Lite Recommendations → Firebase Firestore (Temporal Ledger) → History Dashboard
        </p>
      </motion.section>
    </div>
  );
}
