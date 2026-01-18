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
    
    // النقاط المهمة في اليد
    const thumbTip = hand[4];
    const thumbIP = hand[3];
    const indexTip = hand[8];
    const indexPIP = hand[6];
    const middleTip = hand[12];
    const middlePIP = hand[10];
    const ringTip = hand[16];
    const ringPIP = hand[14];
    const pinkyTip = hand[20];
    const pinkyPIP = hand[18];
    const wrist = hand[0];
    const indexMCP = hand[5];
    const palmBase = hand[0];

    // حساب المسافات والزوايا
    const indexUp = indexTip.y < indexPIP.y;
    const middleUp = middleTip.y < middlePIP.y;
    const ringUp = ringTip.y < ringPIP.y;
    const pinkyUp = pinkyTip.y < pinkyPIP.y;
    
    // حساب إذا الأصابع ممدودة
    const indexExtended = Math.abs(indexTip.y - indexMCP.y) > 0.1;
    const middleExtended = Math.abs(middleTip.y - indexMCP.y) > 0.1;
    const ringExtended = Math.abs(ringTip.y - indexMCP.y) > 0.1;
    const pinkyExtended = Math.abs(pinkyTip.y - indexMCP.y) > 0.1;
    
    // حساب المسافة بين أطراف الأصابع
    const fingertipsDistance = Math.sqrt(
      Math.pow(thumbTip.x - indexTip.x, 2) + 
      Math.pow(thumbTip.y - indexTip.y, 2)
    );
    
    // حساب إذا الكف مواجه للكاميرا
    const palmFacingForward = Math.abs(thumbTip.z - pinkyTip.z) < 0.05;
    
    // التعرف على الإشارات حسب JSON
    
    // 1. index_finger_up - إصبع السبابة لفوق (التوحيد)
    if (indexUp && indexExtended && !middleUp && !ringUp && !pinkyUp) {
      setCurrentGesture('index_finger_up');
      return;
    }
    
    // 2. palms_facing - الكف مواجه (الأبدي)
    if (indexExtended && middleExtended && ringExtended && pinkyExtended && palmFacingForward) {
      setCurrentGesture('palms_facing');
      return;
    }
    
    // 3. hands_moving_apart - الأيدي متباعدة (النفي)
    // نفس إشارة الكف المفتوح لكن بحركة
    if (indexExtended && middleExtended && ringExtended && palmFacingForward) {
      setCurrentGesture('hands_moving_apart');
      return;
    }
    
    // 4. fingertips_touch - أطراف الأصابع تلمس (المساواة)
    if (fingertipsDistance < 0.05) {
      setCurrentGesture('fingertips_touch');
      return;
    }
    
    // إذا ما طابقت أي إشارة
    setCurrentGesture('unknown');
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
