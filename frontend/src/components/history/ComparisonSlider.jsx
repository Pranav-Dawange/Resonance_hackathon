// ============================================
// DermaAI SkinVision — Comparison Slider
// Side-by-side Before/After with draggable divider
// "Now vs. Then" with bounding box re-rendering
// ============================================

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { drawLesionBoxes, drawFaceMesh } from '../../utils/drawingUtils';

export default function ComparisonSlider({ scanBefore, scanAfter }) {
  const [dividerPos, setDividerPos] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('longterm'); // 'shortterm' | 'longterm'
  const containerRef = useRef(null);
  const beforeCanvasRef = useRef(null);
  const afterCanvasRef = useRef(null);

  // Draw overlays on both images
  useEffect(() => {
    drawOverlay(beforeCanvasRef.current, scanBefore);
    drawOverlay(afterCanvasRef.current, scanAfter);
  }, [scanBefore, scanAfter]);

  function drawOverlay(canvas, scan) {
    if (!canvas || !scan) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // Re-render lesion bounding boxes from historical data
      if (scan.results?.lesions?.items) {
        drawLesionBoxes(ctx, scan.results.lesions.items, canvas.width, canvas.height);
      }

      // Draw a subtle wireframe grid to simulate mesh consistency
      drawConsistencyGrid(ctx, canvas.width, canvas.height);
    };
    img.src = scan.image;
  }

  function drawConsistencyGrid(ctx, w, h) {
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 0.5;
    // Simulate face mesh with elliptical arcs
    ctx.beginPath();
    ctx.ellipse(w / 2, h * 0.45, w * 0.28, h * 0.32, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Horizontal lines
    for (let y = h * 0.2; y < h * 0.75; y += h * 0.08) {
      ctx.beginPath();
      ctx.moveTo(w * 0.2, y);
      ctx.lineTo(w * 0.8, y);
      ctx.stroke();
    }
    // Vertical lines
    for (let x = w * 0.25; x < w * 0.76; x += w * 0.1) {
      ctx.beginPath();
      ctx.moveTo(x, h * 0.15);
      ctx.lineTo(x, h * 0.78);
      ctx.stroke();
    }
    ctx.restore();
  }

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setDividerPos(pct);
  }, [isDragging]);

  const handleTouchMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setDividerPos(pct);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleMouseMove, handleDragEnd, handleTouchMove]);

  if (!scanBefore || !scanAfter) {
    return (
      <div className="glass-card p-8 rounded-2xl text-center">
        <p className="text-sm text-slate-500">Insufficient scan data for comparison</p>
      </div>
    );
  }

  const beforeIGA = scanBefore.results?.iga;
  const afterIGA = scanAfter.results?.iga;
  const igaDelta = (beforeIGA?.score || 0) - (afterIGA?.score || 0);

  return (
    <div className="glass-card p-6 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="section-label">Side-by-Side Comparison</div>
          <p className="text-xs text-slate-500 mt-0.5">Drag the divider to compare</p>
        </div>

        {/* IGA delta badge */}
        {igaDelta > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
          >
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span className="text-xs font-bold text-emerald-400">
              IGA -{igaDelta}
            </span>
            <span className="text-[9px] text-emerald-500">improvement</span>
          </motion.div>
        )}
      </div>

      {/* Tab selector: Short Term / Long Term */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'shortterm', label: 'Short Term (14d)' },
          { key: 'longterm', label: 'Long Term (30d)' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-medical-blue-500/15 text-medical-blue-400 border border-medical-blue-500/30'
                : 'text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Slider viewport */}
      <div
        ref={containerRef}
        className="relative rounded-xl overflow-hidden bg-black cursor-col-resize select-none aspect-[3/4] max-h-[440px]"
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
      >
        {/* AFTER image (full width behind) */}
        <div className="absolute inset-0">
          <canvas
            ref={afterCanvasRef}
            className="w-full h-full object-cover"
          />
          {/* "Now" label */}
          <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/30">
            <span className="text-[10px] font-bold text-emerald-400">
              NOW — IGA {afterIGA?.score}
            </span>
          </div>
        </div>

        {/* BEFORE image (clipped to left of divider) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - dividerPos}% 0 0)` }}
        >
          <canvas
            ref={beforeCanvasRef}
            className="w-full h-full object-cover"
          />
          {/* "Before" label */}
          <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-red-500/20 border border-red-500/30">
            <span className="text-[10px] font-bold text-red-400">
              BEFORE — IGA {beforeIGA?.score}
            </span>
          </div>
        </div>

        {/* Divider line */}
        <div
          className="absolute top-0 bottom-0 z-20 pointer-events-none"
          style={{ left: `${dividerPos}%`, transform: 'translateX(-50%)' }}
        >
          {/* Vertical line */}
          <div className="absolute top-0 bottom-0 w-[2px] bg-white/70 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />

          {/* Drag handle */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/60 flex items-center justify-center shadow-lg pointer-events-auto cursor-col-resize">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M8 6l-4 6 4 6" />
              <path d="M16 6l4 6-4 6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom stats comparison */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {[
          {
            label: 'IGA Score',
            before: beforeIGA?.score,
            after: afterIGA?.score,
            improved: (afterIGA?.score || 0) < (beforeIGA?.score || 0),
          },
          {
            label: 'Total Lesions',
            before: scanBefore.results?.lesions?.counts?.total,
            after: scanAfter.results?.lesions?.counts?.total,
            improved: (scanAfter.results?.lesions?.counts?.total || 0) < (scanBefore.results?.lesions?.counts?.total || 0),
          },
          {
            label: 'Hyperpig %',
            before: `${scanBefore.results?.hyperpigmentation?.coverage_pct || 0}%`,
            after: `${scanAfter.results?.hyperpigmentation?.coverage_pct || 0}%`,
            improved: (scanAfter.results?.hyperpigmentation?.coverage_pct || 0) < (scanBefore.results?.hyperpigmentation?.coverage_pct || 0),
          },
        ].map(stat => (
          <div key={stat.label} className="text-center p-2 rounded-lg bg-white/[0.02]">
            <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">{stat.label}</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-bold text-red-400/70">{stat.before}</span>
              <svg className={`w-3 h-3 ${stat.improved ? 'text-emerald-400' : 'text-red-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className={`text-sm font-bold ${stat.improved ? 'text-emerald-400' : 'text-red-400'}`}>{stat.after}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
