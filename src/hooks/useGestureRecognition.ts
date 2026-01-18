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
  const previousHandPositionRef = useRef<any>(null);

  const recognizeGesture = useCallback((landmarks: any) => {
    if (!landmarks || landmarks.length === 0) {
      setCurrentGesture('unknown');
      previousHandPositionRef.current = null;
      return;
    }

    const hand = landmarks[0];
    
    // النقاط المهمة
    const thumbTip = hand[4];
    const indexTip = hand[8];
    const indexPIP = hand[6];
    const middleTip = hand[12];
    const middlePIP = hand[10];
    const ringTip = hand[16];
    const ringPIP = hand[14];
    const pinkyTip = hand[20];
    const pinkyPIP = hand[18];
    const wrist = hand[0];

    // ☝️ 1. التوحيد - إصبع السبابة للأعلى فقط
    const indexUp = indexTip.y < indexPIP.y - 0.05;
    const middleDown = middleTip.y > middlePIP.y;
    const ringDown = ringTip.y > ringPIP.y;
    const pinkyDown = pinkyTip.y > pinkyPIP.y;
    
    if (indexUp && middleDown && ringDown && pinkyDown) {
      setCurrentGesture('index_finger_up');
      previousHandPositionRef.current = { x: wrist.x, y: wrist.y };
      return;
    }

    // 🙌 2. الأبدي - راحتا اليدين للأمام (كل الأصابع ممدودة)
    const allFingersUp = 
      indexTip.y < indexPIP.y &&
      middleTip.y < middlePIP.y &&
      ringTip.y < ringPIP.y &&
      pinkyTip.y < pinkyPIP.y;
    
    // التأكد إن الكف مواجه (z قريب من بعض)
    const palmFacing = Math.abs(indexTip.z - pinkyTip.z) < 0.08;
    
    if (allFingersUp && palmFacing) {
      setCurrentGesture('palms_facing');
      previousHandPositionRef.current = { x: wrist.x, y: wrist.y };
      return;
    }

    // ↔️ 3. النفي - حركة اليدين بعيداً (نكتشف الحركة)
    if (previousHandPositionRef.current && allFingersUp) {
      const currentX = wrist.x;
      const previousX = previousHandPositionRef.current.x;
      const movement = Math.abs(currentX - previousX);
      
      // إذا في حركة أفقية واضحة
      if (movement > 0.08) {
        setCurrentGesture('hands_moving_apart');
        previousHandPositionRef.current = { x: wrist.x, y: wrist.y };
        return;
      }
    }

    // 🤲 4. المساواة - لمس أطراف الأصابع (الإبهام والسبابة قريبين جداً)
    const fingertipsDistance = Math.sqrt(
      Math.pow(thumbTip.x - indexTip.x, 2) + 
      Math.pow(thumbTip.y - indexTip.y, 2) +
      Math.pow(thumbTip.z - indexTip.z, 2)
    );
    
    // إذا كل الأصابع قريبة من بعض (شكل قبة)
    const allFingertipsClose = 
      fingertipsDistance < 0.06 &&
      Math.sqrt(Math.pow(thumbTip.x - middleTip.x, 2) + Math.pow(thumbTip.y - middleTip.y, 2)) < 0.08;
    
    if (allFingertipsClose) {
      setCurrentGesture('fingertips_touch');
      previousHandPositionRef.current = { x: wrist.x, y: wrist.y };
      return;
    }

    // حفظ الموقع الحالي للتتبع
    previousHandPositionRef.current = { x: wrist.x, y: wrist.y };
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
        previousHandPositionRef.current = null;
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
