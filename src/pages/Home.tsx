import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, HelpCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col" dir="rtl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex-1 flex flex-col items-center justify-center px-6 py-12"
      >
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-16 h-16 text-amber-400" />
          </div>
          <h1 className="text-5xl font-bold text-amber-400 mb-3">لغة النور</h1>
          <p className="text-xl text-zinc-400">Lumen of Light</p>
          <p className="text-sm text-zinc-500 mt-4 max-w-md mx-auto leading-relaxed">
            تعلم القرآن الكريم بلغة الإشارة العربية
          </p>
          <p className="text-xs text-zinc-600 mt-2">Learn the Quran with Arabic Sign Language</p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid gap-4 w-full max-w-md"
        >
          <Link href="/library">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-l from-amber-500 to-amber-600 text-black py-4 px-6 rounded-lg font-bold text-lg shadow-lg flex items-center justify-center gap-3"
            >
              <BookOpen className="w-6 h-6" />
              <span>ابدأ الحفظ</span>
            </motion.button>
          </Link>

          <Link href="/how-it-works">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-zinc-800 text-amber-400 py-4 px-6 rounded-lg font-bold text-lg border-2 border-zinc-700 flex items-center justify-center gap-3"
            >
              <HelpCircle className="w-6 h-6" />
              <span>كيف يعمل؟</span>
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-zinc-600 text-sm">جائزة البرهان للتطوير التقني</p>
          <p className="text-zinc-700 text-xs mt-1">Al-Burhan Award for Technical Development</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
