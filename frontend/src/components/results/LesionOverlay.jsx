// ============================================
// DermaAI SkinVision — Lesion Overlay
// Color-coded bounding box visualization
// ============================================

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { drawLesionBoxes } from '../../utils/drawingUtils';

export default function LesionOverlay({ imageUrl, lesions, counts }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !lesions) return;

    const draw = () => {
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawLesionBoxes(ctx, lesions, canvas.width, canvas.height);
    };

    if (img.complete) {
      draw();
    } else {
      img.onload = draw;
    }
  }, [lesions]);

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="section-label mb-4">Lesion Detection</div>

      {/* Image with overlay */}
      <div className="relative rounded-xl overflow-hidden bg-black mb-4">
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Scan capture"
          className="w-full h-auto"
          crossOrigin="anonymous"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
      </div>

      {/* Lesion counts */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Comedonal', count: counts?.comedonal || 0, color: '#22C55E', icon: '○' },
          { label: 'Inflammatory', count: counts?.inflammatory || 0, color: '#EF4444', icon: '●' },
          { label: 'Other', count: counts?.other || 0, color: '#3B82F6', icon: '◆' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]"
          >
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[10px] font-medium text-slate-400">{item.label}</span>
            </div>
            <motion.span
              className="text-2xl font-bold text-white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6 + i * 0.15, type: 'spring' }}
            >
              {item.count}
            </motion.span>
          </motion.div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs text-slate-500">Total Lesions Detected</span>
        <span className="text-lg font-bold text-white">{counts?.total || 0}</span>
      </div>
    </div>
  );
}
