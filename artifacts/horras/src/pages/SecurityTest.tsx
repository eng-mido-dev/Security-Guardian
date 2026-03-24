import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardCheck, ArrowLeft, ArrowRight, ShieldCheck, Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/context/AppContext";
import { useLang } from "@/context/LangContext";
import LoginModal from "@/components/LoginModal";
import confetti from "canvas-confetti";

interface Question {
  question: string;
  questionEn: string;
  options: string[];
  optionsEn: string[];
  correct: number;
  category: string;
  categoryAr: string;
}

const QUESTIONS: Question[] = [
  {
    question: "وصلتك رسالة تطلب تحديث بياناتك البنكية فوراً مع رابط. ماذا تفعل؟",
    questionEn: "You received a message asking you to update your banking details immediately via a link. What do you do?",
    options: ["أضغط على الرابط وأحدث بياناتي فوراً", "أتجاهل الرسالة وأتصل بالبنك مباشرة للتأكد", "أرسل بياناتي عبر الرد على الرسالة", "أضغط على الرابط لأرى ماذا سيحدث"],
    optionsEn: ["Click the link and update my details immediately", "Ignore the message and call the bank directly to verify", "Send my details by replying to the message", "Click the link just to see what happens"],
    correct: 1, category: "Phishing", categoryAr: "التصيد الاحتيالي",
  },
  {
    question: "أي من كلمات المرور التالية تعتبر الأقوى والأكثر أماناً؟",
    questionEn: "Which of the following passwords is considered the strongest and most secure?",
    options: ["password123", "Ahmed1990", "12345678", "xP@9$mK2#vLq!"],
    optionsEn: ["password123", "Ahmed1990", "12345678", "xP@9$mK2#vLq!"],
    correct: 3, category: "Password Security", categoryAr: "أمان كلمة المرور",
  },
  {
    question: "ماذا تعني خاصية المصادقة الثنائية (2FA)؟",
    questionEn: "What does Two-Factor Authentication (2FA) mean?",
    options: ["امتلاك حسابين على نفس الموقع", "تسجيل الدخول من جهازين مختلفين", "إضافة خطوة تحقق ثانية (مثل كود SMS) بعد كلمة المرور", "استخدام كلمة مرور مكونة من شقين"],
    optionsEn: ["Having two accounts on the same site", "Logging in from two different devices", "Adding a second verification step (like an SMS code) after your password", "Using a password made of two parts"],
    correct: 2, category: "2FA", categoryAr: "المصادقة الثنائية",
  },
  {
    question: "أثناء جلوسك في المقهى، أردت استخدام شبكة الواي فاي العامة المفتوحة. ما هو التصرف الآمن؟",
    questionEn: "You're at a café and want to use the open public Wi-Fi. What is the safe thing to do?",
    options: ["أستخدمها لإجراء تحويلات بنكية لأنها سريعة", "أتجنب الدخول للحسابات الحساسة واستخدم VPN إن أمكن", "أشارك ملفاتي مع الشبكة ليسهل الوصول إليها", "لا يوجد أي خطر من شبكات الواي فاي العامة"],
    optionsEn: ["Use it for bank transfers because it's fast", "Avoid accessing sensitive accounts and use a VPN if possible", "Share my files with the network for easy access", "There is no risk from public Wi-Fi networks"],
    correct: 1, category: "Public Wi-Fi", categoryAr: "الواي فاي العام",
  },
  {
    question: "ما هو الفيشينج (Phishing)؟",
    questionEn: "What is Phishing?",
    options: ["برنامج لحماية الكمبيوتر من الفيروسات", "لعبة إلكترونية مشهورة", "محاولة خداعك للحصول على معلوماتك الشخصية عبر رسائل مزيفة", "تطبيق لتحميل الملفات بسرعة"],
    optionsEn: ["A program to protect your computer from viruses", "A popular video game", "An attempt to trick you into revealing personal information via fake messages", "An app for fast file downloads"],
    correct: 2, category: "Phishing", categoryAr: "التصيد الاحتيالي",
  },
  {
    question: "شخص يدعي أنه موظف دعم فني ويطلب منك رمز OTP الذي وصلك للتو لحل مشكلة بحسابك:",
    questionEn: "Someone claiming to be a tech support agent asks for the OTP code you just received to fix an issue with your account:",
    options: ["أعطيه الرمز فوراً لحل المشكلة", "أرفض بشدة، فلا يجب مشاركة رمز OTP مع أي شخص أبداً", "أطلب منه أن يرسل الرمز مرة أخرى لأتأكد", "أعطيه نصف الرمز فقط"],
    optionsEn: ["Give him the code immediately to solve the problem", "Firmly refuse — you should never share an OTP with anyone", "Ask him to resend the code so I can verify", "Give him only half the code"],
    correct: 1, category: "Social Engineering", categoryAr: "الهندسة الاجتماعية",
  },
  {
    question: "ما هو أفضل مكان لحفظ كلمات المرور الخاصة بك؟",
    questionEn: "What is the best place to store your passwords?",
    options: ["في تطبيق مدير كلمات المرور (Password Manager) موثوق", "مكتوبة في ورقة بجانب الكمبيوتر", "في ملاحظات الهاتف غير المحمية بكلمة مرور", "أستخدم نفس كلمة المرور لكل شيء كي لا أنساها"],
    optionsEn: ["In a trusted Password Manager app", "Written on a piece of paper next to the computer", "In phone notes not protected by a password", "I use the same password for everything so I don't forget"],
    correct: 0, category: "Password Security", categoryAr: "أمان كلمة المرور",
  },
  {
    question: "لاحظت أن الرابط يبدأ بـ http:// بدلاً من https://، ماذا يعني ذلك؟",
    questionEn: "You notice a link starts with http:// instead of https://. What does that mean?",
    options: ["الموقع سريع جداً", "الاتصال بينك وبين الموقع غير مشفر ويمكن التنصت عليه", "هذا موقع حكومي رسمي", "الموقع مخصص للهواتف المحمولة فقط"],
    optionsEn: ["The site is very fast", "The connection between you and the site is unencrypted and can be intercepted", "This is an official government site", "The site is designed for mobile phones only"],
    correct: 1, category: "Phishing", categoryAr: "التصيد الاحتيالي",
  },
  {
    question: "كيف تحمي حساباتك على وسائل التواصل الاجتماعي؟",
    questionEn: "How do you protect your social media accounts?",
    options: ["أقبل جميع طلبات الصداقة لزيادة المتابعين", "أشارك موقعي الحالي في كل منشور", "أجعل الحساب خاصاً وأراجع إعدادات الخصوصية بانتظام", "أنشر رقم هاتفي للتواصل بسهولة"],
    optionsEn: ["Accept all friend requests to grow my followers", "Share my current location on every post", "Set the account to private and review privacy settings regularly", "Post my phone number for easy contact"],
    correct: 2, category: "Privacy", categoryAr: "الخصوصية",
  },
  {
    question: "متى يجب عليك تحديث نظام التشغيل والتطبيقات في جهازك؟",
    questionEn: "When should you update your device's operating system and applications?",
    options: ["عندما يتوقف التطبيق عن العمل فقط", "كل سنة مرة واحدة", "بانتظام وفور توفر التحديثات لأنها تسد الثغرات الأمنية", "لا أقوم بالتحديث أبداً لأنه يأخذ مساحة"],
    optionsEn: ["Only when the app stops working", "Once a year", "Regularly as soon as updates are available — they patch security vulnerabilities", "I never update because it takes up space"],
    correct: 2, category: "Software Updates", categoryAr: "تحديثات البرامج",
  },
];

const RECOMMENDATIONS: Record<string, { label: string; labelEn: string; color: string; icon: string; tips: string[]; tipsEn: string[] }> = {
  expert: {
    label: "خبير في الأمن الرقمي", labelEn: "Digital Security Expert", color: "text-green-400", icon: "🏆",
    tips: ["ممتاز! معرفتك بالأمن الرقمي في مستوى عالٍ جداً.", "شارك معرفتك مع عائلتك وأصدقائك لمساعدتهم على الحماية.", "تابع آخر التهديدات السيبرانية عبر مراكز الأمن الموثوقة.", "فكر في الحصول على شهادات احترافية في مجال الأمن السيبراني."],
    tipsEn: ["Excellent! Your digital security knowledge is at a very high level.", "Share your knowledge with family and friends to help them stay protected.", "Follow the latest cybersecurity threats through trusted security centers.", "Consider obtaining professional certifications in cybersecurity."],
  },
  intermediate: {
    label: "مستوى متوسط", labelEn: "Intermediate Level", color: "text-yellow-400", icon: "⚠️",
    tips: ["لديك أساس جيد لكن هناك مجال للتحسين.", "راجع قسم التعلم لتعزيز معرفتك بكلمات المرور القوية.", "تأكد من تفعيل المصادقة الثنائية (2FA) على جميع حساباتك.", "تحقق دائماً من روابط المواقع قبل إدخال أي بيانات شخصية."],
    tipsEn: ["You have a good foundation but there's room for improvement.", "Review the Learning Hub to strengthen your knowledge of strong passwords.", "Make sure Two-Factor Authentication (2FA) is enabled on all your accounts.", "Always verify website links before entering any personal data."],
  },
  atrisk: {
    label: "في خطر — تحتاج لتعلم أساسيات الأمن", labelEn: "At Risk — You Need to Learn Security Basics", color: "text-red-400", icon: "🚨",
    tips: ["نتيجتك تشير إلى أنك بحاجة لتعلم أساسيات الأمن الرقمي بشكل عاجل.", "لا تضغط على روابط من مصادر غير موثوقة أبداً.", "استخدم كلمات مرور قوية ومختلفة لكل حساب.", "فعّل المصادقة الثنائية فوراً على بريدك وحساباتك المصرفية.", "ابدأ بقسم التعلم في حراس لبناء أساس أمني قوي."],
    tipsEn: ["Your score indicates you urgently need to learn digital security basics.", "Never click links from untrusted sources.", "Use strong, unique passwords for every account.", "Enable Two-Factor Authentication immediately on your email and banking accounts.", "Start with Horras's Learning Hub to build a strong security foundation."],
  },
};

export default function SecurityTest() {
  const [, setLocation] = useLocation();
  const { setQuizResults, user } = useApp();
  const { isRTL } = useLang();
  const ArrowDir = isRTL ? ArrowLeft : ArrowRight;
  const ArrowBack = isRTL ? ArrowRight : ArrowLeft;

  const [step, setStep] = useState<"intro" | "quiz" | "result">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answersMap, setAnswersMap] = useState<Record<number, number>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [finalCorrect, setFinalCorrect] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [failedCategories, setFailedCategories] = useState<string[]>([]);

  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);

  const clearAutoAdvance = () => {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
    setIsAutoAdvancing(false);
  };

  const startQuiz = () => {
    if (!user) { setShowLoginModal(true); return; }
    setStep("quiz");
    setAnswersMap({});
    setCurrentQ(0);
    setSelectedOption(null);
    clearAutoAdvance();
  };

  const doAdvance = (qIndex: number, _optionIndex: number, newMap: Record<number, number>) => {
    setSelectedOption(null);
    if (qIndex < QUESTIONS.length - 1) {
      const nextQ = qIndex + 1;
      setCurrentQ(nextQ);
      setSelectedOption(newMap[nextQ] ?? null);
    } else {
      finishQuiz(newMap);
    }
  };

  const selectAnswer = (i: number) => {
    clearAutoAdvance();
    setSelectedOption(i);
    setIsAutoAdvancing(true);
    const newMap = { ...answersMap, [currentQ]: i };
    setAnswersMap(newMap);
    autoAdvanceTimer.current = setTimeout(() => {
      setIsAutoAdvancing(false);
      doAdvance(currentQ, i, newMap);
    }, 300);
  };

  const goBack = () => {
    if (currentQ === 0) return;
    clearAutoAdvance();
    const prevQ = currentQ - 1;
    setCurrentQ(prevQ);
    setSelectedOption(answersMap[prevQ] ?? null);
  };

  useEffect(() => {
    return () => clearAutoAdvance();
  }, []);

  const finishQuiz = async (finalMap: Record<number, number>) => {
    const correctCount = QUESTIONS.reduce(
      (acc, q, idx) => acc + (finalMap[idx] === q.correct ? 1 : 0),
      0
    );
    const score = Math.round((correctCount / QUESTIONS.length) * 100);
    const failed = QUESTIONS
      .map((q, idx) => (finalMap[idx] !== q.correct ? q.category : null))
      .filter((c): c is string => c !== null);
    const uniqueFailed = [...new Set(failed)];

    setFinalCorrect(correctCount);
    setFinalScore(score);
    setFailedCategories(uniqueFailed);
    setStep("result");

    await setQuizResults(score, uniqueFailed);

    if (score > 50) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ["#FFB800", "#10B981", "#ffffff"] });
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 md:py-10 w-full flex-grow flex flex-col justify-center">

      {/* Intro */}
      {step === "intro" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-6 md:p-8 text-center relative overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/[0.07]"
        >
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/15 blur-[60px] rounded-full pointer-events-none" />
          <div className="inline-flex bg-primary/10 p-4 rounded-2xl mb-5 border border-primary/20">
            <ClipboardCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-3">
            {isRTL ? "اختبر مستوى أمانك الرقمي" : "Test Your Digital Security Level"}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mb-6 max-w-md mx-auto leading-relaxed">
            {isRTL
              ? "اختبار تفاعلي صُمم لتقييم مدى وعيك بالمخاطر السيبرانية. ستحصل على فيديوهات توعوية مرتبطة بكل إجابة خاطئة."
              : "An interactive test assessing your cybersecurity awareness. Get awareness videos for each wrong answer."}
          </p>
          <div className="grid grid-cols-3 gap-2 mb-6 text-xs font-medium">
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 sm:p-3">
              <span className="block text-primary text-lg sm:text-xl font-bold mb-0.5">10</span>
              {isRTL ? "أسئلة" : "Questions"}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 sm:p-3">
              <span className="block text-primary text-lg sm:text-xl font-bold mb-0.5">3-5</span>
              {isRTL ? "دقائق" : "Minutes"}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 sm:p-3">
              <span className="block text-primary text-lg sm:text-xl font-bold mb-0.5">100%</span>
              {isRTL ? "خصوصية" : "Private"}
            </div>
          </div>
          <Button className="w-full sm:w-auto px-8 py-2.5 text-sm rounded-xl font-bold gap-2" onClick={startQuiz}>
            {isRTL ? "ابدأ الاختبار" : "Start Test"}
            <ArrowBack className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {/* Quiz */}
      {step === "quiz" && (
        <div className="w-full">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="text-muted-foreground font-bold text-xs shrink-0">
              {currentQ + 1} / {QUESTIONS.length}
            </span>
            <div className="flex-1">
              <Progress value={(currentQ / QUESTIONS.length) * 100} className="h-1.5 [&>div]:bg-primary" />
            </div>
            <span className="text-primary/60 text-[10px] font-semibold shrink-0 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
              {isRTL ? QUESTIONS[currentQ].categoryAr : QUESTIONS[currentQ].category}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              className="glass-card rounded-3xl p-5 md:p-6 border-primary/20 shadow-2xl shadow-black/60 ring-1 ring-white/[0.07]"
            >
              <h2 className="text-base md:text-xl font-bold mb-4 leading-relaxed">
                {isRTL ? QUESTIONS[currentQ].question : QUESTIONS[currentQ].questionEn}
              </h2>
              <div className="flex flex-col gap-2">
                {(isRTL ? QUESTIONS[currentQ].options : QUESTIONS[currentQ].optionsEn).map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => { if (!isAutoAdvancing) selectAnswer(i); }}
                    className={`${isRTL ? "text-right" : "text-left"} p-2.5 md:p-3 rounded-xl border transition-all duration-200 text-sm font-medium leading-snug ${
                      selectedOption === i && isAutoAdvancing
                        ? "bg-primary/20 border-primary text-white shadow-[0_0_12px_rgba(255,184,0,0.12)] cursor-default"
                        : isAutoAdvancing
                        ? "bg-white/5 border-white/10 text-muted-foreground/50 cursor-default"
                        : selectedOption === i
                        ? "bg-primary/15 border-primary/60 text-white"
                        : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {currentQ > 0 && (
                <div className="mt-4 flex justify-start">
                  <button
                    onClick={goBack}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors px-3 py-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10"
                  >
                    <ArrowDir className="w-3.5 h-3.5" />
                    {isRTL ? "السابق" : "Back"}
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Result */}
      {step === "result" && (() => {
        const level = finalScore >= 80 ? "expert" : finalScore >= 50 ? "intermediate" : "atrisk";
        const rec = RECOMMENDATIONS[level];
        const scoreColor = finalScore >= 80 ? "text-green-400" : finalScore >= 50 ? "text-yellow-400" : "text-red-400";
        const ringColor = finalScore >= 80 ? "stroke-green-400" : finalScore >= 50 ? "stroke-yellow-400" : "stroke-red-400";
        const radius = 56;
        const circumference = 2 * Math.PI * radius;
        const strokeDash = circumference - (finalScore / 100) * circumference;

        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full space-y-5"
          >
            {/* Score Card */}
            <div className="glass-card rounded-3xl p-5 md:p-6 border-primary/30 shadow-2xl shadow-black/60 ring-1 ring-white/[0.07]">
              <div className="text-center mb-5">
                <div className="text-3xl mb-2">{rec.icon}</div>
                <h2 className="text-2xl font-black mb-0.5">
                  {isRTL ? "نتيجة اختبارك" : "Your Test Result"}
                </h2>
                <p className={`text-sm font-bold ${rec.color}`}>{isRTL ? rec.label : rec.labelEn}</p>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6 mb-5">
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <svg width="128" height="128" viewBox="0 0 160 160" className="-rotate-90">
                    <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
                    <circle cx="80" cy="80" r={radius} fill="none" className={ringColor} strokeWidth="12"
                      strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDash}
                      style={{ transition: "stroke-dashoffset 1s ease" }} />
                  </svg>
                  <div className="text-center -mt-[112px] mb-[64px]">
                    <span className={`text-4xl font-black ${scoreColor}`}>{finalScore}%</span>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {finalCorrect} / {QUESTIONS.length} {isRTL ? "صحيحة" : "correct"}
                    </p>
                  </div>
                  <div className="flex gap-5 text-center text-xs mt-1">
                    <div>
                      <div className="text-green-400 font-bold text-lg">{finalCorrect}</div>
                      <div className="text-muted-foreground">{isRTL ? "صحيحة" : "Correct"}</div>
                    </div>
                    <div className="w-px bg-white/10" />
                    <div>
                      <div className="text-red-400 font-bold text-lg">{QUESTIONS.length - finalCorrect}</div>
                      <div className="text-muted-foreground">{isRTL ? "خاطئة" : "Wrong"}</div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 w-full">
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    {isRTL ? "التوصيات والنصائح" : "Recommendations & Tips"}
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {(isRTL ? rec.tips : rec.tipsEn).map((tip, i) => (
                      <li key={i} className="flex items-start gap-2.5 bg-white/5 border border-white/10 rounded-xl p-3 text-xs leading-relaxed">
                        <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                        <span className="text-muted-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {failedCategories.length > 0 && (
                <div className="border-t border-white/5 pt-4 mb-4">
                  <p className="text-xs text-muted-foreground mb-2 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    {isRTL ? "المجالات التي تحتاج للتحسين:" : "Areas needing improvement:"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {failedCategories.map((cat) => {
                      const q = QUESTIONS.find((q) => q.category === cat);
                      return (
                        <span key={cat} className="text-xs px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
                          {isRTL ? q?.categoryAr ?? cat : cat}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="sm" className="rounded-xl px-6 font-bold gap-2" onClick={() => setLocation("/dashboard")}>
                  <Trophy className="w-4 h-4" />
                  {isRTL ? "عرض لوحة التحكم" : "View Dashboard"}
                </Button>
                <Button
                  size="sm" variant="outline" className="rounded-xl px-6 font-bold gap-2"
                  onClick={() => { setStep("intro"); setCurrentQ(0); setAnswersMap({}); setSelectedOption(null); }}
                >
                  {isRTL ? "إعادة الاختبار" : "Retake Test"}
                  <ArrowDir className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        );
      })()}

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
