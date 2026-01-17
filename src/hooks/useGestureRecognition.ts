import { useRef, useState, useCallback, useEffect } from 'react';

declare global {
  interface Window {
    Hands: any;
    Camera: any;
    drawConnectors: any;
    drawLandmarks: any;
    HAND_CONNECTIONS: any;
  }
}

export function useGestureRecognition() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentGesture, setCurrentGesture] = useState<string>('unknown');
  const [isReady, setIsReady] = useState(false);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  const recognizeGesture = useCallback((landmarks: any) => {
    if (!landmarks || landmarks.length === 0) {
      setCurrentGesture('unknown');
      return;
    }

    const hand = landmarks[0];
    const thumbTip = hand[4];
    const indexTip = hand[8];
    const middleTip = hand[12];
    const ringTip = hand[16];
    const pinkyTip = hand[20];
    const wrist = hand[0];

    const indexUp = indexTip.y < hand[6].y;
    const middleUp = middleTip.y < hand[10].y;
    const ringUp = ringTip.y < hand[14].y;
    const pinkyUp = pinkyTip.y < hand[18].y;
    const thumbOut = Math.abs(thumbTip.x - wrist.x) > 0.1;

    if (indexUp && !middleUp && !ringUp && !pinkyUp) {
      setCurrentGesture('one');
    } else if (indexUp && middleUp && !ringUp && !pinkyUp) {
      setCurrentGesture('two');
    } else if (indexUp && middleUp && ringUp && !pinkyUp) {
      setCurrentGesture('three');
    } else if (indexUp && middleUp && ringUp && pinkyUp && !thumbOut) {
      setCurrentGesture('four');
    } else if (indexUp && middleUp && ringUp && pinkyUp && thumbOut) {
      setCurrentGesture('five');
    } else {
      setCurrentGesture('unknown');
    }
  }, []);

  const onResults = useCallback(
    (results: any) => {
      if (!canvasRef.current) return;

      const canvasCtx = canvasRef.current.getContext('2d');
      if (!canvasCtx) return;

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        for (const landmarks of results.multiHandLandmarks) {
          window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, {
            color: '#00FF00',
            lineWidth: 2,
          });
          window.drawLandmarks(canvasCtx, landmarks, {
            color: '#FF0000',
            lineWidth: 1,
          });
        }
        recognizeGesture(results.multiHandLandmarks);
      } else {
        setCurrentGesture('unknown');
      }

      canvasCtx.restore();
    },
    [recognizeGesture]
  );

  const startCamera = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    try {
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');

      handsRef.current = new window.Hands({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
      });

      handsRef.current.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      handsRef.current.onResults(onResults);

      cameraRef.current = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && handsRef.current) {
            await handsRef.current.send({ image: videoRef.current });
          }
        },
        width: 1280,
        height: 720,
      });

      await cameraRef.current.start();
      setIsReady(true);
    } catch (error) {
      console.error('Error starting camera:', error);
    }
  }, [onResults]);

  useEffect(() => {
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, []);

  return {
    currentGesture,
    isReady,
    videoRef,
    canvasRef,
    startCamera,
  };
}
