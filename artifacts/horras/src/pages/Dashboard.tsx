import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { useLang } from "@/context/LangContext";
import { CircularProgress } from "@/components/ui/circular-progress";
import {
  ShieldCheck, Target, Link2, CheckSquare, Bell, ArrowLeft, ArrowRight,
  User, ClipboardCheck, Search, Calendar, PlayCircle, Plus, Trash2, Edit3,
  Save, X, Youtube
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Video {
  id: string;
  title: string;
  url: string;
  category: string;
  duration: string;
}

const DEFAULT_VIDEOS: Video[] = [
  { id: "1", title: "ماذا تفعل إذا تعرضت للابتزاز؟", url: "", category: "الاحتيال", duration: "90s" },
  { id: "2", title: "أهمية التحقق الثنائي", url: "", category: "كلمات المرور", duration: "60s" },
  { id: "3", title: "كيف تكتشف الرابط الاحتيالي؟", url: "", category: "الروابط", duration: "60s" },
];

export default function Dashboard() {
  const { user, quizScore, linksChecked, toolsChecked, getSecurityScore, getSecurityLevel } = useApp();
  const { t, isRTL } = useLang();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const ArrowDir = isRTL ? ArrowLeft : ArrowRight;

  const [videos, setVideos] = useState<Video[]>(() => {
    const saved = localStorage.getItem("horras_videos");
    if (saved) { try { return JSON.parse(saved); } catch { /* ignore */ } }
    return DEFAULT_VIDEOS;
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Video>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newVideo, setNewVideo] = useState<Partial<Video>>({ title: "", url: "", category: "", duration: "" });

  useEffect(() => {
    if (!user) setLocation("/login");
  }, [user, setLocation]);

  useEffect(() => {
    localStorage.setItem("horras_videos", JSON.stringify(videos));
  }, [videos]);

  if (!user) return null;

  const score = getSecurityScore();
  const level = getSecurityLevel();

  const levelLabel = () => {
    if (score >= 80) return t("level.expert");
    if (score >= 50) return t("level.intermediate");
    return t("level.atRisk");
  };

  const getRecommendations = () => {
    if (score < 50) {
      return [
        { icon: <ShieldCheck />, text: isRTL ? "حسابك في خطر! فعّل المصادقة الثنائية (2FA) فوراً." : "Your account is at risk! Enable Two-Factor Authentication (2FA) immediately.", path: "/tools", action: isRTL ? "اذهب للأدوات" : "Go to Tools" },
        { icon: <Target />, text: isRTL ? "لم تكمل الاختبار الأمني. راجع معلوماتك." : "You haven't completed the security test. Review your knowledge.", path: "/security-test", action: isRTL ? "أعد الاختبار" : "Retake Test" },
        { icon: <Link2 />, text: isRTL ? "احذر من الروابط العشوائية. افحص دائماً قبل الضغط." : "Be careful of random links. Always check before clicking.", path: "/check-link", action: isRTL ? "افحص رابط" : "Check Link" }
      ];
    } else if (score < 80) {
      return [
        { icon: <ShieldCheck />, text: isRTL ? "أداؤك جيد! يمكنك تعزيز أمانك بتفعيل المزيد من إعدادات الخصوصية." : "Good performance! Enhance your security by enabling more privacy settings.", path: "/tools", action: isRTL ? "إكمال القائمة" : "Complete List" },
        { icon: <Bell />, text: isRTL ? "شاهد المزيد من الفيديوهات لتصبح خبيراً في اكتشاف الاحتيال." : "Watch more videos to become an expert at detecting fraud.", path: "/learn", action: isRTL ? "تعلّم أكثر" : "Learn More" },
        { icon: <Target />, text: isRTL ? "راجع كلمات مرورك وتأكد من عدم استخدام كلمة واحدة لحسابين." : "Review your passwords and ensure you don't reuse them across accounts.", path: "/tools", action: isRTL ? "حماية المرور" : "Password Safety" }
      ];
    } else {
      return [
        { icon: <ShieldCheck />, text: isRTL ? "أنت خبير! حافظ على تحديث أجهزتك بانتظام." : "You're an expert! Keep your devices updated regularly.", path: "/tools", action: isRTL ? "مراجعة القائمة" : "Review List" },
        { icon: <Bell />, text: isRTL ? "ساعد أصدقاءك وعائلتك على فهم أساسيات الأمان الرقمي." : "Help your friends and family understand digital security basics.", path: "/about", action: isRTL ? "شارك المنصة" : "Share Platform" },
        { icon: <CheckSquare />, text: isRTL ? "ملفك مثالي. استمر في فحص الروابط المشبوهة عند استلامها." : "Your profile is excellent. Keep checking suspicious links when received.", path: "/check-link", action: isRTL ? "أداة الفحص" : "Scan Tool" }
      ];
    }
  };

  const recommendations = getRecommendations();

  const recentActivity = [
    ...(quizScore !== null ? [{ icon: <ClipboardCheck className="w-4 h-4 text-emerald-400" />, text: `${t("dashboard.completedQuiz")} ${quizScore}%`, time: t("dashboard.today") }] : []),
    ...(linksChecked > 0 ? [{ icon: <Search className="w-4 h-4 text-blue-400" />, text: `${t("dashboard.checkedLinks")} ${linksChecked} ${linksChecked > 1 ? t("dashboard.links_plural") : t("dashboard.links")}`, time: t("dashboard.today") }] : []),
    ...(toolsChecked.length > 0 ? [{ icon: <CheckSquare className="w-4 h-4 text-primary" />, text: `${t("dashboard.toolsActivated")} ${toolsChecked.length} ${t("dashboard.securityTools")}`, time: t("dashboard.today") }] : []),
    { icon: <Calendar className="w-4 h-4 text-muted-foreground" />, text: t("dashboard.joinedPlatform"), time: t("dashboard.onRegistration") },
  ];

  const saveEdit = (id: string) => {
    setVideos((prev) => prev.map((v) => v.id === id ? { ...v, ...editData } : v));
    setEditingId(null);
    setEditData({});
    toast({ title: t("dashboard.videoSaved") });
  };

  const deleteVideo = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  const addVideo = () => {
    if (!newVideo.title) return;
    const video: Video = {
      id: Date.now().toString(),
      title: newVideo.title || "",
      url: newVideo.url || "",
      category: newVideo.category || "",
      duration: newVideo.duration || "60s",
    };
    setVideos((prev) => [...prev, video]);
    setNewVideo({ title: "", url: "", category: "", duration: "" });
    setIsAddingNew(false);
    toast({ title: t("dashboard.videoSaved") });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black">{t("dashboard.greeting")} {user.name} 👋</h1>
        <p className="text-muted-foreground mt-2">{t("dashboard.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-[2rem] p-8 border-white/5 flex flex-col items-center text-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
              <span className="text-2xl font-black text-primary">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="absolute -bottom-1 -end-1 bg-background rounded-full p-0.5">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
          </div>
          <div className={`inline-flex items-center px-4 py-1.5 rounded-full border font-bold text-sm ${level.badgeColor}`}>
            {levelLabel()}
          </div>
          <div className="w-full mt-2 pt-4 border-t border-white/5 grid grid-cols-2 gap-3 text-sm">
            <div className="bg-black/30 px-3 py-2 rounded-xl border border-white/5">
              <span className="block text-muted-foreground text-xs mb-1">{t("dashboard.securityLevel")}</span>
              <span className="font-bold text-base text-primary">{score}%</span>
            </div>
            <div className="bg-black/30 px-3 py-2 rounded-xl border border-white/5">
              <span className="block text-muted-foreground text-xs mb-1">{t("dashboard.toolsEnabled")}</span>
              <span className="font-bold text-base">{toolsChecked.length}/8</span>
            </div>
          </div>
        </motion.div>

        {/* Security Score Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="lg:col-span-2 glass-card rounded-[2rem] p-8 border-white/5 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
          <div className="absolute top-0 end-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="shrink-0 relative">
            <CircularProgress value={score} size={160} strokeWidth={12} colorClass={level.color} />
          </div>
          <div className="text-center md:text-start flex-grow">
            <h2 className="text-2xl font-bold mb-2">{t("dashboard.securityScore")}</h2>
            <p className="text-muted-foreground mb-5 leading-relaxed max-w-md text-sm">{t("dashboard.scoreDesc")}</p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <div className="bg-black/40 px-3 py-2 rounded-xl border border-white/5 text-sm">
                <span className="block text-muted-foreground mb-1 text-xs">{t("dashboard.linksChecked")}</span>
                <span className="font-bold">{linksChecked}</span>
              </div>
              <div className="bg-black/40 px-3 py-2 rounded-xl border border-white/5 text-sm">
                <span className="block text-muted-foreground mb-1 text-xs">{t("dashboard.quizResult")}</span>
                <span className="font-bold">{quizScore !== null ? `${quizScore}%` : t("dashboard.notCompleted")}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
              <Button size="sm" className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setLocation("/check-link")}>
                <Link2 className="w-4 h-4 mx-1" /> {t("dashboard.checkLink")}
              </Button>
              <Button size="sm" variant="outline" className="rounded-xl border-white/10 hover:bg-white/5" onClick={() => setLocation("/security-test")}>
                <Target className="w-4 h-4 mx-1" /> {t("dashboard.retakeTest")}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">{t("dashboard.activity")}</h3>
        <div className="glass-card rounded-2xl border-white/5 divide-y divide-white/5">
          {recentActivity.map((activity, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: isRTL ? 10 : -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="flex items-center gap-4 px-6 py-4">
              <div className="bg-black/30 p-2 rounded-xl border border-white/5 shrink-0">{activity.icon}</div>
              <p className="flex-grow text-sm font-medium">{activity.text}</p>
              <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <h3 className="text-2xl font-bold mb-6">{t("dashboard.recommendations")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {recommendations.map((rec, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col relative group overflow-hidden hover:bg-primary/10 transition-colors">
            <div className="text-primary mb-4 bg-primary/10 w-fit p-3 rounded-xl">{rec.icon}</div>
            <p className="font-medium leading-relaxed mb-6 flex-grow">{rec.text}</p>
            <Button variant="link" className="p-0 text-primary self-start hover:no-underline font-bold" onClick={() => setLocation(rec.path)}>
              {rec.action} <ArrowDir className="w-4 h-4 mx-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Video Management Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-[2rem] p-8 border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20">
              <PlayCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{t("dashboard.videoMgmt")}</h3>
              <p className="text-muted-foreground text-sm mt-0.5">{t("dashboard.videoMgmtDesc")}</p>
            </div>
          </div>
          <Button
            size="sm"
            className="rounded-xl shrink-0"
            onClick={() => { setIsAddingNew(true); setEditingId(null); }}
            disabled={isAddingNew}
          >
            <Plus className="w-4 h-4 mx-1" />
            {t("dashboard.addVideo")}
          </Button>
        </div>

        {/* Add New Video Form */}
        <AnimatePresence>
          {isAddingNew && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 space-y-4">
                <h4 className="font-bold text-primary">{t("dashboard.addVideo")}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">{t("dashboard.videoTitle")}</Label>
                    <Input value={newVideo.title} onChange={(e) => setNewVideo((p) => ({ ...p, title: e.target.value }))} className="h-10 rounded-xl bg-black/40 border-white/10 text-sm" placeholder={isRTL ? "أدخل عنوان الفيديو..." : "Enter video title..."} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">{t("dashboard.videoUrl")}</Label>
                    <div className="relative">
                      <Youtube className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input value={newVideo.url} onChange={(e) => setNewVideo((p) => ({ ...p, url: e.target.value }))} className="h-10 rounded-xl bg-black/40 border-white/10 text-sm pe-9" placeholder="https://youtube.com/..." style={{ direction: "ltr", textAlign: "left" }} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">{t("dashboard.videoCategory")}</Label>
                    <Input value={newVideo.category} onChange={(e) => setNewVideo((p) => ({ ...p, category: e.target.value }))} className="h-10 rounded-xl bg-black/40 border-white/10 text-sm" placeholder={isRTL ? "الفئة" : "Category"} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">{t("dashboard.videoDuration")}</Label>
                    <Input value={newVideo.duration} onChange={(e) => setNewVideo((p) => ({ ...p, duration: e.target.value }))} className="h-10 rounded-xl bg-black/40 border-white/10 text-sm" placeholder="60s" />
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => setIsAddingNew(false)}><X className="w-4 h-4 mx-1" /></Button>
                  <Button size="sm" className="rounded-xl" onClick={addVideo} disabled={!newVideo.title}><Save className="w-4 h-4 mx-1" /> {t("dashboard.saveVideo")}</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video List */}
        <div className="space-y-3">
          {videos.map((video) => (
            <motion.div key={video.id} layout className="bg-black/30 border border-white/5 rounded-2xl overflow-hidden">
              {editingId === video.id ? (
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">{t("dashboard.videoTitle")}</Label>
                      <Input value={editData.title ?? video.title} onChange={(e) => setEditData((p) => ({ ...p, title: e.target.value }))} className="h-10 rounded-xl bg-black/40 border-white/10 text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">{t("dashboard.videoUrl")}</Label>
                      <div className="relative">
                        <Youtube className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input value={editData.url ?? video.url} onChange={(e) => setEditData((p) => ({ ...p, url: e.target.value }))} className="h-10 rounded-xl bg-black/40 border-white/10 text-sm pe-9" placeholder="https://youtube.com/..." style={{ direction: "ltr", textAlign: "left" }} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">{t("dashboard.videoCategory")}</Label>
                      <Input value={editData.category ?? video.category} onChange={(e) => setEditData((p) => ({ ...p, category: e.target.value }))} className="h-10 rounded-xl bg-black/40 border-white/10 text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">{t("dashboard.videoDuration")}</Label>
                      <Input value={editData.duration ?? video.duration} onChange={(e) => setEditData((p) => ({ ...p, duration: e.target.value }))} className="h-10 rounded-xl bg-black/40 border-white/10 text-sm" />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => { setEditingId(null); setEditData({}); }}><X className="w-4 h-4 mx-1" /></Button>
                    <Button size="sm" className="rounded-xl" onClick={() => saveEdit(video.id)}><Save className="w-4 h-4 mx-1" /> {t("dashboard.saveVideo")}</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <PlayCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-medium text-sm truncate">{video.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {video.category && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">{video.category}</span>}
                      {video.duration && <span className="text-xs text-muted-foreground">⏱ {video.duration}</span>}
                      {video.url && <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline truncate max-w-[120px] block" style={{ direction: "ltr" }}>{video.url}</a>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="icon" variant="ghost" className="w-8 h-8 rounded-lg hover:bg-white/10" onClick={() => { setEditingId(video.id); setEditData({}); setIsAddingNew(false); }}>
                      <Edit3 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button size="icon" variant="ghost" className="w-8 h-8 rounded-lg hover:bg-destructive/10" onClick={() => deleteVideo(video.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
