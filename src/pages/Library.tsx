import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';

export default function Library() {
  return (
    <div className="min-h-screen bg-black text-zinc-100" dir="rtl">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href="/">
            <button className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors mb-4">
              <ArrowRight className="w-5 h-5" />
              <span>العودة للرئيسية</span>
            </button>
          </Link>
          <h1 className="text-4xl font-bold text-amber-400 mb-2">مكتبة السور</h1>
          <p className="text-zinc-400">اختر سورة للبدء في الحفظ</p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid gap-4"
        >
          <Link href="/recitation/ikhlas">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-bl from-zinc-900 to-zinc-950 border-2 border-zinc-800 rounded-lg p-6 cursor-pointer hover:border-amber-500 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <BookOpen className="w-6 h-6 text-amber-400" />
                    <h2 className="text-2xl font-bold text-zinc-100">سورة الإخلاص</h2>
                  </div>
                  <p className="text-zinc-400 mb-2">Al-Ikhlas (The Sincerity)</p>
                  <div className="flex gap-4 text-sm text-zinc-500">
                    <span>السورة: 112</span>
                    <span>الآيات: 4</span>
                  </div>
                </div>
                <div className="bg-amber-500 text-black px-4 py-2 rounded-lg font-bold text-sm">
                  ابدأ
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <p className="text-xs text-zinc-600">
                  تعلم سورة الإخلاص باستخدام 4 إشارات من لغة الإشارة العربية
                </p>
              </div>
            </motion.div>
          </Link>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-zinc-900/50 border-2 border-zinc-800 border-dashed rounded-lg p-6 opacity-50"
          >
            <div className="text-center">
              <p className="text-zinc-500 mb-2">المزيد من السور قريباً</p>
              <p className="text-xs text-zinc-700">More Surahs coming soon</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
