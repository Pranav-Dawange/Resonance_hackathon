// ============================================
// DermaAI SkinVision — MediaPipe FaceLandmarker Hook
// Initializes and manages the face detection pipeline
// ============================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const WASM_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';

export function useMediaPipe() {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const faceLandmarkerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        setLoadProgress(20);
        // Load WASM vision module
        const vision = await FilesetResolver.forVisionTasks(WASM_CDN);
        
        if (cancelled) return;
        setLoadProgress(50);

        // Create FaceLandmarker
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          minFaceDetectionConfidence: 0.5,
          minFacePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        });

        if (cancelled) return;
        setLoadProgress(100);
        faceLandmarkerRef.current = landmarker;
        setIsReady(true);
        setIsLoading(false);
      } catch (err) {
        if (!cancelled) {
          console.error('MediaPipe initialization failed:', err);
          setError(err.message || 'Failed to load face detection model');
          setIsLoading(false);
        }
      }
    }

    initialize();

    return () => {
      cancelled = true;
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
        faceLandmarkerRef.current = null;
      }
    };
  }, []);

  /**
   * Detect face landmarks from a video frame
   * @param {HTMLVideoElement} video - The video element to detect from
   * @param {number} timestamp - Current timestamp in ms
   * @returns {Object|null} - Detection result with faceLandmarks
   */
  const detect = useCallback((video, timestamp) => {
    if (!faceLandmarkerRef.current || !video) return null;

    try {
      const result = faceLandmarkerRef.current.detectForVideo(video, timestamp);
      if (result && result.faceLandmarks && result.faceLandmarks.length > 0) {
        return {
          landmarks: result.faceLandmarks[0], // First face only
          allFaces: result.faceLandmarks,
          timestamp,
        };
      }
      return null;
    } catch (err) {
      // Silently handle detection errors (can happen during camera transitions)
      return null;
    }
  }, []);

  /**
   * Detect from a static image
   * @param {HTMLImageElement|HTMLCanvasElement} imageSource
   * @returns {Object|null}
   */
  const detectImage = useCallback(async (imageSource) => {
    if (!faceLandmarkerRef.current) return null;

    try {
      // Switch to IMAGE mode temporarily
      await faceLandmarkerRef.current.setOptions({ runningMode: 'IMAGE' });
      const result = faceLandmarkerRef.current.detect(imageSource);
      // Switch back to VIDEO mode
      await faceLandmarkerRef.current.setOptions({ runningMode: 'VIDEO' });

      if (result && result.faceLandmarks && result.faceLandmarks.length > 0) {
        return {
          landmarks: result.faceLandmarks[0],
          allFaces: result.faceLandmarks,
        };
      }
      return null;
    } catch (err) {
      console.error('Image detection failed:', err);
      return null;
    }
  }, []);

  return {
    isLoading,
    isReady,
    error,
    loadProgress,
    detect,
    detectImage,
  };
}
