import { useEffect, useState, useRef, useCallback } from 'react';
import { useRoute, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Camera, CheckCircle, Loader } from 'lucide-react';
import { useGestureRecognition } from '../hooks/useGestureRecognition';

export default function Recitation() {
  const [, params] = useRoute('/recitation/:id');
  const [surahData, setSurahData] = useState<any>(null);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [isVerseVisible, setIsVerseVisible] = useState(false);
  const [gestureHoldTime, setGestureHoldTime] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { currentGesture, isReady, videoRef, canvasRef, startCamera } =
    useGestureRecognition();
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (params?.id) {
      fetch(`/assets/data/${params.id}_data.json`)
        .then((res) => res.json())
        .then((data) => setSurahData(data));
    }
  }, [params?.id]);

  useEffect(() => {
    if (surahData && !isReady) {
      startCamera();
    }
  }, [surahData, isReady, startCamera]);

  const advanceToNextVerse = useCallback(() => {
    if (!surahData) return;

    if (currentVerseIndex < surahData.verses.length - 1) {
      setIsTransitioning(true);
      setIsVerseVisible(false);

      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      transitionTimeoutRef.current = setTimeout(() => {
        setCurrentVerseIndex((prev) => prev + 1);
        setIsTransitioning(false);
        setGestureHoldTime(0);
      }, 500);
    } else {
      setShowCompletion(true);
    }
  }, [currentVerseIndex, surahData]);

  useEffect(() => {
    if (!surahData || isVerseVisible || isTransitioning) return;
    const currentVerse = surahData.verses[currentVerseIndex];

    if (currentGesture === currentVerse.gestureKey) {
      if (!holdIntervalRef.current) {
        holdIntervalRef.current = setInterval(() => {
          setGestureHoldTime((prev) => {
            const newTime = prev + 100;
            if (newTime >= 1500) {
              clearInterval(holdIntervalRef.current!);
              holdIntervalRef.current = null;
              setIsVerseVisible(true);
              setGestureHoldTime(0);

              setTimeout(() => {
                advanceToNextVerse();
              }, 3000);
            }
            return newTime;
          });
        }, 100);
      }
    } else {
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
        holdIntervalRef.current = null;
      }
      setGestureHoldTime(0);
    }

    return () => {
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
      }
    };
  }, [
    currentGesture,
    currentVerseIndex,
    isVerseVisible,
    surahData,
    isTransitioning,
    advanceToNextVerse,
  ]);

  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      if (transitionTimeoutRef.current)
        clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  if (!surahData)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader className="text-amber-400 animate-spin" />
      </div>
    );

  const currentVerse = surahData.verses[currentVerseIndex];
  const progress =
    ((currentVerseIndex + (isVerseVisible ? 1 : 0)) / surahData.verses.length) *
    100;

  if (showCompletion)
    return (
      <div
        className="min-h-screen bg-black text-zinc-100 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <CheckCircle className="w-24 h-24 text-amber-400 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-amber-400 mb-4">أحسنت!</h1>
          <Link href="/library">
            <button className="bg-amber-500 hover:bg-amber-600 transition-colors text-black py-4 px-8 rounded-lg font-bold text-xl">
              العودة إلى المكتبة
            </button>
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-4 md:p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-amber-400">
            {surahData.surahName}
          </h1>
          <span className="text-zinc-400">
            {currentVerseIndex + 1} / {surahData.verses.length}
          </span>
        </div>

        <div className="w-full bg-zinc-800 h-3 rounded-full mb-8 overflow-hidden">
          <motion.div
            className="bg-amber-500 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <div className="relative bg-zinc-900 rounded-xl overflow-hidden aspect-video">
            <video
              ref={videoRef}
              className="w-full h-full object-cover scale-x-[-1]"
              autoPlay
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full scale-x-[-1]"
            />

            {!isReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader className="text-amber-400 animate-spin w-8 h-8" />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center space-y-6">
            <AnimatePresence mode="wait">
              {!isVerseVisible ? (
                <motion.div
                  key="hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-zinc-900 p-8 md:p-12 rounded-xl border-2 border-dashed border-zinc-700 text-center"
                >
                  <p className="text-zinc-500 mb-6 text-lg">
                    قم بأداء إشارة الآية
                  </p>

                  <div className="text-3xl md:text-4xl opacity-10 blur-md select-none">
                    {currentVerse.arabicText}
                  </div>

                  {gestureHoldTime > 0 && (
                    <motion.div
                      className="mt-8 bg-amber-500/20 rounded-full h-2 overflow-hidden"
                      initial={{ width: 0 }}
                      animate={{ width: `${(gestureHoldTime / 1500) * 100}%` }}
                      transition={{ duration: 0.1 }}
                    >
                      <div className="bg-amber-500 h-2 rounded-full" />
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="visible"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-zinc-900 p-8 md:p-12 rounded-xl border-2 border-amber-500 text-center relative"
                >
                  <motion.div
                    className="absolute top-4 left-4 text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    آية {currentVerse.verseNumber}
                  </motion.div>

                  <p className="text-4xl md:text-5xl text-amber-400 font-bold mb-6 leading-relaxed">
                    {currentVerse.arabicText}
                  </p>
                  <p className="text-zinc-400 italic text-lg">
                    {currentVerse.translation}
                  </p>

                  <motion.div
                    className="mt-6 bg-amber-500/30 rounded-full h-2 overflow-hidden"
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 3, ease: 'linear' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-zinc-900/50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">الإشارة الحالية:</p>
                  <p className="text-amber-400 font-bold">
                    {currentGesture === 'unknown'
                      ? 'جاري الانتظار...'
                      : currentVerse.gestureName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-zinc-400 text-sm">مطلوب:</p>
                  <p className="text-green-400 font-bold">
                    {currentVerse.gestureName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
