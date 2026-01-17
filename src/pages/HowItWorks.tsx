import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, Hand, Eye, CheckCircle } from 'lucide-react';

export default function HowItWorks() {
  const gestures = [
    {
      name: 'التوحيد (Tawhid)',
      nameEn: 'Oneness',
      description: 'أشر بإصبع السبابة للأعلى',
      descriptionEn: 'Point your index finger upward',
      verse: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ',
      icon: '☝️',
    },
    {
      name: 'الأبدي (Eternal)',
      nameEn: 'Eternal',
      description: 'راحتا اليدين باتجاه الأمام',
      descriptionEn: 'Palms facing forward',
      verse: 'ٱللَّهُ ٱلصَّمَدُ',
      icon: '🙌',
    },
    {
      name: 'النفي (Negation)',
      nameEn: 'Negation',
      description: 'حرك يديك بعيداً عن بعضهما',
      descriptionEn: 'Move your hands apart',
      verse: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
      icon: '↔️',
    },
    {
      name: 'المساواة (Equality)',
      nameEn: 'Equality',
      description: 'المس أطراف أصابعك معاً',
      descriptionEn: 'Touch your fingertips together',
      verse: 'وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ',
      icon: '🤲',
    },
  ];

  const steps = [
    {
      icon: Eye,
      title: 'افتح الكاميرا',
      titleEn: 'Open Camera',
      description: 'يستخدم التطبيق الكاميرا للتعرف على حركات يديك',
    },
    {
      icon: Hand,
      title: 'اصنع الإشارة',
      titleEn: 'Make the Sign',
      description: 'قم بأداء الإشارة الصحيحة لمدة 1.5 ثانية',
    },
    {
      icon: CheckCircle,
      title: 'اكشف الآية',
      titleEn: 'Reveal Verse',
      description: 'ستظهر الآية تلقائياً عند التعرف الصحيح',
    },
  ];

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
          <h1 className="text-4xl font-bold text-amber-400 mb-2">كيف يعمل التطبيق؟</h1>
          <p className="text-zinc-400">How It Works</p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-zinc-100 mb-6">خطوات الاستخدام</h2>
          <div className="grid gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex items-start gap-4"
              >
                <div className="bg-amber-500 text-black rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-zinc-100 mb-1">{step.title}</h3>
                  <p className="text-sm text-zinc-500 mb-2">{step.titleEn}</p>
                  <p className="text-zinc-400">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-zinc-100 mb-6">الإشارات المستخدمة</h2>
          <div className="grid gap-4">
            {gestures.map((gesture, index) => (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                className="bg-gradient-to-bl from-zinc-900 to-zinc-950 border border-zinc-800 rounded-lg p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{gesture.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-amber-400 mb-1">{gesture.name}</h3>
                    <p className="text-sm text-zinc-500 mb-3">{gesture.nameEn}</p>
                    <p className="text-zinc-300 mb-2">{gesture.description}</p>
                    <p className="text-sm text-zinc-500 mb-3">{gesture.descriptionEn}</p>
                    <div className="bg-zinc-800 rounded-lg p-3 border-r-4 border-amber-500">
                      <p className="text-zinc-100 text-lg">{gesture.verse}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="mt-12 text-center"
        >
          <Link href="/library">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-l from-amber-500 to-amber-600 text-black py-4 px-8 rounded-lg font-bold text-lg shadow-lg"
            >
              ابدأ التعلم الآن
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
