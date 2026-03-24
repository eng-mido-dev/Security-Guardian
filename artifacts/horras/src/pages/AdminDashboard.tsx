import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/context/LangContext";
import { api, type ApiVideo, type AdminUser, type ApiReport } from "@/lib/api";
import {
  Shield, Users, FileText, PlayCircle, Plus, Trash2,
  Edit3, Save, X, Youtube, AlertCircle, Check, Activity,
  Eye, Database, Play, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    YT: {
      Player: new (
        el: HTMLElement,
        opts: {
          height?: string;
          width?: string;
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (event: { target: { getDuration(): number; destroy(): void } }) => void;
            onError?: () => void;
          };
        }
      ) => void;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    if (window.YT?.Player) { resolve(); return; }
    const existing = document.getElementById("yt-iframe-api");
    if (!existing) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.id = "yt-iframe-api";
      document.head.appendChild(tag);
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
  });
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
    /youtube\.com\/v\/([^?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function VideoRowThumb({ url }: { url: string }) {
  const [quality, setQuality] = useState<"mqdefault" | "default" | "error">("mqdefault");
  const videoId = extractYouTubeId(url);
  const src = videoId && quality !== "error" ? `https://i.ytimg.com/vi/${videoId}/${quality}.jpg` : null;
  return (
    <div className="w-16 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden relative group/thumb">
      {src ? (
        <img src={src} alt="" className="w-full h-full object-cover" onError={() => quality === "mqdefault" ? setQuality("default") : setQuality("error")} />
      ) : (
        <Youtube className="w-5 h-5 text-white/20" />
      )}
      {src && <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity"><Play className="w-3 h-3 text-white fill-white" /></div>}
    </div>
  );
}

export default function AdminDashboard() {
  const { isRTL } = useLang();
  const { toast } = useToast();

  const [videos, setVideos] = useState<ApiVideo[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<ApiReport[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<ApiVideo>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newVideo, setNewVideo] = useState<Partial<Omit<ApiVideo, "id" | "createdAt">>>({ title: "", titleAr: "", url: "", category: "", duration: "", description: "" });
  const [titleFetching, setTitleFetching] = useState(false);
  const [activeTab, setActiveTab] = useState<"videos" | "reports" | "users">("videos");
  const [durationFetching, setDurationFetching] = useState(false);
  const cancelFetchRef = useRef<(() => void) | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api.videos.list().then(setVideos).finally(() => setVideosLoading(false));
    api.admin.users().then(setUsers).catch(() => {});
    api.reports.list().then(setReports).catch(() => {});
  }, []);

  const fetchDuration = useCallback(async (url: string, target: "new" | "edit") => {
    const videoId = extractYouTubeId(url);
    if (!videoId) return;

    cancelFetchRef.current?.();
    setDurationFetching(true);

    let cancelled = false;
    let containerEl: HTMLDivElement | null = null;

    cancelFetchRef.current = () => {
      cancelled = true;
      try { containerEl?.remove(); } catch {}
    };

    try {
      await loadYouTubeAPI();
      if (cancelled) return;

      containerEl = document.createElement("div");
      containerEl.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;";
      document.body.appendChild(containerEl);

      new window.YT.Player(containerEl, {
        height: "1",
        width: "1",
        videoId,
        playerVars: { autoplay: 0 },
        events: {
          onReady: (event) => {
            if (!cancelled) {
              const secs = event.target.getDuration();
              if (secs > 0) {
                const mins = Math.floor(secs / 60);
                const s = Math.floor(secs % 60);
                const formatted = `${mins}:${s.toString().padStart(2, "0")}`;
                if (target === "new") {
                  setNewVideo((p) => ({ ...p, duration: formatted }));
                } else {
                  setEditData((p) => ({ ...p, duration: formatted }));
                }
              }
            }
            event.target.destroy();
            containerEl?.remove();
            setDurationFetching(false);
          },
          onError: () => {
            containerEl?.remove();
            setDurationFetching(false);
          },
        },
      });
    } catch {
      containerEl?.remove();
      setDurationFetching(false);
    }
  }, []);

  const translateToArabic = async (text: string): Promise<string> => {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ar&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      if (!res.ok) return "";
      const data = await res.json();
      const translated = (data as string[][][])[0]?.map((chunk) => chunk[0]).join("") ?? "";
      return translated;
    } catch {
      return "";
    }
  };

  const fetchYouTubeTitle = useCallback(async (url: string, target: "new" | "edit") => {
    try {
      setTitleFetching(true);
      const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const res = await fetch(oEmbedUrl);
      if (!res.ok) return;
      const data = await res.json();
      if (data.title) {
        const fetchedTitle = data.title as string;
        const arabicTitle = await translateToArabic(fetchedTitle);
        if (target === "new") {
          setNewVideo((p) => ({
            ...p,
            title: p.title ? p.title : fetchedTitle,
            titleAr: p.titleAr ? p.titleAr : (arabicTitle || fetchedTitle),
          }));
        } else {
          setEditData((p) => ({
            ...p,
            title: p.title ? p.title : fetchedTitle,
            titleAr: p.titleAr ? p.titleAr : (arabicTitle || fetchedTitle),
          }));
        }
      }
    } catch {
    } finally {
      setTitleFetching(false);
    }
  }, []);

  const handleUrlChange = useCallback(
    (url: string, target: "new" | "edit") => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (target === "new") {
        setNewVideo((p) => ({ ...p, url }));
      } else {
        setEditData((p) => ({ ...p, url }));
      }
      const videoId = extractYouTubeId(url);
      if (videoId) {
        debounceRef.current = setTimeout(() => {
          fetchDuration(url, target);
          fetchYouTubeTitle(url, target);
        }, 800);
      }
    },
    [fetchDuration, fetchYouTubeTitle]
  );

  const saveEdit = async (id: number) => {
    try {
      const updated = await api.videos.update(id, editData);
      setVideos((vs) => vs.map((v) => (v.id === id ? updated : v)));
      setEditingId(null);
      setEditData({});
      toast({ title: isRTL ? "تم حفظ التغييرات" : "Changes saved" });
    } catch {
      toast({ title: isRTL ? "فشل الحفظ" : "Save failed", variant: "destructive" });
    }
  };

  const deleteVideo = async (id: number) => {
    try {
      await api.videos.delete(id);
      setVideos((vs) => vs.filter((v) => v.id !== id));
      toast({ title: isRTL ? "تم حذف الفيديو" : "Video deleted" });
    } catch {
      toast({ title: isRTL ? "فشل الحذف" : "Delete failed", variant: "destructive" });
    }
  };

  const addVideo = async () => {
    if (!newVideo.title) return;
    try {
      const video = await api.videos.create({
        title: newVideo.title,
        titleAr: newVideo.titleAr || "",
        url: newVideo.url || "",
        category: newVideo.category || "",
        duration: newVideo.duration || "60s",
        description: newVideo.description || "",
      });
      setVideos((vs) => [...vs, video]);
      setNewVideo({ title: "", titleAr: "", url: "", category: "", duration: "", description: "" });
      setIsAddingNew(false);
      toast({ title: isRTL ? "تم إضافة الفيديو" : "Video added" });
    } catch {
      toast({ title: isRTL ? "فشلت الإضافة" : "Add failed", variant: "destructive" });
    }
  };

  const stats = [
    { icon: <Users className="w-5 h-5" />, label: isRTL ? "المستخدمون المسجلون" : "Registered Users", value: users.length, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
    { icon: <FileText className="w-5 h-5" />, label: isRTL ? "إجمالي البلاغات" : "Total Reports", value: reports.length, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
    { icon: <PlayCircle className="w-5 h-5" />, label: isRTL ? "فيديوهات التعلم" : "Learning Videos", value: videos.length, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
    { icon: <Activity className="w-5 h-5" />, label: isRTL ? "بلاغات معلقة" : "Pending Reports", value: reports.filter((r) => r.status === "pending").length, color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
  ];

  const tabs = [
    { id: "videos" as const, label: isRTL ? "فيديوهات التعلم" : "Learning Videos", icon: <PlayCircle className="w-4 h-4" /> },
    { id: "reports" as const, label: isRTL ? "البلاغات" : "Reports", icon: <FileText className="w-4 h-4" /> },
    { id: "users" as const, label: isRTL ? "المستخدمون" : "Users", icon: <Users className="w-4 h-4" /> },
  ];

  const urlInputClass = "h-10 rounded-xl bg-black/40 border-white/10 text-sm px-12 focus-visible:ring-1 focus-visible:ring-primary/60 focus-visible:border-primary/50";

  return (
    <div className="min-h-screen bg-[#070709]">
      <div className="border-b border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/30">
                <Shield className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold bg-primary/20 text-primary px-2.5 py-0.5 rounded-full border border-primary/30 uppercase tracking-wider">
                    {isRTL ? "مدير النظام" : "System Admin"}
                  </span>
                </div>
                <h1 className="text-2xl font-black">{isRTL ? "لوحة تحكم المدير" : "Admin Control Panel"}</h1>
                <p className="text-muted-foreground text-sm mt-0.5">admin@h.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-end hidden md:block">
                <p className="text-xs text-muted-foreground">{isRTL ? "آخر تسجيل دخول" : "Last Login"}</p>
                <p className="text-sm font-bold">{new Date().toLocaleDateString(isRTL ? "ar-SA" : "en-US")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`rounded-2xl p-5 border ${stat.bg}`}
            >
              <div className={`${stat.color} mb-3`}>{stat.icon}</div>
              <p className="text-3xl font-black mb-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/5 mb-6 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === "videos" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{isRTL ? "إدارة فيديوهات التعلم" : "Learning Videos Management"}</h2>
              <Button size="sm" className="rounded-xl gap-1.5" onClick={() => { setIsAddingNew(true); setEditingId(null); }} disabled={isAddingNew}>
                <Plus className="w-4 h-4" />
                {isRTL ? "إضافة فيديو" : "Add Video"}
              </Button>
            </div>

            <AnimatePresence>
              {isAddingNew && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 space-y-4">
                    <h4 className="font-bold text-primary text-sm">{isRTL ? "فيديو جديد" : "New Video"}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground flex items-center gap-2">
                          {isRTL ? "العنوان (إنجليزي)" : "Title (English)"}
                          {titleFetching && (
                            <span className="flex items-center gap-1 text-primary/60 text-[10px] font-medium">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              {isRTL ? "ترجمة تلقائية..." : "Auto-translating..."}
                            </span>
                          )}
                        </Label>
                        <Input value={newVideo.title} onChange={(e) => setNewVideo((p) => ({ ...p, title: e.target.value }))} className="h-10 rounded-xl bg-black/40 border-white/10 text-sm" placeholder={titleFetching ? (isRTL ? "جاري الجلب..." : "Fetching...") : ""} readOnly={titleFetching} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">{isRTL ? "العنوان (عربي - يُملأ تلقائياً)" : "Title (Arabic - auto-filled)"}</Label>
                        <Input value={newVideo.titleAr || ""} onChange={(e) => setNewVideo((p) => ({ ...p, titleAr: e.target.value }))} className="h-10 rounded-xl bg-black/40 border-white/10 text-sm" dir="rtl" placeholder={titleFetching ? (isRTL ? "جاري الترجمة..." : "Translating...") : (isRTL ? "العنوان بالعربية" : "Arabic title")} readOnly={titleFetching} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">{isRTL ? "رابط YouTube" : "YouTube URL"}</Label>
                        <div className="relative">
                          <Youtube className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none z-10" />
                          <Input
                            value={newVideo.url}
                            onChange={(e) => handleUrlChange(e.target.value, "new")}
                            className={urlInputClass}
                            style={{ direction: "ltr", textAlign: "left" }}
                            placeholder="https://youtube.com/watch?v=..."
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">{isRTL ? "التصنيف" : "Category"}</Label>
                        <Input value={newVideo.category} onChange={(e) => setNewVideo((p) => ({ ...p, category: e.target.value }))} className="h-10 rounded-xl bg-black/40 border-white/10 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          {isRTL ? "المدة" : "Duration"}
                        </Label>
                        <Input
                          value={durationFetching ? "" : (newVideo.duration || "")}
                          onChange={(e) => setNewVideo((p) => ({ ...p, duration: e.target.value }))}
                          className="h-10 rounded-xl bg-black/40 border-white/10 text-sm"
                          placeholder={durationFetching ? (isRTL ? "جاري الجلب..." : "Fetching...") : "60s"}
                          readOnly={durationFetching}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">{isRTL ? "الوصف (اختياري)" : "Description (optional)"}</Label>
                      <textarea
                        value={newVideo.description || ""}
                        onChange={(e) => setNewVideo((p) => ({ ...p, description: e.target.value }))}
                        rows={2}
                        placeholder={isRTL ? "وصف قصير عن محتوى الفيديو..." : "Short description about the video content..."}
                        className="w-full rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder:text-white/30 px-3 py-2.5 resize-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
                      />
                    </div>
                    <div className="flex gap-3 justify-end">
                      <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => { setIsAddingNew(false); cancelFetchRef.current?.(); }}><X className="w-4 h-4" /></Button>
                      <Button size="sm" className="rounded-xl gap-1.5" onClick={addVideo} disabled={!newVideo.title}>
                        <Save className="w-4 h-4" /> {isRTL ? "حفظ" : "Save"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {videosLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {videos.length === 0 && !isAddingNew && (
                  <div className="text-center py-16 text-muted-foreground">
                    <PlayCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>{isRTL ? "لا توجد فيديوهات. أضف أول فيديو!" : "No videos yet. Add your first video!"}</p>
                  </div>
                )}
                {videos.map((video) => (
                  <motion.div key={video.id} layout className="bg-[#0D0D0F] border border-white/5 rounded-2xl overflow-hidden">
                    {editingId === video.id ? (
                      <div className="p-5 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground flex items-center gap-2">
                              {isRTL ? "العنوان (إنجليزي)" : "Title (English)"}
                              {titleFetching && (
                                <span className="flex items-center gap-1 text-primary/60 text-[10px] font-medium">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  {isRTL ? "ترجمة..." : "Translating..."}
                                </span>
                              )}
                            </Label>
                            <Input value={editData.title ?? video.title} onChange={(e) => setEditData((p) => ({ ...p, title: e.target.value }))} className="h-10 rounded-xl bg-black/40 border-white/10 text-sm" />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">{isRTL ? "العنوان (عربي)" : "Title (Arabic)"}</Label>
                            <Input value={editData.titleAr ?? video.titleAr ?? ""} onChange={(e) => setEditData((p) => ({ ...p, titleAr: e.target.value }))} className="h-10 rounded-xl bg-black/40 border-white/10 text-sm" dir="rtl" placeholder={titleFetching ? (isRTL ? "جاري الترجمة..." : "Translating...") : (isRTL ? "العنوان بالعربية" : "Arabic title")} readOnly={titleFetching} />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">{isRTL ? "رابط YouTube" : "YouTube URL"}</Label>
                            <div className="relative">
                              <Youtube className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none z-10" />
                              <Input
                                value={editData.url ?? video.url}
                                onChange={(e) => handleUrlChange(e.target.value, "edit")}
                                className={urlInputClass}
                                style={{ direction: "ltr", textAlign: "left" }}
                                placeholder="https://youtube.com/watch?v=..."
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">{isRTL ? "التصنيف" : "Category"}</Label>
                            <Input value={editData.category ?? video.category} onChange={(e) => setEditData((p) => ({ ...p, category: e.target.value }))} className="h-10 rounded-xl bg-black/40 border-white/10 text-sm" />
                          </div>
                          <div className="space-y-1.5 sm:col-span-2">
                            <Label className="text-xs text-muted-foreground">{isRTL ? "الوصف (اختياري)" : "Description (optional)"}</Label>
                            <textarea
                              value={editData.description ?? (video.description || "")}
                              onChange={(e) => setEditData((p) => ({ ...p, description: e.target.value }))}
                              rows={2}
                              placeholder={isRTL ? "وصف قصير عن محتوى الفيديو..." : "Short description about the video content..."}
                              className="w-full rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder:text-white/30 px-3 py-2.5 resize-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">
                              {isRTL ? "المدة" : "Duration"}
                            </Label>
                            <Input
                              value={durationFetching ? "" : (editData.duration ?? video.duration)}
                              onChange={(e) => setEditData((p) => ({ ...p, duration: e.target.value }))}
                              className="h-10 rounded-xl bg-black/40 border-white/10 text-sm"
                              placeholder={durationFetching ? (isRTL ? "جاري الجلب..." : "Fetching...") : "60s"}
                              readOnly={durationFetching}
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                          <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => { setEditingId(null); setEditData({}); cancelFetchRef.current?.(); }}><X className="w-4 h-4" /></Button>
                          <Button size="sm" className="rounded-xl gap-1.5" onClick={() => saveEdit(video.id)}><Save className="w-4 h-4" /> {isRTL ? "حفظ" : "Save"}</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 px-4 py-3">
                        {video.url ? (
                          <VideoRowThumb url={video.url} />
                        ) : (
                          <div className="w-16 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <PlayCircle className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <div className="flex-grow min-w-0">
                          <p className="font-medium text-sm">{video.title}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {video.category && <span className="text-xs bg-white/5 text-muted-foreground px-2 py-0.5 rounded-full">{video.category}</span>}
                            {video.duration && <span className="text-xs text-muted-foreground/60">⏱ {video.duration}</span>}
                            {video.url && <span className="text-xs text-emerald-400/70 flex items-center gap-1"><Youtube className="w-3 h-3" />{isRTL ? "رابط مرتبط" : "Link attached"}</span>}
                          </div>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <Button size="icon" variant="ghost" className="w-8 h-8 rounded-lg" onClick={() => { setEditingId(video.id); setEditData({}); setIsAddingNew(false); }}>
                            <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                          <Button size="icon" variant="ghost" className="w-8 h-8 rounded-lg hover:bg-red-500/10" onClick={() => deleteVideo(video.id)}>
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "reports" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{isRTL ? "بلاغات المستخدمين" : "User Reports"}</h2>
              <span className="text-xs text-muted-foreground bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                {reports.length} {isRTL ? "بلاغ" : "reports"}
              </span>
            </div>

            {reports.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground bg-[#0D0D0F] border border-white/5 rounded-2xl">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{isRTL ? "لا توجد بلاغات حتى الآن" : "No reports submitted yet"}</p>
              </div>
            ) : (
              <div className="bg-[#0D0D0F] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-muted-foreground text-xs uppercase tracking-wider">
                        <th className="px-4 py-3 text-start font-medium">#</th>
                        <th className="px-4 py-3 text-start font-medium">{isRTL ? "البريد الإلكتروني" : "Email"}</th>
                        <th className="px-4 py-3 text-start font-medium">{isRTL ? "نوع الاحتيال" : "Fraud Type"}</th>
                        <th className="px-4 py-3 text-start font-medium">{isRTL ? "الرابط / التفاصيل" : "URL / Details"}</th>
                        <th className="px-4 py-3 text-start font-medium">{isRTL ? "التاريخ" : "Date"}</th>
                        <th className="px-4 py-3 text-start font-medium">{isRTL ? "الحالة" : "Status"}</th>
                        <th className="px-4 py-3 text-start font-medium">{isRTL ? "الإجراء" : "Actions"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {reports.map((report) => (
                        <tr key={report.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">#{report.id}</td>
                          <td className="px-4 py-3.5 text-xs max-w-[140px] truncate">
                            {report.isAnonymous === "true"
                              ? <span className="text-muted-foreground italic">{isRTL ? "مجهول" : "Anonymous"}</span>
                              : <span className="text-white/70">{report.userEmail}</span>}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                              {report.fraudType}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 max-w-[180px]">
                            {report.url ? (
                              <span className="text-xs text-blue-400/70 font-mono truncate block" dir="ltr">{report.url}</span>
                            ) : report.description ? (
                              <span className="text-xs text-muted-foreground truncate block">{report.description.substring(0, 50)}{report.description.length > 50 ? "…" : ""}</span>
                            ) : (
                              <span className="text-muted-foreground/40">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(report.submittedAt).toLocaleDateString(isRTL ? "ar-SA" : "en-US", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-4 py-3.5">
                            {report.status === "pending"
                              ? <span className="flex items-center gap-1 text-xs text-amber-400 whitespace-nowrap"><AlertCircle className="w-3 h-3" /> {isRTL ? "معلق" : "Pending"}</span>
                              : <span className="flex items-center gap-1 text-xs text-emerald-400 whitespace-nowrap"><Check className="w-3 h-3" /> {isRTL ? "محلول" : "Resolved"}</span>}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {report.status === "pending" && (
                                <button
                                  title={isRTL ? "تعيين كمحلول" : "Mark as Resolved"}
                                  onClick={async () => {
                                    try {
                                      const updated = await api.reports.resolve(report.id);
                                      setReports((prev) => prev.map((r) => r.id === report.id ? { ...r, status: updated.status } : r));
                                      toast({ title: isRTL ? "تم حل البلاغ" : "Report resolved" });
                                    } catch {
                                      toast({ title: isRTL ? "فشلت العملية" : "Operation failed", variant: "destructive" });
                                    }
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-400 text-muted-foreground transition-colors"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                title={isRTL ? "حذف البلاغ" : "Delete Report"}
                                onClick={async () => {
                                  try {
                                    await api.reports.delete(report.id);
                                    setReports((prev) => prev.filter((r) => r.id !== report.id));
                                    toast({ title: isRTL ? "تم حذف البلاغ" : "Report deleted" });
                                  } catch {
                                    toast({ title: isRTL ? "فشل الحذف" : "Delete failed", variant: "destructive" });
                                  }
                                }}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-muted-foreground transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "users" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-lg font-bold mb-4">{isRTL ? "المستخدمون المسجلون" : "Registered Users"}</h2>
            {users.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Database className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>{isRTL ? "لا يوجد مستخدمون مسجلون بعد" : "No registered users yet"}</p>
              </div>
            ) : (
              <div className="bg-[#0D0D0F] border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-muted-foreground text-xs uppercase tracking-wider">
                      <th className="px-5 py-3 text-start font-medium">{isRTL ? "الاسم" : "Name"}</th>
                      <th className="px-5 py-3 text-start font-medium">{isRTL ? "البريد الإلكتروني" : "Email"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-black text-white">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground" dir="ltr">{u.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
