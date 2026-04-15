// ============================================
// DermaAI SkinVision — FaceMeshAnalyzer
// Real-time 468-point 3D wireframe overlay with
// facial zone mapping and scan laser effect
// ============================================

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { drawFaceMesh, drawZoneOverlays, drawScanGrid } from '../../utils/drawingUtils';
import { FACIAL_ZONES } from '../../utils/facialZones';

export default function FaceMeshAnalyzer({
  videoRef,
  mediapipe,
  isScanning,
  onLandmarksUpdate,
  showZones = true,
  showMesh = true,
}) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [activeZone, setActiveZone] = useState(null);
  const zoneRotationRef = useRef(0);

  // Rotate through zones during scan for visual impact
  useEffect(() => {
    if (!isScanning) {
      setActiveZone(null);
      return;
    }
    const zoneNames = Object.keys(FACIAL_ZONES);
    const interval = setInterval(() => {
      zoneRotationRef.current = (zoneRotationRef.current + 1) % zoneNames.length;
      setActiveZone(zoneNames[zoneRotationRef.current]);
    }, 800);
    return () => clearInterval(interval);
  }, [isScanning]);

  const renderFrame = useCallback(() => {
    const video = videoRef?.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !mediapipe.isReady) {
      animFrameRef.current = requestAnimationFrame(renderFrame);
      return;
    }

    if (video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(renderFrame);
      return;
    }

    const ctx = canvas.getContext('2d');
    const width = video.videoWidth;
    const height = video.videoHeight;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Detect landmarks
    const now = performance.now();
    if (now - lastTimeRef.current > 33) { // ~30fps cap
      const result = mediapipe.detect(video, now);

      if (result && result.landmarks) {
        setFaceDetected(true);
        const landmarks = result.landmarks;

        // Draw subtle background grid during scan
        if (isScanning) {
          drawScanGrid(ctx, width, height, now);
        }

        // Draw 3D wireframe mesh
        if (showMesh) {
          drawFaceMesh(ctx, landmarks, width, height, {
            meshStroke: isScanning
              ? 'rgba(37, 99, 235, 0.5)'
              : 'rgba(37, 99, 235, 0.25)',
            lineWidth: isScanning ? 0.7 : 0.4,
            showPoints: isScanning,
            pointColor: 'rgba(96, 165, 250, 0.7)',
          });
        }

        // Draw zone overlays
        if (showZones) {
          drawZoneOverlays(ctx, landmarks, width, height, activeZone);
        }

        // Notify parent
        onLandmarksUpdate?.(landmarks);
      } else {
        setFaceDetected(false);
      }

      lastTimeRef.current = now;
    }

    animFrameRef.current = requestAnimationFrame(renderFrame);
  }, [mediapipe, videoRef, isScanning, showMesh, showZones, activeZone, onLandmarksUpdate]);

  // Start render loop
  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(renderFrame);
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [renderFrame]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Main overlay canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ transform: 'scaleX(-1)' }}
      />

      {/* Scan laser line effect */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 overflow-hidden pointer-events-none"
          >
            <motion.div
              className="absolute left-0 right-0 h-[2px] z-30"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.3) 15%, rgba(37,99,235,0.9) 50%, rgba(37,99,235,0.3) 85%, transparent 100%)',
                boxShadow: '0 0 12px rgba(37,99,235,0.6), 0 0 32px rgba(37,99,235,0.3), 0 0 64px rgba(37,99,235,0.15)',
              }}
              animate={{
                top: ['0%', '100%', '0%'],
              }}
              transition={{
                duration: 2.5,
                ease: 'easeInOut',
                repeat: Infinity,
              }}
            >
              {/* Glow trail */}
              <div
                className="absolute -top-12 left-0 right-0 h-24"
                style={{
                  background: 'linear-gradient(180deg, transparent 0%, rgba(37,99,235,0.06) 50%, transparent 100%)',
                }}
              />
            </motion.div>

            {/* Scan grid overlay */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.08, 0.04] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{
                backgroundImage:
                  'linear-gradient(rgba(37,99,235,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.1) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Face detection indicator */}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${faceDetected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]'} transition-colors duration-300`} />
        <span className="text-[10px] font-medium text-white/70">
          {faceDetected ? 'Face Detected' : 'No Face Detected'}
        </span>
      </div>

      {/* Active zone indicator */}
      <AnimatePresence>
        {isScanning && activeZone && (
          <motion.div
            key={activeZone}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute top-3 right-3 glass-card px-3 py-1.5 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: FACIAL_ZONES[activeZone]?.strokeColor }}
              />
              <span className="text-[10px] font-semibold text-white uppercase tracking-wider">
                Scanning: {FACIAL_ZONES[activeZone]?.label}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanning progress corners */}
      <AnimatePresence>
        {isScanning && (
          <>
            {/* Top-left corner */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-0 left-0 w-16 h-16"
            >
              <svg className="w-full h-full" viewBox="0 0 64 64">
                <motion.path
                  d="M 2 20 L 2 2 L 20 2"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6 }}
                />
              </svg>
            </motion.div>
            {/* Top-right corner */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-0 right-0 w-16 h-16"
            >
              <svg className="w-full h-full" viewBox="0 0 64 64">
                <motion.path
                  d="M 44 2 L 62 2 L 62 20"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                />
              </svg>
            </motion.div>
            {/* Bottom-left corner */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 left-0 w-16 h-16"
            >
              <svg className="w-full h-full" viewBox="0 0 64 64">
                <motion.path
                  d="M 2 44 L 2 62 L 20 62"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                />
              </svg>
            </motion.div>
            {/* Bottom-right corner */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 right-0 w-16 h-16"
            >
              <svg className="w-full h-full" viewBox="0 0 64 64">
                <motion.path
                  d="M 44 62 L 62 62 L 62 44"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                />
              </svg>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
