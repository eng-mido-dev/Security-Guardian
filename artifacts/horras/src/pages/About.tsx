import { motion } from "framer-motion";
import { Shield, Target, Users, Zap, Lock, BookOpen, AlertTriangle } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 w-full">
      <div className="text-center mb-16">
        <div className="inline-flex bg-primary/10 p-5 rounded-full mb-6 border border-primary/20">
          <Shield className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-black mb-4">عن منصة حراس</h1>
        <p className="text-xl text-muted-foreground">منصة رقمية عربية للتوعية بالأمن السيبراني وحماية الشباب</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-[2rem] p-8 md:p-12 mb-8 border-white/5">
        <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
          <Target className="text-primary w-6 h-6" /> رسالتنا
        </h2>
        <p className="text-muted-foreground leading-relaxed text-lg mb-6">
          انطلقت منصة "حراس" إيماناً منا بأن الأمان الرقمي ليس رفاهية، بل هو حق أساسي ومهارة حياتية ضرورية في العصر الحديث. في ظل تزايد الهجمات الإلكترونية وعمليات الاحتيال المعقدة، لاحظنا نقصاً في المحتوى العربي المبسط القادر على توعية الشباب بطريقة تفاعلية.
        </p>
        <p className="text-muted-foreground leading-relaxed text-lg">
          لذلك، صممنا هذه المنصة لتكون درعك الواقي؛ نقدم لك المعرفة التقنية بلغة سهلة، وأدوات عملية لفحص الروابط وتقييم مستوى أمانك، في بيئة خالية من المصطلحات المعقدة، لنبني معاً مجتمعاً رقمياً عربياً أكثر وعياً وأماناً.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-3xl p-8 border-white/5">
          <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Zap className="text-primary w-5 h-5" /> ماذا نقدم؟
          </h3>
          <ul className="space-y-4">
            {[
              "أدوات فحص فوري للروابط المشبوهة",
              "اختبارات تقييم مستوى الأمان الشخصي",
              "دروس فيديو قصيرة ومكثفة (60 ثانية)",
              "قوائم تحقق عملية لضبط إعدادات الخصوصية",
              "محاكي لرسائل الاحتيال للتدريب العملي",
              "بوابة للإبلاغ عن المواقع الوهمية"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-3xl p-8 border-white/5">
          <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Users className="text-primary w-5 h-5" /> لمن هذه المنصة؟
          </h3>
          <ul className="space-y-4">
            {[
              "الشباب والطلاب والمستخدمين اليوميين للإنترنت",
              "الأشخاص غير المتخصصين في التقنية",
              "كل من تعرض أو يخشى التعرض للاحتيال المالي",
              "صناع المحتوى والمؤثرين لحماية حساباتهم",
              "الآباء والأمهات الباحثين عن حماية عائلاتهم رقمياً"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
        <h2 className="text-2xl font-bold mb-6 px-2">قيمنا</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card/50 border border-white/5 rounded-2xl p-6 text-center">
            <BookOpen className="w-8 h-8 text-primary mx-auto mb-4" />
            <h4 className="font-bold mb-2">البساطة</h4>
            <p className="text-sm text-muted-foreground">تبسيط المفاهيم المعقدة وجعل الأمان الرقمي مفهوماً للجميع.</p>
          </div>
          <div className="bg-card/50 border border-white/5 rounded-2xl p-6 text-center">
            <Lock className="w-8 h-8 text-primary mx-auto mb-4" />
            <h4 className="font-bold mb-2">الخصوصية</h4>
            <p className="text-sm text-muted-foreground">بياناتك ملكك. لا نجمع بيانات شخصية غير ضرورية ونحترم خصوصيتك.</p>
          </div>
          <div className="bg-card/50 border border-white/5 rounded-2xl p-6 text-center">
            <Shield className="w-8 h-8 text-primary mx-auto mb-4" />
            <h4 className="font-bold mb-2">العملية</h4>
            <p className="text-sm text-muted-foreground">نركز على الحلول القابلة للتطبيق الفوري لحمايتك بدلاً من التنظير المفرط.</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
        <div>
          <h4 className="font-bold text-amber-500 mb-2">تنويه قانوني ومهم</h4>
          <p className="text-sm text-amber-500/80 leading-relaxed">
            منصة حراس هي مبادرة تعليمية وتوعوية. الأدوات المتوفرة (مثل فاحص الروابط) تعتمد على آليات استدلالية وقد لا تكون دقيقة 100%. استخدامك للمنصة لا يغني عن استخدام برامج الحماية الأساسية والتبليغ المباشر للجهات الأمنية المختصة في حالة التعرض لاختراق فعلي.
          </p>
        </div>
      </motion.div>

    </div>
  );
}
