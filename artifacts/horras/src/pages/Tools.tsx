import { useState } from "react";
import { motion } from "framer-motion";
import { Key, Smartphone, Eye, Shield, Check, ExternalLink } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useLang } from "@/context/LangContext";

const INFO_CARDS = [
  {
    id: "pwd",
    icon: <Key className="w-6 h-6" />,
    title: "حماية كلمات المرور",
    titleEn: "Password Protection",
    items: [
      "استخدم 12 حرفاً على الأقل (مزيج من الرموز والأرقام)",
      "لا تستخدم كلمة مرور واحدة لأكثر من حساب",
      "استخدم برامج إدارة كلمات المرور (Password Managers)",
      "تجنب استخدام الأسماء أو التواريخ الشخصية",
      "قم بتغييرها فوراً إذا شككت بحدوث اختراق",
    ],
    itemsEn: [
      "Use at least 12 characters (mix of symbols and numbers)",
      "Never reuse the same password for more than one account",
      "Use trusted Password Manager apps",
      "Avoid using names or personal dates",
      "Change it immediately if you suspect a breach",
    ],
    links: ["مدير كلمات مرور Google", "Bitwarden"],
    linksEn: ["Google Password Manager", "Bitwarden"],
  },
  {
    id: "2fa",
    icon: <Smartphone className="w-6 h-6" />,
    title: "التحقق الثنائي (2FA)",
    titleEn: "Two-Factor Authentication (2FA)",
    items: [
      "فعّله على حسابات الإيميل والبنوك والتواصل الاجتماعي",
      "استخدم تطبيقات المصادقة (Authenticator Apps) كخيار أول",
      "تجنب استخدام SMS للتحقق إن أمكن (عرضة للاختراق)",
      "احتفظ بالرموز الاحتياطية (Backup Codes) في مكان آمن",
      "لا تشارك رمز التحقق مع أي شخص يدعي أنه دعم فني",
    ],
    itemsEn: [
      "Enable it on email, banking, and social media accounts",
      "Use Authenticator Apps as the first choice",
      "Avoid SMS-based verification if possible (vulnerable to interception)",
      "Store Backup Codes in a safe location",
      "Never share a verification code with anyone claiming to be tech support",
    ],
    links: ["Google Authenticator", "Authy"],
    linksEn: ["Google Authenticator", "Authy"],
  },
  {
    id: "privacy",
    icon: <Eye className="w-6 h-6" />,
    title: "حماية الخصوصية",
    titleEn: "Privacy Protection",
    items: [
      "راجع إعدادات الخصوصية في مواقع التواصل واجعلها للأصدقاء فقط",
      "لا تشارك تفاصيل سفرك وموقعك لحظة بلحظة",
      "تأكد من الصلاحيات الممنوحة للتطبيقات في هاتفك",
      "غطِّ كاميرا الويب عندما لا تستخدمها",
      "اقرأ سياسة الخصوصية للتطبيقات الجديدة قبل تحميلها",
    ],
    itemsEn: [
      "Review privacy settings on social media and set them to friends only",
      "Don't share your travel details or location in real-time",
      "Check app permissions on your phone regularly",
      "Cover your webcam when not in use",
      "Read new apps' privacy policies before downloading",
    ],
    links: ["فحص خصوصية جوجل", "إعدادات خصوصية فيسبوك"],
    linksEn: ["Google Privacy Checkup", "Facebook Privacy Settings"],
  },
  {
    id: "browsing",
    icon: <Shield className="w-6 h-6" />,
    title: "التصفح الآمن",
    titleEn: "Safe Browsing",
    items: [
      "تأكد دائماً من وجود علامة القفل (HTTPS) في شريط الرابط",
      "تجنب إجراء عمليات مالية على شبكات الواي فاي العامة",
      "استخدم إضافة حاجب إعلانات موثوق (Ad Blocker)",
      "حافظ على تحديث متصفحك بشكل دائم",
      "احذر من النوافذ المنبثقة التي تخبرك بأن جهازك مصاب بفيروس",
    ],
    itemsEn: [
      "Always check for the lock icon (HTTPS) in the address bar",
      "Avoid financial transactions on public Wi-Fi networks",
      "Use a trusted Ad Blocker extension",
      "Keep your browser updated at all times",
      "Beware of pop-ups telling you your device is infected with a virus",
    ],
    links: ["uBlock Origin", "Brave Browser"],
    linksEn: ["uBlock Origin", "Brave Browser"],
  },
];

const CHECKLIST = [
  {
    id: "c1",
    label: "قمت بتفعيل التحقق الثنائي (2FA) على بريدي الإلكتروني الأساسي",
    labelEn: "I have enabled Two-Factor Authentication (2FA) on my primary email",
  },
  {
    id: "c2",
    label: "أستخدم كلمة مرور مختلفة لكل حساب من حساباتي المهمة",
    labelEn: "I use a different password for each of my important accounts",
  },
  {
    id: "c3",
    label: "حساباتي على وسائل التواصل الاجتماعي مضبوطة على الوضع الخاص",
    labelEn: "My social media accounts are set to private mode",
  },
  {
    id: "c4",
    label: "أقوم بتحديث نظام تشغيل هاتفي وحاسوبي بانتظام",
    labelEn: "I regularly update my phone's and computer's operating system",
  },
  {
    id: "c5",
    label: "لا أضغط على روابط غير معروفة تصلني عبر رسائل SMS",
    labelEn: "I never click on unknown links received via SMS messages",
  },
  {
    id: "c6",
    label: "أعرف كيفية التحقق من صحة رابط الموقع قبل إدخال بياناتي",
    labelEn: "I know how to verify a website URL before entering my data",
  },
  {
    id: "c7",
    label: "قمت بمراجعة التطبيقات التي لها صلاحية الوصول لكاميرا وميكروفون هاتفي",
    labelEn: "I have reviewed which apps have access to my phone's camera and microphone",
  },
  {
    id: "c8",
    label: "لدي نسخة احتياطية (Backup) لملفاتي المهمة",
    labelEn: "I have a Backup of my important files",
  },
];

export default function Tools() {
  const { toolsChecked, toggleToolChecked } = useApp();
  const { isRTL } = useLang();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 w-full">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black mb-4">
          {isRTL ? "أدوات الأمان الرقمي" : "Digital Security Tools"}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {isRTL
            ? "دليلك الشامل لضبط إعدادات الأمان. استخدم قوائم التحقق لضمان حماية جميع جوانب حياتك الرقمية."
            : "Your complete guide to configuring security settings. Use the checklists to ensure all aspects of your digital life are protected."}
        </p>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {INFO_CARDS.map((card, idx) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card rounded-3xl p-8 border-white/5"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-primary/10 p-3 rounded-xl text-primary border border-primary/20">
                {card.icon}
              </div>
              <h2 className="text-2xl font-bold">{isRTL ? card.title : card.titleEn}</h2>
            </div>

            <ul className="space-y-3 mb-8">
              {(isRTL ? card.items : card.itemsEn).map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-muted-foreground">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-6 border-t border-white/5">
              <span className="text-sm font-bold text-white mb-3 block">
                {isRTL ? "مراجع موثوقة:" : "Trusted References:"}
              </span>
              <div className="flex flex-wrap gap-2">
                {(isRTL ? card.links : card.linksEn).map((link, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                  >
                    {link} <ExternalLink className="w-3 h-3 opacity-50" />
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Personal Checklist */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
          <h2 className="text-2xl md:text-3xl font-black mb-2 text-center">
            {isRTL ? "قائمة فحص الأمان الشخصي" : "Personal Security Checklist"}
          </h2>
          <p className="text-muted-foreground text-center mb-10">
            {isRTL
              ? "أكمل هذه القائمة لرفع مستوى التقييم الأمني في ملفك الشخصي"
              : "Complete this checklist to raise your security score in your profile"}
          </p>

          <div className="space-y-4">
            {CHECKLIST.map((item) => {
              const isChecked = toolsChecked.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleToolChecked(item.id)}
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${
                    isChecked
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-black/40 border-white/5 hover:border-white/20"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                      isChecked ? "bg-emerald-500 border-emerald-500 text-black" : "border-white/30"
                    }`}
                  >
                    {isChecked && <Check className="w-4 h-4 font-bold" />}
                  </div>
                  <span className={`font-medium ${isChecked ? "text-white" : "text-muted-foreground"}`}>
                    {isRTL ? item.label : item.labelEn}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
