import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Clock, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = ["الكل", "الروابط", "كلمات المرور", "الاحتيال", "الخصوصية"];

const LESSONS = [
  { id: 1, title: "كيف تكتشف الرابط الاحتيالي؟", desc: "تعلم قراءة الروابط واكتشاف التلاعب في 60 ثانية.", duration: "60 ثانية", category: "الروابط" },
  { id: 2, title: "أهمية التحقق الثنائي (2FA)", desc: "لماذا لا تكفي كلمة المرور وحدها لحمايتك؟", duration: "60 ثانية", category: "كلمات المرور" },
  { id: 3, title: "ماذا تفعل إذا تعرضت للابتزاز؟", desc: "خطوات عملية للتعامل مع الابتزاز الإلكتروني.", duration: "90 ثانية", category: "الاحتيال" },
  { id: 4, title: "كلمة مرور قوية في 30 ثانية", desc: "طريقة سهلة لإنشاء كلمات مرور معقدة وسهلة الحفظ.", duration: "45 ثانية", category: "كلمات المرور" },
  { id: 5, title: "علامات رسالة التصيد", desc: "كيف تتعرف على إيميل الاحتيال المالي.", duration: "60 ثانية", category: "الاحتيال" },
  { id: 6, title: "لا تشارك رمز OTP أبداً", desc: "خدع المهندسين الاجتماعيين لسرقة رمزك السري.", duration: "60 ثانية", category: "الاحتيال" },
  { id: 7, title: "تأمين حساب واتساب", desc: "إعدادات بسيطة تحميك من سرقة الواتساب.", duration: "60 ثانية", category: "الخصوصية" },
  { id: 8, title: "حماية خصوصيتك على الإنستغرام", desc: "من يرى بياناتك؟ وكيف تتحكم بها.", duration: "75 ثانية", category: "الخصوصية" },
];

export default function Learn() {
  const [activeTab, setActiveTab] = useState("الكل");

  const filteredLessons = activeTab === "الكل" 
    ? LESSONS 
    : LESSONS.filter(l => l.category === activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 w-full">
      <div className="flex flex-col items-center text-center mb-12">
        <div className="bg-primary/10 p-4 rounded-2xl mb-6 border border-primary/20">
          <PlayCircle className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-4">تعلّم في 60 ثانية</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          فيديوهات قصيرة ومكثفة لتسليحك بأهم مهارات الأمان الرقمي في أقل وقت ممكن.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {CATEGORIES.map(cat => (
          <Button
            key={cat}
            variant={activeTab === cat ? "default" : "outline"}
            onClick={() => setActiveTab(cat)}
            className={`rounded-full px-6 font-bold transition-all ${
              activeTab === cat 
                ? "shadow-md shadow-primary/20" 
                : "border-white/10 hover:bg-white/5"
            }`}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredLessons.map((lesson, i) => (
          <motion.div
            key={lesson.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="group cursor-pointer"
          >
            <div className="relative aspect-video bg-black/50 border border-white/10 rounded-2xl overflow-hidden mb-4 group-hover:border-primary/50 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="w-12 h-12 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 ml-1" fill="currentColor" />
                </div>
              </div>

              {/* Duration Badge */}
              <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-white/90">
                <Clock className="w-3.5 h-3.5" />
                {lesson.duration}
              </div>
              
              {/* Category Badge */}
              <div className="absolute top-3 right-3 z-20">
                <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 border-white/5 backdrop-blur-md">
                  {lesson.category}
                </Badge>
              </div>
            </div>
            
            <h3 className="text-lg font-bold mb-1.5 group-hover:text-primary transition-colors line-clamp-1">{lesson.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{lesson.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
