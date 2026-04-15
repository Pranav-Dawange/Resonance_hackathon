// ============================================
// DermaAI SkinVision — Camera Hook
// Manages getUserMedia lifecycle + video stream
// ============================================

import { useState, useRef, useCallback, useEffect } from 'react';

export function useCamera() {
  const [isActive, setIsActive] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = useCallback(async (videoElement) => {
    try {
      setError(null);

      if (videoElement) {
        videoRef.current = videoElement;
      }

      const target = videoRef.current;
      if (!target) throw new Error('No video element provided');

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      target.srcObject = stream;

      await new Promise((resolve) => {
        target.onloadedmetadata = () => {
          target.play();
          resolve();
        };
      });

      setIsActive(true);
    } catch (err) {
      console.error('Camera access failed:', err);
      setError(
        err.name === 'NotAllowedError'
          ? 'Camera access denied. Please allow camera permissions.'
          : err.name === 'NotFoundError'
          ? 'No camera found. Please connect a camera.'
          : err.name === 'NotReadableError' || err.message.includes('Could not start video source')
          ? 'Camera is currently in use by another application. Please close Zoom, Teams, or other apps using the camera and try again.'
          : `Camera error: ${err.message}`
      );
      setIsActive(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || !isActive) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);
    return {
      canvas,
      dataUrl: canvas.toDataURL('image/jpeg', 0.92),
      width: canvas.width,
      height: canvas.height,
    };
  }, [isActive, isMirrored]);

  const toggleMirror = useCallback(() => {
    setIsMirrored(prev => !prev);
  }, []);

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  // Restart camera when facingMode changes
  useEffect(() => {
    if (isActive && videoRef.current) {
      startCamera();
    }
  }, [facingMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    videoRef,
    isActive,
    isMirrored,
    error,
    startCamera,
    stopCamera,
    captureFrame,
    toggleMirror,
    switchCamera,
  };
}
