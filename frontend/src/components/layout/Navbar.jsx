// ============================================
// DermaAI SkinVision — Navbar
// ============================================

import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Navbar() {
  const location = useLocation();

  const links = [
    { path: '/', label: 'Home' },
    { path: '/scan', label: 'Scan' },
    { path: '/history', label: 'History' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-clinical-base/80 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-medical-blue-500 to-medical-blue-700 flex items-center justify-center shadow-lg shadow-medical-blue-500/20 group-hover:shadow-medical-blue-500/40 transition-shadow">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-clinical-base shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-tight">
                DermaAI <span className="text-medical-blue-400">SkinVision</span>
              </span>
              <p className="text-[8px] text-slate-500 -mt-0.5 tracking-wider uppercase">
                AI Facial Health Screening
              </p>
            </div>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {links.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 rounded-xl bg-medical-blue-500/10 border border-medical-blue-500/20"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 ${isActive ? 'text-medical-blue-400' : 'text-slate-400 hover:text-white'}`}>
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
