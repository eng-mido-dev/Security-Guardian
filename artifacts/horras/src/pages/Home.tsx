import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { 
  ShieldCheck, 
  Search, 
  ClipboardCheck, 
  AlertTriangle, 
  PlayCircle, 
  Smartphone,
  ChevronLeft,
  Users,
  Target,
  FileWarning,
  Link2
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [, setLocation] = useLocation();

  const stats = [
    { icon: <Users className="w-5 h-5" />, value: "+5,200", label: "مستخدم نشط" },
    { icon: <Target className="w-5 h-5" />, value: "89%", label: "نسبة الدقة" },
    { icon: <FileWarning className="w-5 h-5" />, value: "847", label: "بلاغ تم تقديمه" },
    { icon: <Link2 className="w-5 h-5" />, value: "+13,453", label: "رابط تم فحصه" },
  ];

  const features = [
    { icon: <Search className="w-6 h-6" />, title: "فاحص الرابط", desc: "تأكد من سلامة الروابط قبل الضغط عليها لتجنب الاختراق", path: "/check-link" },
    { icon: <ClipboardCheck className="w-6 h-6" />, title: "الاختبار الشخصي", desc: "اكتشف مدى وعيك الأمني من خلال اختبار سريع وتفاعلي", path: "/security-test" },
    { icon: <AlertTriangle className="w-6 h-6" />, title: "الإبلاغ عن الاحتيال", desc: "شارك في حماية المجتمع بالإبلاغ عن المواقع والحسابات المزيفة", path: "/report" },
    { icon: <ShieldCheck className="w-6 h-6" />, title: "أدوات الأمان الرقمي", desc: "قوائم تحقق عملية لتأمين حساباتك وأجهزتك المختلفة", path: "/tools" },
    { icon: <Smartphone className="w-6 h-6" />, title: "محاكي الاحتيال", desc: "تدرب على اكتشاف رسائل التصيد في بيئة محاكاة آمنة", path: "/learn" },
    { icon: <PlayCircle className="w-6 h-6" />, title: "تعلّم في 60 ثانية", desc: "فيديوهات قصيرة ومكثفة لتعلم أهم ممارسات الأمان", path: "/learn" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Cybersecurity grid background" 
            className="w-full h-full object-cover opacity-40 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              متاح مجاناً للجميع
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight"
            >
              احمِ نفسك من <span className="gold-gradient-text">الاحتيال الإلكتروني</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              منصة حراس توفر لك الأدوات والمعرفة اللازمة لتصفح الإنترنت بأمان. اختبر أمانك، افحص الروابط، وتعلّم كيف تحمي بياناتك.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Button size="lg" className="rounded-xl font-bold px-8 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all shadow-lg shadow-primary/20" onClick={() => setLocation("/check-link")}>
                افحص رابطاً
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl font-bold px-8 border-white/20 bg-white/5 hover:bg-white/10 hover:scale-105 transition-all backdrop-blur-md" onClick={() => setLocation("/security-test")}>
                اختبر أمانك
              </Button>
              <Button size="lg" variant="ghost" className="rounded-xl font-bold px-8 hover:bg-white/5 transition-all" onClick={() => setLocation("/report")}>
                بلّغ عن احتيال
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-x divide-x-reverse divide-white/5">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex flex-col items-center text-center px-4"
              >
                <div className="bg-primary/10 p-3 rounded-2xl text-primary mb-4 border border-primary/20">
                  {stat.icon}
                </div>
                <h3 className="text-3xl font-black mb-1">{stat.value}</h3>
                <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">ماذا يمكنك أن تفعل؟</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">مجموعة متكاملة من الأدوات لحمايتك في العالم الرقمي</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                onClick={() => setLocation(feature.path)}
                className="glass-card p-8 rounded-3xl cursor-pointer group hover:bg-white/[0.04] transition-all"
              >
                <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center text-primary mb-6 border border-primary/20 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">{feature.desc}</p>
                <div className="flex items-center text-primary text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                  ابدأ الآن <ChevronLeft className="w-4 h-4 mr-1" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card rounded-[2.5rem] p-10 md:p-16 text-center bg-gradient-to-b from-primary/10 to-transparent border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
            
            <h2 className="text-3xl md:text-5xl font-black mb-6">ابدأ رحلتك نحو الأمان الرقمي</h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              لا تنتظر حتى تقع ضحية للاحتيال. قم بتقييم مستوى أمانك الحالي وتعرف على الخطوات اللازمة لحماية نفسك.
            </p>
            <Button 
              size="lg" 
              className="rounded-xl font-bold px-10 py-6 text-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all shadow-xl shadow-primary/20"
              onClick={() => setLocation("/security-test")}
            >
              ابدأ الاختبار الأمني الآن
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
