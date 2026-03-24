import React, { createContext, useContext, useState, useEffect } from "react";

export type Lang = "ar" | "en";

interface LangContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LangContext = createContext<LangContextType | undefined>(undefined);

const translations: Record<Lang, Record<string, string>> = {
  ar: {
    // Brand
    "brand.name": "حُراس",
    "brand.tagline": "منصة الأمن الرقمي العربية",
    // Nav
    "nav.home": "الرئيسية",
    "nav.checkLink": "افحص الرابط",
    "nav.securityTest": "اختبر أمانك",
    "nav.report": "بلّغ عن احتيال",
    "nav.learn": "تعلّم بسرعة",
    "nav.tools": "أدوات الأمان",
    "nav.about": "عن المنصة",
    "nav.checkNow": "افحص رابط الآن",
    "nav.login": "دخول",
    "nav.signup": "تسجيل",
    "gate.title": "تسجيل الدخول مطلوب",
    "gate.message": "يرجى تسجيل الدخول أولاً لتتمكن من استخدام هذه الخدمة",
    "gate.loginBtn": "تسجيل الدخول",
    "gate.signupBtn": "إنشاء حساب",
    "gate.close": "إغلاق",
    "nav.logout": "تسجيل الخروج",
    // Hero
    "hero.title1": "احمِ نفسك",
    "hero.title2": "الاحتيال الإلكتروني",
    "hero.subtitle": "منصة حُراس توفر لك الأدوات والمعرفة اللازمة لتصفح الإنترنت بأمان. اختبر أمانك، افحص الروابط، وتعلّم كيف تحمي بياناتك.",
    "hero.checkLink": "افحص رابطاً",
    "hero.testSecurity": "اختبر أمانك",
    "hero.report": "بلّغ عن احتيال",
    // Stats
    "stats.activeUsers": "مستخدم نشط",
    "stats.accuracy": "نسبة الدقة",
    "stats.reports": "بلاغ تم تقديمه",
    "stats.links": "رابط تم فحصه",
    // Features
    "features.title": "ماذا يمكنك أن تفعل؟",
    "features.subtitle": "مجموعة متكاملة من الأدوات لحمايتك في العالم الرقمي",
    "features.linkCheck": "فاحص الرابط",
    "features.linkCheckDesc": "تأكد من سلامة الروابط قبل الضغط عليها لتجنب الاختراق",
    "features.quiz": "الاختبار الشخصي",
    "features.quizDesc": "اكتشف مدى وعيك الأمني من خلال اختبار سريع وتفاعلي",
    "features.report": "الإبلاغ عن الاحتيال",
    "features.reportDesc": "شارك في حماية المجتمع بالإبلاغ عن المواقع والحسابات المزيفة",
    "features.tools": "أدوات الأمان الرقمي",
    "features.toolsDesc": "قوائم تحقق عملية لتأمين حساباتك وأجهزتك المختلفة",
    "features.simulator": "محاكي الاحتيال",
    "features.simulatorDesc": "تدرب على اكتشاف رسائل التصيد في بيئة محاكاة آمنة",
    "features.videos": "تعلّم في 60 ثانية",
    "features.videosDesc": "فيديوهات قصيرة ومكثفة لتعلم أهم ممارسات الأمان",
    "features.startNow": "ابدأ الآن",
    // Learning section
    "learn.title": "تعلّم في 60 ثانية",
    "learn.subtitle": "فيديوهات قصيرة لتدريبك في أقل وقت ممكن",
    "learn.viewMore": "شاهد المزيد من الفيديوهات",
    // CTA
    "cta.title": "ابدأ رحلتك نحو الأمان الرقمي",
    "cta.subtitle": "لا تنتظر حتى تقع ضحية للاحتيال. قم بتقييم مستوى أمانك الحالي وتعرف على الخطوات اللازمة لحماية نفسك.",
    "cta.button": "ابدأ الاختبار الأمني الآن",
    // Footer
    "footer.description": "منصة رقمية عربية رائدة لتعزيز الوعي بالأمن السيبراني وحماية الشباب من الاحتيال الرقمي.",
    "footer.quickLinks": "روابط سريعة",
    "footer.resources": "موارد",
    "footer.legal": "قانوني",
    "footer.about": "عن المنصة",
    "footer.privacy": "سياسة الخصوصية",
    "footer.terms": "شروط الاستخدام",
    "footer.stats": "الإحصائيات",
    "footer.simulator": "محاكي الاحتيال",
    "footer.copyright": "جميع الحقوق محفوظة.",
    "footer.disclaimer": "تنويه: هذه المنصة تعليمية توعوية ولا تغني عن الإبلاغ الرسمي للجهات الأمنية المختصة في بلدك.",
    // Login
    "login.title": "تسجيل الدخول",
    "login.subtitle": "تابع رحلتك في حماية أمانك الرقمي",
    "login.email": "البريد الإلكتروني",
    "login.password": "كلمة المرور",
    "login.forgotPassword": "نسيت كلمة المرور؟",
    "login.submit": "تسجيل الدخول",
    "login.noAccount": "ليس لديك حساب؟",
    "login.signupLink": "سجّل الآن",
    "login.emailRequired": "يرجى إدخال البريد الإلكتروني",
    "login.emailInvalid": "صيغة البريد الإلكتروني غير صحيحة",
    "login.passwordRequired": "يرجى إدخال كلمة المرور",
    "login.passwordMin": "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
    "login.success": "تم تسجيل الدخول بنجاح",
    // Signup
    "signup.title": "إنشاء حساب جديد",
    "signup.subtitle": "انضم إلى مجتمع حُراس وقم بحماية تواجدك الرقمي",
    "signup.name": "الاسم بالكامل",
    "signup.email": "البريد الإلكتروني",
    "signup.password": "كلمة المرور",
    "signup.confirmPassword": "تأكيد كلمة المرور",
    "signup.submit": "إنشاء الحساب",
    "signup.hasAccount": "لديك حساب بالفعل؟",
    "signup.loginLink": "تسجيل الدخول",
    "signup.nameRequired": "يرجى إدخال الاسم",
    "signup.nameMin": "الاسم يجب أن يكون حرفين على الأقل",
    "signup.emailRequired": "يرجى إدخال البريد الإلكتروني",
    "signup.emailInvalid": "صيغة البريد الإلكتروني غير صحيحة",
    "signup.passwordRequired": "يرجى إدخال كلمة المرور",
    "signup.passwordMin": "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
    "signup.confirmRequired": "يرجى تأكيد كلمة المرور",
    "signup.passwordMismatch": "كلمتا المرور غير متطابقتين",
    "signup.success": "تم إنشاء الحساب بنجاح!",
    // Dashboard
    "dashboard.greeting": "مرحباً،",
    "dashboard.subtitle": "إليك ملخص لحالتك الأمنية ونشاطاتك الأخيرة",
    "dashboard.securityScore": "مؤشر الأمان الرقمي",
    "dashboard.scoreDesc": "هذا المؤشر يعكس مدى تفاعلك مع المنصة وتطبيقك لممارسات الأمان. يمكنك زيادة درجتك عبر استكمال قائمة التحقق واجتياز الاختبار.",
    "dashboard.linksChecked": "الروابط المفحوصة",
    "dashboard.quizResult": "نتيجة الاختبار",
    "dashboard.notCompleted": "لم يكتمل",
    "dashboard.checkLink": "افحص رابط",
    "dashboard.retakeTest": "أعد الاختبار",
    "dashboard.activity": "النشاط الأخير",
    "dashboard.recommendations": "نصائح مخصصة لك",
    "dashboard.securityLevel": "درجة الأمان",
    "dashboard.toolsEnabled": "أدوات مفعّلة",
    "dashboard.videoMgmt": "إدارة فيديوهات التعلم",
    "dashboard.videoMgmtDesc": "أضف أو حدّث روابط فيديوهات \"تعلّم في 60 ثانية\" الظاهرة في الصفحة الرئيسية",
    "dashboard.videoTitle": "عنوان الفيديو",
    "dashboard.videoUrl": "رابط الفيديو (YouTube / Vimeo)",
    "dashboard.videoCategory": "التصنيف",
    "dashboard.videoDuration": "المدة",
    "dashboard.saveVideo": "حفظ التغييرات",
    "dashboard.videoSaved": "تم حفظ الفيديو بنجاح",
    "dashboard.addVideo": "إضافة فيديو",
    "dashboard.removeVideo": "حذف",
    "dashboard.editVideo": "تعديل",
    "dashboard.joinDate": "تاريخ الانضمام",
    "dashboard.joinedPlatform": "انضممت إلى منصة حُراس",
    "dashboard.onRegistration": "عند التسجيل",
    "dashboard.today": "اليوم",
    "dashboard.completedQuiz": "أكملت الاختبار الأمني بنتيجة",
    "dashboard.checkedLinks": "فحصت",
    "dashboard.links": "رابط",
    "dashboard.links_plural": "روابط",
    "dashboard.toolsActivated": "فعّلت",
    "dashboard.securityTools": "من أدوات الأمان",
    // Security levels
    "level.expert": "خبير",
    "level.intermediate": "متوسط",
    "level.atRisk": "في خطر",
    // CheckLink
    "checkLink.title": "افحص الرابط قبل الضغط",
    "checkLink.subtitle": "أداة حُراس لفحص الروابط المشبوهة. الصق الرابط هنا وسنقوم بتحليله لاكتشاف أي برمجيات خبيثة أو محاولات تصيد.",
    "checkLink.placeholder": "https://example.com/...",
    "checkLink.checking": "جاري الفحص...",
    "checkLink.checkNow": "افحص الآن",
    "checkLink.safe": "الرابط يبدو آمناً",
    "checkLink.safeDesc": "لم نكتشف أي علامات احتيال في هذا الرابط، وهو يستخدم اتصالاً مشفراً (HTTPS).",
    "checkLink.suspicious": "رابط مشبوه!",
    "checkLink.suspiciousDesc": "هذا الرابط يستخدم تقنية اختصار الروابط أو لا يستخدم اتصالاً مشفراً. توخّ الحذر ولا تدخل معلومات حساسة.",
    "checkLink.danger": "تحذير! رابط خطير",
    "checkLink.dangerDesc": "يحتوي هذا الرابط على علامات قوية لعمليات الاحتيال أو التصيد. نوصي بشدة بعدم زيارته.",
    // Report
    "report.title": "بلّغ عن احتيال",
    "report.subtitle": "ساعدنا في رصد وإيقاف المواقع والحسابات الاحتيالية",
    "report.fraudType": "نوع الاحتيال",
    "report.fraudTypeRequired": "يرجى اختيار نوع الاحتيال",
    "report.suspiciousUrl": "الرابط المشبوه (إن وجد)",
    "report.description": "وصف الحادثة (اختياري)",
    "report.descPlaceholder": "يرجى كتابة تفاصيل ما حدث وكيف تواصلوا معك...",
    "report.screenshot": "لقطة شاشة (اختياري)",
    "report.dragDrop": "اسحب الصورة هنا أو اضغط للاختيار",
    "report.fileTypes": "PNG, JPG حتى 5MB",
    "report.anonymous": "بلاغ مجهول الهوية - لن يتم ربط هذا البلاغ بحسابك",
    "report.disclaimer": "تنويه: سيتم تحليل البلاغات تقنياً وإحالتها للجهات المختصة إن لزم الأمر. هذه المنصة للتوعية والرصد ولا تحل محل التبليغ الرسمي للسلطات الأمنية في بلدك.",
    "report.submit": "إرسال البلاغ",
    "report.submitting": "جاري الإرسال...",
    "report.successTitle": "تم إرسال البلاغ بنجاح",
    "report.successDesc": "سيتم مراجعة البلاغ وتحويله للجهات المختصة. شكراً لكونك جزءاً من حراس الأمن الرقمي.",
    "report.another": "تقديم بلاغ آخر",
    "report.received": "تم استلام البلاغ",
    "report.receivedDesc": "شكراً لك. مساهمتك تساعد في حماية المجتمع الرقمي.",
    "report.fileUploaded": "تم رفع الملف بنجاح",
  },
  en: {
    // Brand
    "brand.name": "Horras",
    "brand.tagline": "Arabic Cybersecurity Awareness Platform",
    // Nav
    "nav.home": "Home",
    "nav.checkLink": "Check Link",
    "nav.securityTest": "Security Test",
    "nav.report": "Report Scam",
    "nav.learn": "Learn Fast",
    "nav.tools": "Security Tools",
    "nav.about": "About",
    "nav.checkNow": "Check Link Now",
    "nav.login": "Login",
    "nav.signup": "Sign Up",
    "gate.title": "Login Required",
    "gate.message": "Please log in first to use this service",
    "gate.loginBtn": "Sign In",
    "gate.signupBtn": "Create Account",
    "gate.close": "Close",
    "nav.logout": "Logout",
    // Hero
    "hero.title1": "Protect Yourself",
    "hero.title2": "Online Fraud",
    "hero.subtitle": "Horras gives you the tools and knowledge to browse the internet safely. Test your security, check links, and learn how to protect your data.",
    "hero.checkLink": "Check a Link",
    "hero.testSecurity": "Test Security",
    "hero.report": "Report Scam",
    // Stats
    "stats.activeUsers": "Active Users",
    "stats.accuracy": "Accuracy Rate",
    "stats.reports": "Reports Filed",
    "stats.links": "Links Scanned",
    // Features
    "features.title": "What Can You Do?",
    "features.subtitle": "A full suite of tools to protect you in the digital world",
    "features.linkCheck": "Link Scanner",
    "features.linkCheckDesc": "Verify links are safe before clicking to avoid hacking attempts",
    "features.quiz": "Security Quiz",
    "features.quizDesc": "Discover your security awareness level with a quick interactive test",
    "features.report": "Report Fraud",
    "features.reportDesc": "Help protect the community by reporting fake websites and accounts",
    "features.tools": "Security Tools",
    "features.toolsDesc": "Practical checklists to secure your accounts and devices",
    "features.simulator": "Scam Simulator",
    "features.simulatorDesc": "Practice identifying phishing messages in a safe simulation environment",
    "features.videos": "Learn in 60 Seconds",
    "features.videosDesc": "Short, intense videos to learn the most important safety practices",
    "features.startNow": "Start Now",
    // Learning section
    "learn.title": "Learn in 60 Seconds",
    "learn.subtitle": "Short videos to train you in the least amount of time",
    "learn.viewMore": "View More Videos",
    // CTA
    "cta.title": "Start Your Digital Security Journey",
    "cta.subtitle": "Don't wait until you become a victim. Evaluate your current security level and learn the steps needed to protect yourself.",
    "cta.button": "Start Security Test Now",
    // Footer
    "footer.description": "A leading Arabic digital platform to promote cybersecurity awareness and protect youth from digital fraud.",
    "footer.quickLinks": "Quick Links",
    "footer.resources": "Resources",
    "footer.legal": "Legal",
    "footer.about": "About",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Use",
    "footer.stats": "Statistics",
    "footer.simulator": "Scam Simulator",
    "footer.copyright": "All rights reserved.",
    "footer.disclaimer": "Disclaimer: This is an educational awareness platform and does not replace official reporting to the appropriate security authorities in your country.",
    // Login
    "login.title": "Sign In",
    "login.subtitle": "Continue your digital security journey",
    "login.email": "Email Address",
    "login.password": "Password",
    "login.forgotPassword": "Forgot Password?",
    "login.submit": "Sign In",
    "login.noAccount": "Don't have an account?",
    "login.signupLink": "Sign Up",
    "login.emailRequired": "Please enter your email address",
    "login.emailInvalid": "Invalid email format",
    "login.passwordRequired": "Please enter your password",
    "login.passwordMin": "Password must be at least 6 characters",
    "login.success": "Successfully signed in",
    // Signup
    "signup.title": "Create Account",
    "signup.subtitle": "Join the Horras community and protect your digital presence",
    "signup.name": "Full Name",
    "signup.email": "Email Address",
    "signup.password": "Password",
    "signup.confirmPassword": "Confirm Password",
    "signup.submit": "Create Account",
    "signup.hasAccount": "Already have an account?",
    "signup.loginLink": "Sign In",
    "signup.nameRequired": "Please enter your name",
    "signup.nameMin": "Name must be at least 2 characters",
    "signup.emailRequired": "Please enter your email address",
    "signup.emailInvalid": "Invalid email format",
    "signup.passwordRequired": "Please enter your password",
    "signup.passwordMin": "Password must be at least 8 characters",
    "signup.confirmRequired": "Please confirm your password",
    "signup.passwordMismatch": "Passwords do not match",
    "signup.success": "Account created successfully!",
    // Dashboard
    "dashboard.greeting": "Welcome,",
    "dashboard.subtitle": "Here's a summary of your security status and recent activities",
    "dashboard.securityScore": "Digital Security Score",
    "dashboard.scoreDesc": "This score reflects your engagement with the platform and security practices. Increase your score by completing the checklist and passing the security test.",
    "dashboard.linksChecked": "Links Scanned",
    "dashboard.quizResult": "Quiz Result",
    "dashboard.notCompleted": "Not completed",
    "dashboard.checkLink": "Check Link",
    "dashboard.retakeTest": "Retake Test",
    "dashboard.activity": "Recent Activity",
    "dashboard.recommendations": "Personalized Tips",
    "dashboard.securityLevel": "Security Score",
    "dashboard.toolsEnabled": "Tools Enabled",
    "dashboard.videoMgmt": "Learning Videos Management",
    "dashboard.videoMgmtDesc": "Add or update video links for the \"Learn in 60 Seconds\" section shown on the homepage",
    "dashboard.videoTitle": "Video Title",
    "dashboard.videoUrl": "Video URL (YouTube / Vimeo)",
    "dashboard.videoCategory": "Category",
    "dashboard.videoDuration": "Duration",
    "dashboard.saveVideo": "Save Changes",
    "dashboard.videoSaved": "Video saved successfully",
    "dashboard.addVideo": "Add Video",
    "dashboard.removeVideo": "Remove",
    "dashboard.editVideo": "Edit",
    "dashboard.joinDate": "Join Date",
    "dashboard.joinedPlatform": "Joined the Horras platform",
    "dashboard.onRegistration": "On registration",
    "dashboard.today": "Today",
    "dashboard.completedQuiz": "Completed security test with score",
    "dashboard.checkedLinks": "Scanned",
    "dashboard.links": "link",
    "dashboard.links_plural": "links",
    "dashboard.toolsActivated": "Activated",
    "dashboard.securityTools": "security tools",
    // Security levels
    "level.expert": "Expert",
    "level.intermediate": "Intermediate",
    "level.atRisk": "At Risk",
    // CheckLink
    "checkLink.title": "Check the Link Before Clicking",
    "checkLink.subtitle": "Horras link checker tool. Paste the link here and we'll analyze it to detect malware or phishing attempts.",
    "checkLink.placeholder": "https://example.com/...",
    "checkLink.checking": "Checking...",
    "checkLink.checkNow": "Check Now",
    "checkLink.safe": "Link Appears Safe",
    "checkLink.safeDesc": "We didn't detect any fraud indicators in this link, and it uses an encrypted connection (HTTPS).",
    "checkLink.suspicious": "Suspicious Link!",
    "checkLink.suspiciousDesc": "This link uses a URL shortener or doesn't use an encrypted connection. Be cautious and don't enter sensitive information.",
    "checkLink.danger": "Warning! Dangerous Link",
    "checkLink.dangerDesc": "This link contains strong indicators of fraud or phishing. We strongly recommend not visiting it.",
    // Report
    "report.title": "Report a Scam",
    "report.subtitle": "Help us detect and stop fraudulent websites and accounts",
    "report.fraudType": "Type of Fraud",
    "report.fraudTypeRequired": "Please select a fraud type",
    "report.suspiciousUrl": "Suspicious URL (if available)",
    "report.description": "Incident Description (optional)",
    "report.descPlaceholder": "Please describe what happened and how they contacted you...",
    "report.screenshot": "Screenshot (optional)",
    "report.dragDrop": "Drag image here or click to select",
    "report.fileTypes": "PNG, JPG up to 5MB",
    "report.anonymous": "Anonymous report — this report will not be linked to your account",
    "report.disclaimer": "Disclaimer: Reports will be analyzed technically and referred to authorities if needed. This platform is for awareness and monitoring and does not replace official reporting to security authorities in your country.",
    "report.submit": "Submit Report",
    "report.submitting": "Submitting...",
    "report.successTitle": "Report Submitted Successfully",
    "report.successDesc": "Your report will be reviewed and forwarded to the appropriate authorities. Thank you for being part of the Horras digital security community.",
    "report.another": "Submit Another Report",
    "report.received": "Report Received",
    "report.receivedDesc": "Thank you. Your contribution helps protect the digital community.",
    "report.fileUploaded": "File uploaded successfully",
  }
};

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem("horras_lang") as Lang) || "ar";
  });

  useEffect(() => {
    localStorage.setItem("horras_lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = lang === "ar" ? "حُراس" : "Horras";
    if (lang === "en") {
      document.body.classList.add("lang-en");
      document.body.classList.remove("lang-ar");
    } else {
      document.body.classList.add("lang-ar");
      document.body.classList.remove("lang-en");
    }
  }, [lang]);

  const toggleLang = () => setLang((prev) => (prev === "ar" ? "en" : "ar"));

  const t = (key: string): string => {
    return translations[lang][key] ?? translations["ar"][key] ?? key;
  };

  return (
    <LangContext.Provider value={{ lang, toggleLang, t, isRTL: lang === "ar" }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
