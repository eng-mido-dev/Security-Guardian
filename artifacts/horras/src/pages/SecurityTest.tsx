import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardCheck, ArrowLeft, ArrowRight, ShieldCheck, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/context/AppContext";
import confetti from "canvas-confetti";

const QUESTIONS = [
  {
    question: "وصلتك رسالة تطلب تحديث بياناتك البنكية فوراً مع رابط. ماذا تفعل؟",
    options: [
      "أضغط على الرابط وأحدث بياناتي فوراً",
      "أتجاهل الرسالة وأتصل بالبنك مباشرة للتأكد",
      "أرسل بياناتي عبر الرد على الرسالة",
      "أضغط على الرابط لأرى ماذا سيحدث"
    ],
    correct: 1
  },
  {
    question: "أي من كلمات المرور التالية تعتبر الأقوى والأكثر أماناً؟",
    options: [
      "password123",
      "Ahmed1990",
      "12345678",
      "xP@9$mK2#vLq!"
    ],
    correct: 3
  },
  {
    question: "ماذا تعني خاصية المصادقة الثنائية (2FA)؟",
    options: [
      "امتلاك حسابين على نفس الموقع",
      "تسجيل الدخول من جهازين مختلفين",
      "إضافة خطوة تحقق ثانية (مثل كود SMS) بعد كلمة المرور",
      "استخدام كلمة مرور مكونة من شقين"
    ],
    correct: 2
  },
  {
    question: "أثناء جلوسك في المقهى، أردت استخدام شبكة الواي فاي العامة المفتوحة. ما هو التصرف الآمن؟",
    options: [
      "أستخدمها لإجراء تحويلات بنكية لأنها سريعة",
      "أتجنب الدخول للحسابات الحساسة واستخدم VPN إن أمكن",
      "أشارك ملفاتي مع الشبكة ليسهل الوصول إليها",
      "لا يوجد أي خطر من شبكات الواي فاي العامة"
    ],
    correct: 1
  },
  {
    question: "ما هو الفيشينج (Phishing)؟",
    options: [
      "برنامج لحماية الكمبيوتر من الفيروسات",
      "لعبة إلكترونية مشهورة",
      "محاولة خداعك للحصول على معلوماتك الشخصية عبر رسائل مزيفة",
      "تطبيق لتحميل الملفات بسرعة"
    ],
    correct: 2
  },
  {
    question: "شخص يدعي أنه موظف دعم فني ويطلب منك رمز OTP الذي وصلك للتو لحل مشكلة بحسابك:",
    options: [
      "أعطيه الرمز فوراً لحل المشكلة",
      "أرفض بشدة، فلا يجب مشاركة رمز OTP مع أي شخص أبداً",
      "أطلب منه أن يرسل الرمز مرة أخرى لأتأكد",
      "أعطيه نصف الرمز فقط"
    ],
    correct: 1
  },
  {
    question: "ما هو أفضل مكان لحفظ كلمات المرور الخاصة بك؟",
    options: [
      "في تطبيق مدير كلمات المرور (Password Manager) موثوق",
      "مكتوبة في ورقة بجانب الكمبيوتر",
      "في ملاحظات الهاتف غير المحمية بكلمة مرور",
      "أستخدم نفس كلمة المرور لكل شيء كي لا أنساها"
    ],
    correct: 0
  },
  {
    question: "لاحظت أن الرابط يبدأ بـ http:// بدلاً من https://، ماذا يعني ذلك؟",
    options: [
      "الموقع سريع جداً",
      "الاتصال بينك وبين الموقع غير مشفر ويمكن التنصت عليه",
      "هذا موقع حكومي رسمي",
      "الموقع مخصص للهواتف المحمولة فقط"
    ],
    correct: 1
  },
  {
    question: "كيف تحمي حساباتك على وسائل التواصل الاجتماعي؟",
    options: [
      "أقبل جميع طلبات الصداقة لزيادة المتابعين",
      "أشارك موقعي الحالي في كل منشور",
      "أجعل الحساب خاصاً وأراجع إعدادات الخصوصية بانتظام",
      "أنشر رقم هاتفي للتواصل بسهولة"
    ],
    correct: 2
  },
  {
    question: "متى يجب عليك تحديث نظام التشغيل والتطبيقات في جهازك؟",
    options: [
      "عندما يتوقف التطبيق عن العمل فقط",
      "كل سنة مرة واحدة",
      "بانتظام وفور توفر التحديثات لأنها تسد الثغرات الأمنية",
      "لا أقوم بالتحديث أبداً لأنه يأخذ مساحة"
    ],
    correct: 2
  }
];

export default function SecurityTest() {
  const [, setLocation] = useLocation();
  const { setQuizScore } = useApp();
  
  const [step, setStep] = useState<"intro" | "quiz" | "result">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const startQuiz = () => setStep("quiz");

  const handleNext = () => {
    if (selectedOption === null) return;
    
    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = (finalAnswers: number[]) => {
    // Calculate score
    const correctCount = finalAnswers.reduce((acc, ans, idx) => {
      return acc + (ans === QUESTIONS[idx].correct ? 1 : 0);
    }, 0);
    
    const score = Math.round((correctCount / QUESTIONS.length) * 100);
    setQuizScore(score);
    setStep("result");
    
    // Confetti effect
    if (score > 50) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFB800', '#10B981', '#ffffff']
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-20 w-full flex-grow flex flex-col justify-center">
      
      {step === "intro" && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[2rem] p-10 text-center relative overflow-hidden"
        >
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/20 blur-[80px] rounded-full pointer-events-none"></div>
          
          <div className="inline-flex bg-primary/10 p-5 rounded-3xl mb-8 border border-primary/20">
            <ClipboardCheck className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="text-4xl font-black mb-6">اختبر مستوى أمانك الرقمي</h1>
          
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            اختبار تفاعلي صُمم لتقييم مدى وعيك بالمخاطر السيبرانية ومعرفتك بأساسيات الحماية الرقمية.
          </p>
          
          <div className="grid grid-cols-3 gap-4 mb-10 text-sm font-medium">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <span className="block text-primary text-2xl font-bold mb-1">10</span>
              أسئلة
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <span className="block text-primary text-2xl font-bold mb-1">3-5</span>
              دقائق
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <span className="block text-primary text-2xl font-bold mb-1">100%</span>
              خصوصية
            </div>
          </div>
          
          <Button size="lg" className="w-full md:w-auto px-12 py-6 text-lg rounded-xl font-bold" onClick={startQuiz}>
            ابدأ الاختبار <ArrowLeft className="mr-2 w-5 h-5" />
          </Button>
        </motion.div>
      )}

      {step === "quiz" && (
        <div className="w-full">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground font-bold">السؤال {currentQ + 1} من {QUESTIONS.length}</span>
            </div>
            <div className="w-1/2">
              <Progress value={((currentQ) / QUESTIONS.length) * 100} className="h-2 [&>div]:bg-primary" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="glass-card rounded-[2rem] p-8 md:p-12 border-primary/20"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-8 leading-relaxed">
                {QUESTIONS[currentQ].question}
              </h2>
              
              <div className="flex flex-col gap-4">
                {QUESTIONS[currentQ].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedOption(i)}
                    className={`text-right p-5 rounded-xl border transition-all duration-200 text-lg font-medium ${
                      selectedOption === i 
                        ? "bg-primary/20 border-primary text-white shadow-[0_0_15px_rgba(255,184,0,0.15)] translate-x-2" 
                        : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div className="mt-10 flex justify-end">
                <Button 
                  size="lg" 
                  onClick={handleNext} 
                  disabled={selectedOption === null}
                  className="rounded-xl px-10 font-bold"
                >
                  {currentQ === QUESTIONS.length - 1 ? "إنهاء الاختبار" : "التالي"} <ArrowLeft className="mr-2 w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {step === "result" && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-[2rem] p-10 text-center border-primary/30"
        >
          <div className="inline-flex bg-primary/20 p-6 rounded-full mb-6 border border-primary/30 shadow-[0_0_30px_rgba(255,184,0,0.3)]">
            <Trophy className="w-12 h-12 text-primary" />
          </div>
          
          <h2 className="text-3xl font-black mb-2">اكتمل الاختبار!</h2>
          <p className="text-muted-foreground mb-8">تم إضافة النتيجة إلى ملفك الشخصي</p>
          
          <Button 
            size="lg" 
            className="rounded-xl px-10 font-bold bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setLocation("/dashboard")}
          >
            اذهب إلى لوحة التحكم لرؤية النتيجة <ArrowLeft className="mr-2 w-5 h-5" />
          </Button>
        </motion.div>
      )}

    </div>
  );
}
