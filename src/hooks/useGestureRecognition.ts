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
    const indexPIP = hand[6];
    const middleTip = hand[12];
    const middlePIP = hand[10];
    const ringTip = hand[16];
    const ringPIP = hand[14];
    const pinkyTip = hand[20];
    const pinkyPIP = hand[18];

    const indexUp = indexTip.y < indexPIP.y - 0.04;
    const middleUp = middleTip.y < middlePIP.y - 0.04;
    const ringUp = ringTip.y < ringPIP.y - 0.04;
    const pinkyUp = pinkyTip.y < pinkyPIP.y - 0.04;
    
    const indexDown = indexTip.y > indexPIP.y + 0.02;
    const middleDown = middleTip.y > middlePIP.y + 0.02;
    const ringDown = ringTip.y > ringPIP.y + 0.02;
    const pinkyDown = pinkyTip.y > pinkyPIP.y + 0.02;

    if (indexUp && middleDown && ringDown && pinkyDown) {
      setCurrentGesture('index_finger_up');
      return;
    }

    const allFingersExtended = indexUp && middleUp && ringUp && pinkyUp;
    const palmFacing = Math.abs(indexTip.z - pinkyTip.z) < 0.08;
    
    if (allFingersExtended && palmFacing) {
      setCurrentGesture('palms_facing');
      return;
    }

    const palmSideways = Math.abs(indexTip.z - pinkyTip.z) > 0.12;
    
    if (allFingersExtended && palmSideways) {
      setCurrentGesture('hands_moving_apart');
      return;
    }

    const thumbIndexDistance = Math.sqrt(
      Math.pow(thumbTip.x - indexTip.x, 2) + 
      Math.pow(thumbTip.y - indexTip.y, 2) +
      Math.pow(thumbTip.z - indexTip.z, 2)
    );
    
    const thumbMiddleDistance = Math.sqrt(
      Math.pow(thumbTip.x - middleTip.x, 2) + 
      Math.pow(thumbTip.y - middleTip.y, 2)
    );
    
    const fingertipsTogether = thumbIndexDistance < 0.07 && thumbMiddleDistance < 0.09;
    
    if (fingertipsTogether) {
      setCurrentGesture('fingertips_touch');
      return;
    }

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
