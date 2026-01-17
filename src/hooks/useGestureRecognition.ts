import { useEffect, useRef, useState, useCallback } from 'react';
import { Hands, Results, NormalizedLandmarkList } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { detectGesture, GestureType } from '../utils/gestureDetection';

interface UseGestureRecognitionReturn {
  currentGesture: GestureType;
  isReady: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  startCamera: () => void;
  stopCamera: () => void;
}

export function useGestureRecognition(): UseGestureRecognitionReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  const [currentGesture, setCurrentGesture] = useState<GestureType>('unknown');
  const [isReady, setIsReady] = useState(false);

  const onResults = useCallback((results: Results) => {
    if (!canvasRef.current) return;

    const canvasCtx = canvasRef.current.getContext('2d');
    if (!canvasCtx) return;

    canvasCtx.save();
    canvasCtx.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    if (results.multiHandLandmarks && results.multiHandedness) {
      const landmarks: {
        left?: NormalizedLandmarkList;
        right?: NormalizedLandmarkList;
      } = {};

      results.multiHandedness.forEach((handedness, index) => {
        const label = handedness.label.toLowerCase() as 'left' | 'right';
        landmarks[label] = results.multiHandLandmarks[index];
      });

      const gesture = detectGesture(landmarks);
      setCurrentGesture((prev) => (prev !== gesture ? gesture : prev));

      results.multiHandLandmarks.forEach((handLandmarks) => {
        if (handLandmarks.length !== 21) return;

        const canvasWidth = canvasRef.current!.width;
        const canvasHeight = canvasRef.current!.height;

        const HAND_CONNECTIONS = [
          [0, 1], [1, 2], [2, 3], [3, 4],
          [0, 5], [5, 6], [6, 7], [7, 8],
          [0, 9], [9, 10], [10, 11], [11, 12],
          [0, 13], [13, 14], [14, 15], [15, 16],
          [0, 17], [17, 18], [18, 19], [19, 20],
          [5, 9], [9, 13], [13, 17],
        ] as [number, number][];

        canvasCtx.strokeStyle = '#fbbf24';
        canvasCtx.lineWidth = 1.5;
        canvasCtx.lineCap = 'round';

        HAND_CONNECTIONS.forEach(([start, end]) => {
          const startPoint = handLandmarks[start];
          const endPoint = handLandmarks[end];

          canvasCtx.beginPath();
          canvasCtx.moveTo(
            startPoint.x * canvasWidth,
            startPoint.y * canvasHeight
          );
          canvasCtx.lineTo(
            endPoint.x * canvasWidth,
            endPoint.y * canvasHeight
          );
          canvasCtx.stroke();
        });

        canvasCtx.fillStyle = '#fbbf24';
        
        handLandmarks.forEach((landmark) => {
          canvasCtx.beginPath();
          canvasCtx.arc(
            landmark.x * canvasWidth,
            landmark.y * canvasHeight,
            3,
            0,
            2 * Math.PI
          );
          canvasCtx.fill();

          canvasCtx.shadowColor = '#fbbf24';
          canvasCtx.shadowBlur = 4;
          canvasCtx.fill();
          canvasCtx.shadowBlur = 0;
        });
      });
    } else {
      setCurrentGesture('unknown');
    }

    canvasCtx.restore();
  }, []);

  const startCamera = useCallback(() => {
    if (!videoRef.current) return;

    handsRef.current = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    handsRef.current.setOptions({
      maxNumHands: 2,
      modelComplexity: 0,
      minDetectionConfidence: 0.4,
      minTrackingConfidence: 0.4,
    });

    handsRef.current.onResults(onResults);

    cameraRef.current = new Camera(videoRef.current, {
      onFrame: async () => {
        if (handsRef.current && videoRef.current) {
          await handsRef.current.send({ image: videoRef.current });
        }
      },
      width: 480,
      height: 360,
    });

    cameraRef.current.start().then(() => {
      setIsReady(true);
    });
  }, [onResults]);

  const stopCamera = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
    }
    if (handsRef.current) {
      handsRef.current.close();
    }
    setIsReady(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    currentGesture,
    isReady,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
  };
}