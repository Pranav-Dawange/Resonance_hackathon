// ============================================
// DermaAI SkinVision — Footer
// Includes the mandatory legal disclaimer
// ============================================

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.04] bg-clinical-base/50 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Branding */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-medical-blue-500 to-medical-blue-700 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-xs text-slate-500">
              DermaAI SkinVision © {new Date().getFullYear()}
            </span>
          </div>

          {/* Legal Disclaimer — MANDATORY */}
          <div className="max-w-lg text-center md:text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/10 mb-1">
              <svg className="w-3 h-3 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-[9px] font-semibold text-amber-500 uppercase tracking-wider">
                Non-Diagnostic Screening Tool
              </span>
            </div>
            <p className="text-[9px] text-slate-600 leading-relaxed">
              This system is a research prototype for educational purposes only. It does not provide medical diagnosis, treatment advice, or replace professional dermatological consultation. Always consult a licensed dermatologist for clinical decisions.
            </p>
          </div>
        </div>

        {/* Tech credits */}
        <div className="mt-4 pt-3 border-t border-white/[0.03] text-center">
          <p className="text-[8px] text-slate-700 font-mono">
            Built with MediaPipe • YOLOv11 • CIE L*a*b* • IGA 0-4 • FastAPI • React 18 • RESONANCE 2K26
          </p>
        </div>
      </div>
    </footer>
  );
}
