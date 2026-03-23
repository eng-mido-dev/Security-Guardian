import { motion } from "framer-motion";
import { Shield, Target, Users, Zap, Lock, BookOpen, AlertTriangle } from "lucide-react";
import { useLang } from "@/context/LangContext";

export default function About() {
  const { isRTL } = useLang();

  const whatWeOffer = isRTL
    ? [
        "أدوات فحص فوري للروابط المشبوهة",
        "اختبارات تقييم مستوى الأمان الشخصي",
        "دروس فيديو قصيرة ومكثفة (60 ثانية)",
        "قوائم تحقق عملية لضبط إعدادات الخصوصية",
        "محاكي لرسائل الاحتيال للتدريب العملي",
        "بوابة للإبلاغ عن المواقع الوهمية",
      ]
    : [
        "Instant link scanning tools for suspicious URLs",
        "Personal security level assessment tests",
        "Short, intensive video lessons (60 seconds)",
        "Practical checklists for configuring privacy settings",
        "Phishing message simulator for hands-on training",
        "A portal to report fake websites",
      ];

  const whoIsItFor = isRTL
    ? [
        "الشباب والطلاب والمستخدمين اليوميين للإنترنت",
        "الأشخاص غير المتخصصين في التقنية",
        "كل من تعرض أو يخشى التعرض للاحتيال المالي",
        "صناع المحتوى والمؤثرين لحماية حساباتهم",
        "الآباء والأمهات الباحثين عن حماية عائلاتهم رقمياً",
      ]
    : [
        "Youth, students, and everyday internet users",
        "Non-technical individuals",
        "Anyone who has been or fears falling victim to financial fraud",
        "Content creators and influencers protecting their accounts",
        "Parents seeking to digitally protect their families",
      ];

  const values = isRTL
    ? [
        { icon: <BookOpen className="w-8 h-8 text-primary mx-auto mb-4" />, title: "البساطة", desc: "تبسيط المفاهيم المعقدة وجعل الأمان الرقمي مفهوماً للجميع." },
        { icon: <Lock className="w-8 h-8 text-primary mx-auto mb-4" />, title: "الخصوصية", desc: "بياناتك ملكك. لا نجمع بيانات شخصية غير ضرورية ونحترم خصوصيتك." },
        { icon: <Shield className="w-8 h-8 text-primary mx-auto mb-4" />, title: "العملية", desc: "نركز على الحلول القابلة للتطبيق الفوري لحمايتك بدلاً من التنظير المفرط." },
      ]
    : [
        { icon: <BookOpen className="w-8 h-8 text-primary mx-auto mb-4" />, title: "Simplicity", desc: "Simplifying complex concepts and making digital security understandable for everyone." },
        { icon: <Lock className="w-8 h-8 text-primary mx-auto mb-4" />, title: "Privacy", desc: "Your data belongs to you. We collect no unnecessary personal data and respect your privacy." },
        { icon: <Shield className="w-8 h-8 text-primary mx-auto mb-4" />, title: "Practicality", desc: "We focus on immediately applicable solutions to protect you rather than excessive theorizing." },
      ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 w-full">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex bg-primary/10 p-5 rounded-full mb-6 border border-primary/20">
          <Shield className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-black mb-4">
          {isRTL ? "عن منصة حُراس" : "About Horras Platform"}
        </h1>
        <p className="text-xl text-muted-foreground">
          {isRTL
            ? "منصة رقمية عربية للتوعية بالأمن السيبراني وحماية الشباب"
            : "An Arabic digital platform for cybersecurity awareness and youth protection"}
        </p>
      </div>

      {/* Mission */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-[2rem] p-8 md:p-12 mb-8 border-white/5"
      >
        <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
          <Target className="text-primary w-6 h-6" />
          {isRTL ? "رسالتنا" : "Our Mission"}
        </h2>
        {isRTL ? (
          <>
            <p className="text-muted-foreground leading-relaxed text-lg mb-6">
              انطلقت منصة "حُراس" إيماناً منا بأن الأمان الرقمي ليس رفاهية، بل هو حق أساسي ومهارة حياتية ضرورية في العصر الحديث. في ظل تزايد الهجمات الإلكترونية وعمليات الاحتيال المعقدة، لاحظنا نقصاً في المحتوى العربي المبسط القادر على توعية الشباب بطريقة تفاعلية.
            </p>
            <p className="text-muted-foreground leading-relaxed text-lg">
              لذلك، صممنا هذه المنصة لتكون درعك الواقي؛ نقدم لك المعرفة التقنية بلغة سهلة، وأدوات عملية لفحص الروابط وتقييم مستوى أمانك، في بيئة خالية من المصطلحات المعقدة، لنبني معاً مجتمعاً رقمياً عربياً أكثر وعياً وأماناً.
            </p>
          </>
        ) : (
          <>
            <p className="text-muted-foreground leading-relaxed text-lg mb-6">
              Horras was launched with the belief that digital security is not a luxury — it is a fundamental right and a necessary life skill in the modern age. Amid rising cyberattacks and sophisticated scams, we noticed a lack of simplified Arabic content capable of raising youth awareness in an interactive way.
            </p>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Therefore, we designed this platform to be your protective shield — delivering technical knowledge in plain language, practical tools for link scanning and security assessment, in an environment free from complex jargon, to build together a more aware and secure Arab digital community.
            </p>
          </>
        )}
      </motion.div>

      {/* What we offer + Who is it for */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-3xl p-8 border-white/5"
        >
          <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Zap className="text-primary w-5 h-5" />
            {isRTL ? "ماذا نقدم؟" : "What We Offer"}
          </h3>
          <ul className="space-y-4">
            {whatWeOffer.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl p-8 border-white/5"
        >
          <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Users className="text-primary w-5 h-5" />
            {isRTL ? "لمن هذه المنصة؟" : "Who Is This Platform For?"}
          </h3>
          <ul className="space-y-4">
            {whoIsItFor.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Values */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold mb-6 px-2">
          {isRTL ? "قيمنا" : "Our Values"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <div key={i} className="bg-card/50 border border-white/5 rounded-2xl p-6 text-center">
              {v.icon}
              <h4 className="font-bold mb-2">{v.title}</h4>
              <p className="text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Legal disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 flex items-start gap-4"
      >
        <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
        <div>
          <h4 className="font-bold text-amber-500 mb-2">
            {isRTL ? "تنويه قانوني ومهم" : "Important Legal Disclaimer"}
          </h4>
          <p className="text-sm text-amber-500/80 leading-relaxed">
            {isRTL
              ? "منصة حراس هي مبادرة تعليمية وتوعوية. الأدوات المتوفرة (مثل فاحص الروابط) تعتمد على آليات استدلالية وقد لا تكون دقيقة 100%. استخدامك للمنصة لا يغني عن استخدام برامج الحماية الأساسية والتبليغ المباشر للجهات الأمنية المختصة في حالة التعرض لاختراق فعلي."
              : "Horras is an educational and awareness initiative. Available tools (such as the link scanner) rely on heuristic mechanisms and may not be 100% accurate. Using the platform does not replace using basic protection software or directly reporting to the appropriate security authorities in the event of an actual breach."}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
