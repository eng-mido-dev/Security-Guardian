import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/context/LangContext";
import { api, type ApiVideo, type AdminUser, type ApiReport, type ApiCategory, type ApiNotification, type ApiAdminLog, type ApiAnalytics } from "@/lib/api";
import { translateToEnglish, translateToArabic } from "@/lib/translate";
import {
  Shield, Users, FileText, PlayCircle, Plus, Trash2,
  Edit3, Save, X, Youtube, AlertCircle, Check, Activity,
  Eye, Database, Play, Loader2, Tag, ChevronDown, Search,
  Bell, BellOff, BarChart2, BarChart3, ClipboardList, KeyRound,
  TrendingUp, AlertTriangle, RefreshCw, ToggleLeft, ToggleRight,
  Clock, User, ChevronRight, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

function getLocalizedCategory(category: string, isRTL: boolean): string {
  if (!category) return "";
  const parts = category.split(/\s[-–]\s/);
  if (parts.length < 2) return category;
  const hasArabic = (s: string) => /[\u0600-\u06FF]/.test(s);
  const arPart = parts.find(hasArabic) ?? parts[0];
  const enPart = parts.find((p) => !hasArabic(p)) ?? parts[1];
  return isRTL ? arPart : enPart;
}

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
  const [newVideo, setNewVideo] = useState<Partial<Omit<ApiVideo, "id" | "createdAt">>>({ title: "", titleAr: "", url: "", category: "", duration: "", description: "", descriptionAr: "" });
  const [titleFetching, setTitleFetching] = useState(false);
  const [titleTranslating, setTitleTranslating] = useState(false);
  const [descTranslating, setDescTranslating] = useState(false);
  const [titleTranslatingFromAr, setTitleTranslatingFromAr] = useState(false);
  const [descTranslatingFromAr, setDescTranslatingFromAr] = useState(false);
  const [activeTab, setActiveTab] = useState<"videos" | "reports" | "users" | "categories" | "analytics" | "notifications" | "logs">("videos");
  const [durationFetching, setDurationFetching] = useState(false);
  const [expandedDescId, setExpandedDescId] = useState<number | null>(null);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [catEditData, setCatEditData] = useState<Record<number, { nameAr: string; nameEn: string }>>({});
  const [catSaving, setCatSaving] = useState<number | null>(null);
  const [newCat, setNewCat] = useState({ nameAr: "", nameEn: "" });
  const [newCatSaving, setNewCatSaving] = useState(false);
  const [catDropOpen, setCatDropOpen] = useState(false);
  const [editCatDropOpen, setEditCatDropOpen] = useState(false);
  const catDropRef = useRef<HTMLDivElement>(null);
  const editCatDropRef = useRef<HTMLDivElement>(null);
  const cancelFetchRef = useRef<(() => void) | null>(null);

  // ── Users tab ──
  const [userSearch, setUserSearch] = useState("");
  const [userDeleting, setUserDeleting] = useState<number | null>(null);
  const [userResetting, setUserResetting] = useState<number | null>(null);
  const [resetResult, setResetResult] = useState<{ email: string; password: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string; email: string } | null>(null);

  // ── Analytics tab ──
  const [analytics, setAnalytics] = useState<ApiAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // ── Notifications tab ──
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [newNotif, setNewNotif] = useState({ titleAr: "", titleEn: "", bodyAr: "", bodyEn: "" });
  const [notifSending, setNotifSending] = useState(false);
  const [notifToggling, setNotifToggling] = useState<number | null>(null);

  // ── Logs tab ──
  const [logs, setLogs] = useState<ApiAdminLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const descDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const arTitleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const arDescDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Universal AR→EN auto-translate states ──
  const [newCatTranslating, setNewCatTranslating] = useState(false);
  const [catEditTranslating, setCatEditTranslating] = useState<number | null>(null);
  const [notifTitleTranslating, setNotifTitleTranslating] = useState(false);
  const [notifBodyTranslating, setNotifBodyTranslating] = useState(false);
  const catNameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const catEditDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notifTitleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notifBodyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api.videos.list().then(setVideos).finally(() => setVideosLoading(false));
    api.admin.users().then(setUsers).catch(() => {});
    api.reports.list().then(setReports).catch(() => {});
    api.admin.categories.list().then((cats) => {
      setCategories(cats);
      const init: Record<number, { nameAr: string; nameEn: string }> = {};
      cats.forEach((c) => { init[c.id] = { nameAr: c.nameAr, nameEn: c.nameEn }; });
      setCatEditData(init);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab !== "categories") return;
    setCategoriesLoading(true);
    api.admin.categories.list().then((cats) => {
      setCategories(cats);
      const init: Record<number, { nameAr: string; nameEn: string }> = {};
      cats.forEach((c) => { init[c.id] = { nameAr: c.nameAr, nameEn: c.nameEn }; });
      setCatEditData(init);
    }).catch(() => {}).finally(() => setCategoriesLoading(false));
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "analytics") return;
    setAnalyticsLoading(true);
    api.admin.analytics().then(setAnalytics).catch(() => {}).finally(() => setAnalyticsLoading(false));
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "notifications") return;
    setNotifLoading(true);
    api.admin.notifications.list().then(setNotifications).catch(() => {}).finally(() => setNotifLoading(false));
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "logs") return;
    setLogsLoading(true);
    api.admin.logs().then(setLogs).catch(() => {}).finally(() => setLogsLoading(false));
  }, [activeTab]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catDropRef.current && !catDropRef.current.contains(e.target as Node)) setCatDropOpen(false);
      if (editCatDropRef.current && !editCatDropRef.current.contains(e.target as Node)) setEditCatDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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

  const handleTitleChange = useCallback(
    (titleEn: string, target: "new" | "edit") => {
      if (target === "new") setNewVideo((p) => ({ ...p, title: titleEn }));
      else setEditData((p) => ({ ...p, title: titleEn }));
    },
    []
  );

  const handleDescriptionChange = useCallback(
    (desc: string, target: "new" | "edit") => {
      if (target === "new") setNewVideo((p) => ({ ...p, description: desc }));
      else setEditData((p) => ({ ...p, description: desc }));
    },
    []
  );

  const handleArTitleChange = useCallback(
    (titleAr: string, target: "new" | "edit") => {
      if (target === "new") setNewVideo((p) => ({ ...p, titleAr }));
      else setEditData((p) => ({ ...p, titleAr }));
      if (arTitleDebounceRef.current) clearTimeout(arTitleDebounceRef.current);
      if (!titleAr.trim()) return;
      arTitleDebounceRef.current = setTimeout(async () => {
        setTitleTranslatingFromAr(true);
        try {
          const translated = await translateToEnglish(titleAr);
          if (translated) {
            if (target === "new") setNewVideo((p) => ({ ...p, title: translated }));
            else setEditData((p) => ({ ...p, title: translated }));
          }
        } catch { } finally { setTitleTranslatingFromAr(false); }
      }, 500);
    },
    []
  );

  const handleArDescriptionChange = useCallback(
    (descAr: string, target: "new" | "edit") => {
      if (target === "new") setNewVideo((p) => ({ ...p, descriptionAr: descAr }));
      else setEditData((p) => ({ ...p, descriptionAr: descAr }));
      if (arDescDebounceRef.current) clearTimeout(arDescDebounceRef.current);
      if (!descAr.trim()) return;
      arDescDebounceRef.current = setTimeout(async () => {
        setDescTranslatingFromAr(true);
        try {
          const translated = await translateToEnglish(descAr);
          if (translated) {
            if (target === "new") setNewVideo((p) => ({ ...p, description: translated }));
            else setEditData((p) => ({ ...p, description: translated }));
          }
        } catch { } finally { setDescTranslatingFromAr(false); }
      }, 500);
    },
    []
  );

  /* ── Category: new nameAr → nameEn ── */
  const handleNewCatArChange = useCallback((nameAr: string) => {
    setNewCat((p) => ({ ...p, nameAr }));
    if (catNameDebounceRef.current) clearTimeout(catNameDebounceRef.current);
    if (!nameAr.trim()) return;
    catNameDebounceRef.current = setTimeout(async () => {
      setNewCatTranslating(true);
      try {
        const translated = await translateToEnglish(nameAr);
        if (translated) setNewCat((p) => ({ ...p, nameEn: translated }));
      } catch { } finally { setNewCatTranslating(false); }
    }, 500);
  }, []);

  /* ── Category: edit nameAr → nameEn ── */
  const handleCatEditArChange = useCallback((id: number, d: { nameAr: string; nameEn: string }, nameAr: string) => {
    setCatEditData((prev) => ({ ...prev, [id]: { ...d, nameAr } }));
    if (catEditDebounceRef.current) clearTimeout(catEditDebounceRef.current);
    if (!nameAr.trim()) return;
    catEditDebounceRef.current = setTimeout(async () => {
      setCatEditTranslating(id);
      try {
        const translated = await translateToEnglish(nameAr);
        if (translated) setCatEditData((prev) => ({ ...prev, [id]: { ...prev[id], nameEn: translated } }));
      } catch { } finally { setCatEditTranslating(null); }
    }, 500);
  }, []);

  /* ── Notification: titleAr → titleEn ── */
  const handleNotifTitleArChange = useCallback((titleAr: string) => {
    setNewNotif((p) => ({ ...p, titleAr }));
    if (notifTitleDebounceRef.current) clearTimeout(notifTitleDebounceRef.current);
    if (!titleAr.trim()) return;
    notifTitleDebounceRef.current = setTimeout(async () => {
      setNotifTitleTranslating(true);
      try {
        const translated = await translateToEnglish(titleAr);
        if (translated) setNewNotif((p) => ({ ...p, titleEn: translated }));
      } catch { } finally { setNotifTitleTranslating(false); }
    }, 500);
  }, []);

  /* ── Notification: bodyAr → bodyEn ── */
  const handleNotifBodyArChange = useCallback((bodyAr: string) => {
    setNewNotif((p) => ({ ...p, bodyAr }));
    if (notifBodyDebounceRef.current) clearTimeout(notifBodyDebounceRef.current);
    if (!bodyAr.trim()) return;
    notifBodyDebounceRef.current = setTimeout(async () => {
      setNotifBodyTranslating(true);
      try {
        const translated = await translateToEnglish(bodyAr);
        if (translated) setNewNotif((p) => ({ ...p, bodyEn: translated }));
      } catch { } finally { setNotifBodyTranslating(false); }
    }, 500);
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
    if (!newVideo.titleAr) return;
    try {
      const video = await api.videos.create({
        title: newVideo.title || newVideo.titleAr || "",
        titleAr: newVideo.titleAr || "",
        url: newVideo.url || "",
        category: newVideo.category || "",
        duration: newVideo.duration || "60s",
        description: newVideo.description || "",
        descriptionAr: newVideo.descriptionAr || "",
      });
      setVideos((vs) => [...vs, video]);
      setNewVideo({ title: "", titleAr: "", url: "", category: "", duration: "", description: "", descriptionAr: "" });
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
    { id: "videos"        as const, label: isRTL ? "الفيديوهات"   : "Videos",        mobileLabel: isRTL ? "فيديو"   : "Videos",   icon: <PlayCircle  className="w-4 h-4" /> },
    { id: "categories"   as const, label: isRTL ? "التصنيفات"    : "Categories",     mobileLabel: isRTL ? "تصنيف"   : "Cats",     icon: <Settings    className="w-4 h-4" /> },
    { id: "reports"      as const, label: isRTL ? "البلاغات"     : "Reports",        mobileLabel: isRTL ? "بلاغ"    : "Reports",  icon: <FileText    className="w-4 h-4" /> },
    { id: "users"        as const, label: isRTL ? "المستخدمون"   : "Users",          mobileLabel: isRTL ? "مستخدم"  : "Users",    icon: <Users       className="w-4 h-4" /> },
    { id: "analytics"    as const, label: isRTL ? "الإحصائيات"   : "Analytics",      mobileLabel: isRTL ? "إحصاء"   : "Stats",    icon: <BarChart3   className="w-4 h-4" /> },
    { id: "notifications"as const, label: isRTL ? "الإشعارات"    : "Notifications",  mobileLabel: isRTL ? "إشعار"   : "Notifs",   icon: <Bell        className="w-4 h-4" /> },
    { id: "logs"         as const, label: isRTL ? "السجلات"      : "Logs",           mobileLabel: isRTL ? "سجل"     : "Logs",     icon: <ClipboardList className="w-4 h-4" /> },
  ];

  const saveCategory = async (id: number) => {
    const d = catEditData[id];
    if (!d?.nameAr?.trim() || !d?.nameEn?.trim()) return;
    setCatSaving(id);
    try {
      const updated = await api.admin.categories.update(id, d.nameAr.trim(), d.nameEn.trim());
      setCategories((prev) => prev.map((c) => c.id === id ? updated : c));
      toast({ title: isRTL ? "تم حفظ التصنيف" : "Category saved" });
    } catch {
      toast({ title: isRTL ? "فشل الحفظ" : "Save failed", variant: "destructive" });
    } finally {
      setCatSaving(null);
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      await api.admin.categories.delete(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setCatEditData((prev) => { const n = { ...prev }; delete n[id]; return n; });
      toast({ title: isRTL ? "تم حذف التصنيف" : "Category deleted" });
    } catch {
      toast({ title: isRTL ? "فشل الحذف" : "Delete failed", variant: "destructive" });
    }
  };

  const createCategory = async () => {
    if (!newCat.nameAr.trim() || !newCat.nameEn.trim()) return;
    setNewCatSaving(true);
    try {
      const created = await api.admin.categories.create(newCat.nameAr.trim(), newCat.nameEn.trim());
      setCategories((prev) => [...prev, created]);
      setCatEditData((prev) => ({ ...prev, [created.id]: { nameAr: created.nameAr, nameEn: created.nameEn } }));
      setNewCat({ nameAr: "", nameEn: "" });
      toast({ title: isRTL ? "تم إضافة التصنيف" : "Category added" });
    } catch {
      toast({ title: isRTL ? "فشلت الإضافة" : "Add failed", variant: "destructive" });
    } finally {
      setNewCatSaving(false);
    }
  };

  // ── User management ───────────────────────────────────────────────────────────
  const deleteUser = (id: number) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    setDeleteConfirm({ id, name: target.name, email: target.email });
  };

  const confirmDeleteUser = async () => {
    if (!deleteConfirm) return;
    const { id } = deleteConfirm;
    setDeleteConfirm(null);
    setUserDeleting(id);
    try {
      await api.admin.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast({ title: isRTL ? "تم حذف المستخدم" : "User deleted" });
    } catch {
      toast({ title: isRTL ? "فشل الحذف" : "Delete failed", variant: "destructive" });
    } finally {
      setUserDeleting(null);
    }
  };

  const resetPassword = async (id: number) => {
    setUserResetting(id);
    try {
      const res = await api.admin.resetPassword(id);
      setResetResult({ email: res.userEmail, password: res.newPassword });
      toast({ title: isRTL ? "تمت إعادة التعيين" : "Password reset" });
    } catch {
      toast({ title: isRTL ? "فشلت إعادة التعيين" : "Reset failed", variant: "destructive" });
    } finally {
      setUserResetting(null);
    }
  };

  // ── Notifications ─────────────────────────────────────────────────────────────
  const sendNotification = async () => {
    if (!newNotif.bodyAr.trim()) return;
    setNotifSending(true);
    try {
      const created = await api.admin.notifications.create({
        titleAr: newNotif.titleAr.trim(),
        titleEn: newNotif.titleEn.trim(),
        bodyAr: newNotif.bodyAr.trim(),
        bodyEn: newNotif.bodyEn.trim(),
      });
      setNotifications((prev) => [created, ...prev]);
      setNewNotif({ titleAr: "", titleEn: "", bodyAr: "", bodyEn: "" });
      toast({ title: isRTL ? "تم إرسال الإشعار" : "Notification sent" });
    } catch {
      toast({ title: isRTL ? "فشل الإرسال" : "Send failed", variant: "destructive" });
    } finally {
      setNotifSending(false);
    }
  };

  const toggleNotification = async (id: number) => {
    setNotifToggling(id);
    try {
      const updated = await api.admin.notifications.toggle(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? updated : n));
    } catch {
      toast({ title: isRTL ? "فشل التحديث" : "Update failed", variant: "destructive" });
    } finally {
      setNotifToggling(null);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await api.admin.notifications.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast({ title: isRTL ? "تم حذف الإشعار" : "Notification deleted" });
    } catch {
      toast({ title: isRTL ? "فشل الحذف" : "Delete failed", variant: "destructive" });
    }
  };

  const urlInputClass = "h-10 rounded-xl bg-black/40 border-white/10 text-sm px-12 focus-visible:ring-1 focus-visible:ring-primary/60 focus-visible:border-primary/50";

  return (
    <div className="flex h-screen overflow-hidden bg-[#070709]" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 h-screen border-e border-white/10 bg-gray-950/50 backdrop-blur-xl z-30">
        {/* Brand */}
        <div className="px-5 py-[18px] border-b border-white/[0.07] shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-primary/15 p-[7px] rounded-xl border border-primary/20">
              <Shield className="w-[18px] h-[18px] text-primary" />
            </div>
            <div>
              <p className="font-black text-sm leading-none mb-0.5">{isRTL ? "حُراس" : "Horras"}</p>
              <p className="text-[10px] text-primary/55 font-medium leading-none">{isRTL ? "مدير النظام" : "System Admin"}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-3 overflow-y-auto scrollbar-none space-y-0.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                  isActive
                    ? "text-primary bg-gradient-to-r from-primary/10 to-transparent"
                    : "text-white/45 hover:text-white hover:bg-white/[0.04] hover:-translate-y-px"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="admin-sidebar-indicator"
                    className="absolute start-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-full shadow-[0_0_10px_rgba(255,184,0,0.55)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className={`shrink-0 transition-colors duration-200 ${isActive ? "text-primary" : "group-hover:text-primary/60"}`}>
                  {tab.icon}
                </span>
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="shrink-0 px-5 py-4 border-t border-white/[0.07]">
          <p className="text-[10px] text-white/25 font-mono leading-none">admin@horras.com</p>
          <p className="text-[10px] text-white/15 mt-1 leading-none">
            {new Date().toLocaleDateString(isRTL ? "ar-SA" : "en-US")}
          </p>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 start-0 end-0 h-16 bg-[#0d0d0d]/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-1 z-50">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 ${
                isActive ? "text-primary" : "text-white/30 hover:text-white/60"
              }`}
            >
              <span className={isActive ? "drop-shadow-[0_0_6px_rgba(255,184,0,0.65)]" : ""}>{tab.icon}</span>
              <span className="text-[9px] font-bold whitespace-nowrap">{tab.mobileLabel}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Slim top bar — current section breadcrumb */}
        <div className="shrink-0 h-14 flex items-center gap-3 px-6 border-b border-white/[0.07] bg-[#0a0a0a]/80 backdrop-blur-sm">
          {(() => {
            const cur = tabs.find((t) => t.id === activeTab);
            return cur ? (
              <>
                <span className="text-primary/70 shrink-0">{cur.icon}</span>
                <h1 className="text-sm font-bold text-white/85 truncate">{cur.label}</h1>
              </>
            ) : null;
          })()}
          <div className="ms-auto shrink-0">
            <span className="text-[10px] font-bold bg-primary/15 text-primary px-2.5 py-0.5 rounded-full border border-primary/25 uppercase tracking-wider hidden sm:inline">
              {isRTL ? "مدير النظام" : "System Admin"}
            </span>
          </div>
        </div>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto scrollbar-none scroll-smooth pb-20 md:pb-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

            {/* Stats */}
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
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 space-y-5">
                    <h4 className="font-bold text-primary text-sm">{isRTL ? "فيديو جديد" : "New Video"}</h4>

                    {/* ── Bilingual Content: AR (Primary) | EN (Auto-translated) ── */}
                    <div className="rounded-xl border border-primary/25 bg-black/20 overflow-hidden">
                      {/* Header row */}
                      <div className="grid grid-cols-2 border-b border-white/[0.07]">
                        {/* AR — Primary column */}
                        <div className="flex items-center gap-2 px-4 py-2.5 border-r border-white/[0.07] bg-primary/[0.05]">
                          <span className="text-[10px] font-black tracking-widest text-primary uppercase">AR ★</span>
                          <span className="text-[10px] text-primary/60">{isRTL ? "العربية — مطلوب" : "Arabic — Required"}</span>
                        </div>
                        {/* EN — Auto column */}
                        <div className="flex items-center gap-2 px-4 py-2.5">
                          <span className="text-[10px] font-black tracking-widest text-white/30 uppercase">EN</span>
                          <span className="text-[10px] text-white/25">{isRTL ? "الإنجليزية — تلقائي ↻" : "English — Auto ↻"}</span>
                          {(titleFetching || titleTranslatingFromAr || descTranslatingFromAr) && (
                            <span className="flex items-center gap-1 ms-auto">
                              <Loader2 className="w-3 h-3 animate-spin text-white/30" />
                              <span className="text-[9px] text-white/30">{isRTL ? "ترجمة..." : "Translating..."}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title row — AR | EN */}
                      <div className="grid grid-cols-2 border-b border-white/[0.07]">
                        {/* AR title — primary */}
                        <div className="p-3 border-r border-white/[0.07] space-y-1 bg-primary/[0.02]">
                          <Label className="text-[10px] text-primary/60 uppercase tracking-wider">
                            {isRTL ? "العنوان *" : "Title *"}
                          </Label>
                          <Input
                            value={newVideo.titleAr || ""}
                            onChange={(e) => handleArTitleChange(e.target.value, "new")}
                            className="h-9 rounded-lg bg-black/30 border-primary/20 text-sm focus-visible:border-primary/50 focus-visible:ring-primary/30"
                            dir="rtl"
                            placeholder="العنوان بالعربية *"
                          />
                        </div>
                        {/* EN title — auto */}
                        <div className="p-3 space-y-1 opacity-80">
                          <Label className="text-[10px] text-white/25 uppercase tracking-wider">{isRTL ? "العنوان" : "Title"}</Label>
                          <Input
                            value={newVideo.title}
                            onChange={(e) => handleTitleChange(e.target.value, "new")}
                            className="h-9 rounded-lg bg-black/20 border-white/8 text-sm text-white/70"
                            placeholder={
                              titleFetching
                                ? (isRTL ? "جاري الجلب..." : "Fetching...")
                                : titleTranslatingFromAr
                                ? (isRTL ? "جاري الترجمة..." : "Translating...")
                                : "Title in English (auto)"
                            }
                            readOnly={titleFetching || titleTranslatingFromAr}
                          />
                        </div>
                      </div>

                      {/* Description row — AR | EN */}
                      <div className="grid grid-cols-2">
                        {/* AR description — primary */}
                        <div className="p-3 border-r border-white/[0.07] space-y-1 bg-primary/[0.02]">
                          <Label className="text-[10px] text-primary/50 uppercase tracking-wider">{isRTL ? "الوصف (اختياري)" : "Description (optional)"}</Label>
                          <textarea
                            value={newVideo.descriptionAr || ""}
                            onChange={(e) => handleArDescriptionChange(e.target.value, "new")}
                            rows={3}
                            dir="rtl"
                            placeholder="وصف بالعربية..."
                            className="w-full rounded-lg bg-black/30 border border-primary/15 text-sm text-white placeholder:text-white/20 px-3 py-2 resize-none focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors"
                          />
                        </div>
                        {/* EN description — auto */}
                        <div className="p-3 space-y-1 opacity-80">
                          <Label className="text-[10px] text-white/25 uppercase tracking-wider">{isRTL ? "الوصف" : "Description"}</Label>
                          <textarea
                            value={newVideo.description || ""}
                            onChange={(e) => handleDescriptionChange(e.target.value, "new")}
                            rows={3}
                            placeholder={descTranslatingFromAr ? (isRTL ? "جاري الترجمة..." : "Translating...") : "Short description (auto)..."}
                            readOnly={descTranslatingFromAr}
                            className="w-full rounded-lg bg-black/20 border border-white/8 text-sm text-white/70 placeholder:text-white/20 px-3 py-2 resize-none focus:outline-none focus:border-white/20 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* ── Technical Details Row ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5 sm:col-span-1">
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
                      <div className="space-y-1.5" ref={catDropRef}>
                        <Label className="text-xs text-muted-foreground">{isRTL ? "التصنيف" : "Category"}</Label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setCatDropOpen((v) => !v)}
                            className={`w-full h-10 rounded-xl border text-sm flex items-center justify-between px-3 gap-2 transition-all bg-black/40 ${catDropOpen ? "border-primary/50 ring-1 ring-primary/30" : "border-white/10 hover:border-primary/30"}`}
                          >
                            <span className={newVideo.category ? "text-white" : "text-muted-foreground"}>
                              {newVideo.category ? getLocalizedCategory(newVideo.category, isRTL) : (isRTL ? "اختر تصنيفاً..." : "Select category...")}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${catDropOpen ? "rotate-180 text-primary" : ""}`} />
                          </button>
                          <AnimatePresence>
                            {catDropOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                                transition={{ duration: 0.14 }}
                                className="absolute z-50 w-full mt-1.5 bg-[#0d0d0f]/98 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/60 overflow-hidden"
                              >
                                <div className="py-1 max-h-52 overflow-y-auto">
                                  {categories.length === 0 ? (
                                    <p className="text-xs text-muted-foreground px-3 py-2">{isRTL ? "لا توجد تصنيفات" : "No categories"}</p>
                                  ) : categories.map((cat) => {
                                    const combined = `${cat.nameAr} - ${cat.nameEn}`;
                                    const isSelected = newVideo.category === combined;
                                    return (
                                      <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => { setNewVideo((p) => ({ ...p, category: combined })); setCatDropOpen(false); }}
                                        className={`w-full px-3 py-2.5 text-sm text-start flex items-center gap-2 transition-colors ${isSelected ? "bg-primary/10 text-primary font-semibold" : "text-white/80 hover:bg-white/5"}`}
                                      >
                                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                                        <span dir="rtl" className="flex-1">{cat.nameAr}</span>
                                        <span className="text-white/30 text-xs shrink-0">{cat.nameEn}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">{isRTL ? "المدة" : "Duration"}</Label>
                        <Input
                          value={durationFetching ? "" : (newVideo.duration || "")}
                          onChange={(e) => setNewVideo((p) => ({ ...p, duration: e.target.value }))}
                          className="h-10 rounded-xl bg-black/40 border-white/10 text-sm"
                          placeholder={durationFetching ? (isRTL ? "جاري الجلب..." : "Fetching...") : "e.g. 4:30"}
                          readOnly={durationFetching}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                      <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => { setIsAddingNew(false); cancelFetchRef.current?.(); }}><X className="w-4 h-4" /></Button>
                      <Button size="sm" className="rounded-xl gap-1.5" onClick={addVideo} disabled={!newVideo.titleAr}>
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
                      <div className="p-5 space-y-5">
                        {/* ── Bilingual Content: AR (Primary) | EN (Auto-translated) ── */}
                        <div className="rounded-xl border border-primary/25 bg-black/20 overflow-hidden">
                          {/* Header row */}
                          <div className="grid grid-cols-2 border-b border-white/[0.07]">
                            {/* AR — Primary */}
                            <div className="flex items-center gap-2 px-4 py-2.5 border-r border-white/[0.07] bg-primary/[0.05]">
                              <span className="text-[10px] font-black tracking-widest text-primary uppercase">AR ★</span>
                              <span className="text-[10px] text-primary/60">{isRTL ? "العربية — مطلوب" : "Arabic — Required"}</span>
                            </div>
                            {/* EN — Auto */}
                            <div className="flex items-center gap-2 px-4 py-2.5">
                              <span className="text-[10px] font-black tracking-widest text-white/30 uppercase">EN</span>
                              <span className="text-[10px] text-white/25">{isRTL ? "الإنجليزية — تلقائي ↻" : "English — Auto ↻"}</span>
                              {(titleFetching || titleTranslatingFromAr || descTranslatingFromAr) && (
                                <span className="flex items-center gap-1 ms-auto">
                                  <Loader2 className="w-3 h-3 animate-spin text-white/30" />
                                  <span className="text-[9px] text-white/30">{isRTL ? "ترجمة..." : "Translating..."}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Title row — AR | EN */}
                          <div className="grid grid-cols-2 border-b border-white/[0.07]">
                            {/* AR title — primary */}
                            <div className="p-3 border-r border-white/[0.07] space-y-1 bg-primary/[0.02]">
                              <Label className="text-[10px] text-primary/60 uppercase tracking-wider">{isRTL ? "العنوان *" : "Title *"}</Label>
                              <Input
                                value={editData.titleAr ?? video.titleAr ?? ""}
                                onChange={(e) => handleArTitleChange(e.target.value, "edit")}
                                className="h-9 rounded-lg bg-black/30 border-primary/20 text-sm focus-visible:border-primary/50 focus-visible:ring-primary/30"
                                dir="rtl"
                                placeholder="العنوان بالعربية *"
                              />
                            </div>
                            {/* EN title — auto */}
                            <div className="p-3 space-y-1 opacity-80">
                              <Label className="text-[10px] text-white/25 uppercase tracking-wider">{isRTL ? "العنوان" : "Title"}</Label>
                              <Input
                                value={editData.title ?? video.title}
                                onChange={(e) => handleTitleChange(e.target.value, "edit")}
                                className="h-9 rounded-lg bg-black/20 border-white/8 text-sm text-white/70"
                                placeholder={titleTranslatingFromAr ? (isRTL ? "جاري الترجمة..." : "Translating...") : undefined}
                                readOnly={titleFetching || titleTranslatingFromAr}
                              />
                            </div>
                          </div>

                          {/* Description row — AR | EN */}
                          <div className="grid grid-cols-2">
                            {/* AR description — primary */}
                            <div className="p-3 border-r border-white/[0.07] space-y-1 bg-primary/[0.02]">
                              <Label className="text-[10px] text-primary/50 uppercase tracking-wider">{isRTL ? "الوصف" : "Description"}</Label>
                              <textarea
                                value={editData.descriptionAr ?? (video.descriptionAr || "")}
                                onChange={(e) => handleArDescriptionChange(e.target.value, "edit")}
                                rows={3}
                                dir="rtl"
                                placeholder="وصف بالعربية..."
                                className="w-full rounded-lg bg-black/30 border border-primary/15 text-sm text-white placeholder:text-white/20 px-3 py-2 resize-none focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors"
                              />
                            </div>
                            {/* EN description — auto */}
                            <div className="p-3 space-y-1 opacity-80">
                              <Label className="text-[10px] text-white/25 uppercase tracking-wider">{isRTL ? "الوصف" : "Description"}</Label>
                              <textarea
                                value={editData.description ?? (video.description || "")}
                                onChange={(e) => handleDescriptionChange(e.target.value, "edit")}
                                rows={3}
                                placeholder={descTranslatingFromAr ? (isRTL ? "جاري الترجمة..." : "Translating...") : "Short description (auto)..."}
                                readOnly={descTranslatingFromAr}
                                className="w-full rounded-lg bg-black/20 border border-white/8 text-sm text-white/70 placeholder:text-white/20 px-3 py-2 resize-none focus:outline-none focus:border-white/20 transition-colors"
                              />
                            </div>
                          </div>
                        </div>

                        {/* ── Technical Details Row ── */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                          <div className="space-y-1.5" ref={editCatDropRef}>
                            <Label className="text-xs text-muted-foreground">{isRTL ? "التصنيف" : "Category"}</Label>
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setEditCatDropOpen((v) => !v)}
                                className={`w-full h-10 rounded-xl border text-sm flex items-center justify-between px-3 gap-2 transition-all bg-black/40 ${editCatDropOpen ? "border-primary/50 ring-1 ring-primary/30" : "border-white/10 hover:border-primary/30"}`}
                              >
                                <span className={(editData.category ?? video.category) ? "text-white" : "text-muted-foreground"}>
                                  {(editData.category ?? video.category) ? getLocalizedCategory(editData.category ?? video.category, isRTL) : (isRTL ? "اختر تصنيفاً..." : "Select category...")}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${editCatDropOpen ? "rotate-180 text-primary" : ""}`} />
                              </button>
                              <AnimatePresence>
                                {editCatDropOpen && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                                    transition={{ duration: 0.14 }}
                                    className="absolute z-50 w-full mt-1.5 bg-[#0d0d0f]/98 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/60 overflow-hidden"
                                  >
                                    <div className="py-1 max-h-52 overflow-y-auto">
                                      {categories.length === 0 ? (
                                        <p className="text-xs text-muted-foreground px-3 py-2">{isRTL ? "لا توجد تصنيفات" : "No categories"}</p>
                                      ) : categories.map((cat) => {
                                        const combined = `${cat.nameAr} - ${cat.nameEn}`;
                                        const current = editData.category ?? video.category;
                                        const isSelected = current === combined;
                                        return (
                                          <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => { setEditData((p) => ({ ...p, category: combined })); setEditCatDropOpen(false); }}
                                            className={`w-full px-3 py-2.5 text-sm text-start flex items-center gap-2 transition-colors ${isSelected ? "bg-primary/10 text-primary font-semibold" : "text-white/80 hover:bg-white/5"}`}
                                          >
                                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                                            <span dir="rtl" className="flex-1">{cat.nameAr}</span>
                                            <span className="text-white/30 text-xs shrink-0">{cat.nameEn}</span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">{isRTL ? "المدة" : "Duration"}</Label>
                            <Input
                              value={durationFetching ? "" : (editData.duration ?? video.duration)}
                              onChange={(e) => setEditData((p) => ({ ...p, duration: e.target.value }))}
                              className="h-10 rounded-xl bg-black/40 border-white/10 text-sm"
                              placeholder={durationFetching ? (isRTL ? "جاري الجلب..." : "Fetching...") : "e.g. 4:30"}
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
                          <p className="font-medium text-sm" dir="rtl">{video.titleAr || video.title}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {video.category && <span className="text-xs bg-white/5 text-muted-foreground px-2 py-0.5 rounded-full">{getLocalizedCategory(video.category, isRTL)}</span>}
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
                        <th className="px-4 py-3 text-start font-medium">{isRTL ? "الرابط" : "URL"}</th>
                        <th className="px-4 py-3 text-start font-medium">{isRTL ? "الوصف" : "Description"}</th>
                        <th className="px-4 py-3 text-start font-medium">{isRTL ? "المرفق" : "Attachment"}</th>
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
                          <td className="px-4 py-3.5 max-w-[160px]">
                            {report.url ? (
                              <a
                                href={report.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-400/70 font-mono truncate block hover:text-blue-400 transition-colors"
                                dir="ltr"
                                title={report.url}
                              >
                                {report.url.length > 35 ? report.url.substring(0, 35) + "…" : report.url}
                              </a>
                            ) : (
                              <span className="text-muted-foreground/40 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 max-w-[200px]">
                            {report.description ? (
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {expandedDescId === report.id
                                    ? report.description
                                    : report.description.length > 60
                                    ? report.description.substring(0, 60) + "…"
                                    : report.description}
                                </p>
                                {report.description.length > 60 && (
                                  <button
                                    onClick={() => setExpandedDescId(expandedDescId === report.id ? null : report.id)}
                                    className="text-[10px] text-primary/60 hover:text-primary transition-colors font-medium"
                                  >
                                    {expandedDescId === report.id
                                      ? (isRTL ? "↑ أقل" : "↑ less")
                                      : (isRTL ? "↓ المزيد" : "↓ more")}
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground/40 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            {report.attachmentUrl ? (
                              <a href={report.attachmentUrl} target="_blank" rel="noopener noreferrer" title={isRTL ? "عرض المرفق" : "View attachment"} className="block w-10 h-8 rounded-md overflow-hidden border border-white/10 hover:border-primary/50 transition-colors shrink-0">
                                <img src={report.attachmentUrl} alt="attachment" className="w-full h-full object-cover" />
                              </a>
                            ) : (
                              <span className="text-muted-foreground/40 text-xs">—</span>
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

        {activeTab === "categories" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">{isRTL ? "إدارة التصنيفات" : "Category Manager"}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isRTL ? "تعديل التصنيفات يُحدّث تلقائيًا جميع الفيديوهات والفلاتر المرتبطة بها" : "Editing a category automatically updates all linked videos and filters"}
                </p>
              </div>
              <span className="text-xs text-muted-foreground bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                {categories.length} {isRTL ? "تصنيف" : "categories"}
              </span>
            </div>

            {/* ── Add New Category ── */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {isRTL ? "إضافة تصنيف جديد" : "Add New Category"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-primary/60 uppercase tracking-wider">
                    {isRTL ? "الاسم بالعربية ★" : "Arabic Name ★"}
                  </Label>
                  <Input
                    dir="rtl"
                    value={newCat.nameAr}
                    onChange={(e) => handleNewCatArChange(e.target.value)}
                    placeholder="مثال: أمان كلمات المرور"
                    className="h-10 rounded-xl bg-black/40 border-primary/20 text-sm focus-visible:border-primary/50 focus-visible:ring-primary/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    {isRTL ? "الاسم بالإنجليزية" : "English Name"}
                    {newCatTranslating && (
                      <span className="flex items-center gap-1 text-primary/50">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-[9px] normal-case tracking-normal">{isRTL ? "ترجمة..." : "Translating..."}</span>
                      </span>
                    )}
                  </Label>
                  <Input
                    value={newCat.nameEn}
                    onChange={(e) => setNewCat((p) => ({ ...p, nameEn: e.target.value }))}
                    placeholder={newCatTranslating ? (isRTL ? "جاري الترجمة..." : "Translating...") : "e.g. Password Security"}
                    className="h-10 rounded-xl bg-black/30 border-white/10 text-sm"
                    readOnly={newCatTranslating}
                  />
                </div>
              </div>
              <Button
                size="sm"
                className="rounded-xl gap-1.5"
                onClick={createCategory}
                disabled={newCatSaving || !newCat.nameAr.trim()}
              >
                {newCatSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {isRTL ? "إضافة" : "Add Category"}
              </Button>
            </div>

            {/* ── Categories Table ── */}
            {categoriesLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground bg-[#0D0D0F] border border-white/5 rounded-2xl">
                <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{isRTL ? "لا توجد تصنيفات بعد" : "No categories yet"}</p>
                <p className="text-xs mt-1 opacity-60">{isRTL ? "أضف تصنيفاً من الأعلى أو أضف فيديوهات بتصنيفات" : "Add a category above or add videos with categories"}</p>
              </div>
            ) : (
              <div className="bg-[#0D0D0F] border border-white/5 rounded-2xl overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-0 border-b border-white/5">
                  <div className="px-4 py-3 text-[10px] text-muted-foreground uppercase tracking-wider font-medium w-12 flex items-center">#</div>
                  <div className="px-4 py-3 text-[10px] text-primary/70 uppercase tracking-wider font-medium flex items-center gap-1">
                    <span>AR ★</span>
                    <span className="text-muted-foreground font-normal">— {isRTL ? "العربية" : "Arabic"}</span>
                  </div>
                  <div className="px-4 py-3 text-[10px] text-muted-foreground uppercase tracking-wider font-medium flex items-center">
                    EN — {isRTL ? "الإنجليزية" : "English"}
                  </div>
                  <div className="px-4 py-3 w-32" />
                </div>

                {/* Table rows */}
                <div className="divide-y divide-white/5">
                  {categories.map((cat, idx) => {
                    const d = catEditData[cat.id] ?? { nameAr: cat.nameAr, nameEn: cat.nameEn };
                    const isDirty = d.nameAr !== cat.nameAr || d.nameEn !== cat.nameEn;
                    const isSaving = catSaving === cat.id;
                    return (
                      <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="grid grid-cols-[auto_1fr_1fr_auto] gap-0 items-center group hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="px-4 py-3 w-12">
                          <span className="text-xs font-mono text-muted-foreground/50">{idx + 1}</span>
                        </div>

                        {/* AR name — primary */}
                        <div className="px-3 py-2.5">
                          <Input
                            dir="rtl"
                            value={d.nameAr}
                            onChange={(e) => handleCatEditArChange(cat.id, d, e.target.value)}
                            className="h-9 rounded-lg bg-primary/[0.04] border-primary/15 text-sm focus-visible:border-primary/50 focus-visible:ring-primary/20 text-white"
                          />
                        </div>

                        {/* EN name — secondary, auto-translated */}
                        <div className="px-3 py-2.5 relative">
                          <Input
                            value={d.nameEn}
                            onChange={(e) => setCatEditData((prev) => ({ ...prev, [cat.id]: { ...d, nameEn: e.target.value } }))}
                            placeholder={catEditTranslating === cat.id ? (isRTL ? "جاري الترجمة..." : "Translating...") : undefined}
                            className="h-9 rounded-lg bg-black/20 border-white/8 text-sm text-white/80 pe-8"
                            readOnly={catEditTranslating === cat.id}
                          />
                          {catEditTranslating === cat.id && (
                            <Loader2 className="absolute end-5 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-primary/50 pointer-events-none" />
                          )}
                        </div>

                        {/* Actions */}
                        <div className="px-3 py-2.5 w-32 flex items-center gap-1.5 justify-end">
                          <Button
                            size="sm"
                            variant={isDirty ? "default" : "ghost"}
                            className={`rounded-lg gap-1 h-8 px-3 text-xs transition-all ${isDirty ? "shadow-lg shadow-primary/20" : "opacity-0 group-hover:opacity-100"}`}
                            onClick={() => saveCategory(cat.id)}
                            disabled={isSaving || !d.nameAr.trim() || !d.nameEn.trim()}
                          >
                            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                            {isRTL ? "حفظ" : "Save"}
                          </Button>
                          <button
                            onClick={() => deleteCategory(cat.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-muted-foreground transition-colors opacity-0 group-hover:opacity-100"
                            title={isRTL ? "حذف التصنيف" : "Delete category"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Footer note */}
                <div className="px-5 py-3 border-t border-white/5 bg-white/[0.01]">
                  <p className="text-[10px] text-muted-foreground/50">
                    {isRTL
                      ? "حفظ تصنيف يُحدّث تلقائيًا اسمه في جميع الفيديوهات المرتبطة به."
                      : "Saving a category automatically renames it across all linked videos."}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "users" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Header + Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">{isRTL ? "إدارة المستخدمين" : "User Management"}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {users.length} {isRTL ? "مستخدم مسجّل" : "registered users"}
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder={isRTL ? "ابحث بالاسم أو البريد..." : "Search by name or email..."}
                  className="h-9 ps-9 rounded-xl bg-black/40 border-white/10 text-sm"
                />
              </div>
            </div>

            {/* Reset result banner */}
            <AnimatePresence>
              {resetResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3 bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
                    <div>
                      <p className="text-sm font-bold text-green-400 mb-1">
                        {isRTL ? "تمت إعادة تعيين كلمة المرور" : "Password Reset Successfully"}
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">{resetResult.email}</p>
                      <div className="flex items-center gap-2 bg-black/40 rounded-lg px-3 py-1.5 w-fit border border-white/10">
                        <KeyRound className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-mono text-sm text-white tracking-wider">{resetResult.password}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground/60 mt-2">
                        {isRTL ? "شارك هذه الكلمة مع المستخدم — ستختفي عند الإغلاق" : "Share this with the user — it disappears when dismissed"}
                      </p>
                    </div>
                    <button onClick={() => setResetResult(null)} className="text-muted-foreground hover:text-white p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Table */}
            {users.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Database className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>{isRTL ? "لا يوجد مستخدمون مسجلون بعد" : "No registered users yet"}</p>
              </div>
            ) : (() => {
              const filtered = users.filter((u) => {
                const q = userSearch.trim().toLowerCase();
                if (!q) return true;
                return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
              });
              return (
                <div className="bg-[#0D0D0F] border border-white/5 rounded-2xl overflow-hidden">
                  {filtered.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                      {isRTL ? "لا توجد نتائج" : "No results found"}
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/5 text-muted-foreground text-xs uppercase tracking-wider">
                          <th className="px-5 py-3 text-start font-medium">{isRTL ? "المستخدم" : "User"}</th>
                          <th className="px-5 py-3 text-start font-medium hidden sm:table-cell">{isRTL ? "البريد" : "Email"}</th>
                          <th className="px-5 py-3 text-start font-medium hidden md:table-cell">{isRTL ? "تاريخ التسجيل" : "Joined"}</th>
                          <th className="px-5 py-3 text-end font-medium">{isRTL ? "الإجراءات" : "Actions"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filtered.map((u) => (
                          <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-black text-white shrink-0">
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium">{u.name}</p>
                                  <p className="text-xs text-muted-foreground sm:hidden" dir="ltr">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-muted-foreground hidden sm:table-cell" dir="ltr">{u.email}</td>
                            <td className="px-5 py-3.5 text-muted-foreground text-xs hidden md:table-cell">
                              {new Date(u.joinDate).toLocaleDateString(isRTL ? "ar-SA" : "en-US")}
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1.5 justify-end">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2.5 text-xs rounded-lg gap-1 text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10"
                                  onClick={() => resetPassword(u.id)}
                                  disabled={userResetting === u.id}
                                >
                                  {userResetting === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <KeyRound className="w-3 h-3" />}
                                  <span className="hidden sm:inline">{isRTL ? "إعادة تعيين" : "Reset"}</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2.5 text-xs rounded-lg gap-1 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                                  onClick={() => deleteUser(u.id)}
                                  disabled={userDeleting === u.id}
                                >
                                  {userDeleting === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                  <span className="hidden sm:inline">{isRTL ? "حذف" : "Delete"}</span>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              );
            })()}
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════ ANALYTICS TAB ══════════════════════════════════ */}
        {activeTab === "analytics" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <h2 className="text-lg font-bold">{isRTL ? "إحصائيات الكويزات" : "Quiz Analytics"}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isRTL ? "نظرة شاملة على أداء المستخدمين واهتماماتهم" : "Overview of user performance and learning gaps"}
              </p>
            </div>

            {analyticsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
              </div>
            ) : !analytics ? (
              <div className="text-center py-16 text-muted-foreground">
                <BarChart2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>{isRTL ? "لا توجد بيانات" : "No data available"}</p>
              </div>
            ) : (
              <>
                {/* ── KPI Cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      label: isRTL ? "متوسط الدرجة" : "Avg Score",
                      value: analytics.avgScore !== null ? `${analytics.avgScore}%` : isRTL ? "—" : "—",
                      icon: <TrendingUp className="w-5 h-5" />,
                      color: "text-primary", bg: "bg-primary/10 border-primary/20",
                    },
                    {
                      label: isRTL ? "أكملوا الكويز" : "Took Quiz",
                      value: analytics.usersWithQuiz,
                      icon: <ClipboardList className="w-5 h-5" />,
                      color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20",
                    },
                    {
                      label: isRTL ? "إجمالي المستخدمين" : "Total Users",
                      value: analytics.totalUsers,
                      icon: <Users className="w-5 h-5" />,
                      color: "text-green-400", bg: "bg-green-400/10 border-green-400/20",
                    },
                    {
                      label: isRTL ? "روابط مفحوصة" : "Links Checked",
                      value: analytics.totalLinksChecked,
                      icon: <Activity className="w-5 h-5" />,
                      color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20",
                    },
                  ].map((kpi, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      className={`rounded-2xl p-5 border ${kpi.bg}`}>
                      <div className={`${kpi.color} mb-3`}>{kpi.icon}</div>
                      <p className="text-3xl font-black mb-1">{kpi.value}</p>
                      <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* ── Score Distribution ── */}
                  <div className="bg-[#0D0D0F] border border-white/5 rounded-2xl p-5">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-primary" />
                      {isRTL ? "توزيع الدرجات" : "Score Distribution"}
                    </h3>
                    {analytics.usersWithQuiz === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-8">{isRTL ? "لم يكمل أحد الكويز بعد" : "No one has taken the quiz yet"}</p>
                    ) : (
                      <div className="space-y-3">
                        {[
                          { label: isRTL ? "ممتاز (90%+)" : "Excellent (90%+)", count: analytics.scoreBuckets.excellent, color: "bg-green-500" },
                          { label: isRTL ? "جيد (70–89%)" : "Good (70–89%)", count: analytics.scoreBuckets.good, color: "bg-primary" },
                          { label: isRTL ? "متوسط (50–69%)" : "Average (50–69%)", count: analytics.scoreBuckets.average, color: "bg-amber-500" },
                          { label: isRTL ? "ضعيف (أقل من 50%)" : "Poor (<50%)", count: analytics.scoreBuckets.poor, color: "bg-red-500" },
                        ].map((b, i) => {
                          const pct = analytics.usersWithQuiz > 0 ? Math.round((b.count / analytics.usersWithQuiz) * 100) : 0;
                          return (
                            <div key={i}>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs text-muted-foreground">{b.label}</span>
                                <span className="text-xs font-bold">{b.count} <span className="text-muted-foreground font-normal">({pct}%)</span></span>
                              </div>
                              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ delay: 0.2 + i * 0.08, duration: 0.6, ease: "easeOut" }}
                                  className={`h-full rounded-full ${b.color}`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* ── Top 5 Weak Points ── */}
                  <div className="bg-[#0D0D0F] border border-white/5 rounded-2xl p-5">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      {isRTL ? "أكثر 5 أسئلة يخطئ فيها المستخدمون" : "Top 5 Most Missed Questions"}
                    </h3>
                    {analytics.topFailedTopics.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-8">
                        {isRTL ? "لا توجد بيانات أخطاء بعد" : "No failure data yet"}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {analytics.topFailedTopics.map((item, i) => {
                          const maxCount = analytics.topFailedTopics[0]?.count ?? 1;
                          const pct = Math.round((item.count / maxCount) * 100);
                          return (
                            <motion.div key={i} initial={{ opacity: 0, x: isRTL ? 12 : -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.07 }}>
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-xs font-mono text-muted-foreground/50 shrink-0">#{i + 1}</span>
                                  <span className="text-xs text-white truncate">{item.topic}</span>
                                </div>
                                <span className="text-xs font-bold text-red-400 shrink-0 ms-2">{item.count}×</span>
                              </div>
                              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ delay: 0.3 + i * 0.08, duration: 0.5, ease: "easeOut" }}
                                  className="h-full rounded-full bg-gradient-to-r from-red-500/70 to-red-400"
                                />
                              </div>
                            </motion.div>
                          );
                        })}
                        <p className="text-[10px] text-muted-foreground/50 pt-2 border-t border-white/5">
                          {isRTL ? "الأسئلة المكررة تشير إلى موضوعات تحتاج فيديوهات إضافية" : "Recurring topics suggest areas needing more video content"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Refresh button ── */}
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-xl gap-1.5 text-muted-foreground hover:text-white text-xs"
                    onClick={() => {
                      setAnalyticsLoading(true);
                      api.admin.analytics().then(setAnalytics).finally(() => setAnalyticsLoading(false));
                    }}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {isRTL ? "تحديث" : "Refresh"}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════ NOTIFICATIONS TAB ════════════════════════════════ */}
        {activeTab === "notifications" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <h2 className="text-lg font-bold">{isRTL ? "إرسال تنبيهات عامة" : "Global Notifications"}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isRTL ? "الإشعارات النشطة تظهر كشريط في لوحة كل مستخدم" : "Active notifications appear as a banner in every user's dashboard"}
              </p>
            </div>

            {/* ── Compose ── */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <Bell className="w-4 h-4" />
                {isRTL ? "إنشاء إشعار جديد" : "Compose Notification"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-primary/60 uppercase tracking-wider">{isRTL ? "العنوان بالعربية ★" : "Arabic Title ★"}</Label>
                  <Input
                    dir="rtl"
                    value={newNotif.titleAr}
                    onChange={(e) => handleNotifTitleArChange(e.target.value)}
                    placeholder="مثال: دورة جديدة متاحة!"
                    className="h-9 rounded-xl bg-black/40 border-primary/20 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    {isRTL ? "العنوان بالإنجليزية" : "English Title"}
                    {notifTitleTranslating && (
                      <span className="flex items-center gap-1 text-primary/50">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-[9px] normal-case tracking-normal">{isRTL ? "ترجمة..." : "Translating..."}</span>
                      </span>
                    )}
                  </Label>
                  <Input
                    value={newNotif.titleEn}
                    onChange={(e) => setNewNotif((p) => ({ ...p, titleEn: e.target.value }))}
                    placeholder={notifTitleTranslating ? (isRTL ? "جاري الترجمة..." : "Translating...") : "e.g. New Course Available!"}
                    className="h-9 rounded-xl bg-black/30 border-white/10 text-sm"
                    readOnly={notifTitleTranslating}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-primary/60 uppercase tracking-wider">{isRTL ? "نص الرسالة بالعربية ★" : "Arabic Body ★"}</Label>
                  <textarea
                    dir="rtl"
                    value={newNotif.bodyAr}
                    onChange={(e) => handleNotifBodyArChange(e.target.value)}
                    placeholder={isRTL ? "اكتب رسالتك هنا..." : "Write your message in Arabic..."}
                    rows={3}
                    className="w-full rounded-xl bg-black/40 border border-primary/20 text-sm text-white px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    {isRTL ? "نص الرسالة بالإنجليزية" : "English Body"}
                    {notifBodyTranslating && (
                      <span className="flex items-center gap-1 text-primary/50">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-[9px] normal-case tracking-normal">{isRTL ? "ترجمة..." : "Translating..."}</span>
                      </span>
                    )}
                  </Label>
                  <textarea
                    value={newNotif.bodyEn}
                    onChange={(e) => setNewNotif((p) => ({ ...p, bodyEn: e.target.value }))}
                    placeholder={notifBodyTranslating ? (isRTL ? "جاري الترجمة..." : "Translating...") : "Write your message in English..."}
                    rows={3}
                    className="w-full rounded-xl bg-black/30 border border-white/10 text-sm text-white px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                    readOnly={notifBodyTranslating}
                  />
                </div>
              </div>

              <Button
                size="sm"
                className="rounded-xl gap-1.5"
                onClick={sendNotification}
                disabled={notifSending || !newNotif.bodyAr.trim()}
              >
                {notifSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                {isRTL ? "إرسال للجميع" : "Broadcast to All"}
              </Button>
            </div>

            {/* ── Existing Notifications ── */}
            {notifLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-7 h-7 animate-spin text-primary/40" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-14 text-muted-foreground bg-[#0D0D0F] border border-white/5 rounded-2xl">
                <BellOff className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{isRTL ? "لا توجد إشعارات حتى الآن" : "No notifications yet"}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  {isRTL ? "الإشعارات السابقة" : "Sent Notifications"}
                </h3>
                {notifications.map((n) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl border p-4 transition-all ${n.isActive ? "border-primary/20 bg-primary/5" : "border-white/5 bg-[#0D0D0F] opacity-60"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${n.isActive ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-white/5 text-muted-foreground border-white/10"}`}>
                            {n.isActive ? (isRTL ? "● نشط" : "● Active") : (isRTL ? "○ معطّل" : "○ Inactive")}
                          </span>
                          {(n.titleAr || n.titleEn) && (
                            <span className="text-xs font-bold text-white">{isRTL ? n.titleAr || n.titleEn : n.titleEn || n.titleAr}</span>
                          )}
                          <span className="text-[10px] text-muted-foreground/50">
                            {new Date(n.sentAt).toLocaleString(isRTL ? "ar-SA" : "en-US")}
                          </span>
                        </div>
                        <p className="text-sm text-white/80" dir={isRTL ? "rtl" : "ltr"}>
                          {isRTL ? n.bodyAr : (n.bodyEn || n.bodyAr)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => toggleNotification(n.id)}
                          disabled={notifToggling === n.id}
                          className={`p-1.5 rounded-lg transition-colors ${n.isActive ? "hover:bg-amber-400/10 hover:text-amber-400" : "hover:bg-green-400/10 hover:text-green-400"} text-muted-foreground`}
                          title={n.isActive ? (isRTL ? "إيقاف" : "Deactivate") : (isRTL ? "تفعيل" : "Activate")}
                        >
                          {notifToggling === n.id ? <Loader2 className="w-4 h-4 animate-spin" /> : n.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => deleteNotification(n.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-muted-foreground transition-colors"
                          title={isRTL ? "حذف" : "Delete"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════ LOGS TAB ════════════════════════════════════════ */}
        {activeTab === "logs" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">{isRTL ? "سجل العمليات" : "Activity Logs"}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isRTL ? "سجل شامل لجميع إجراءات المدير — للقراءة فقط" : "Read-only record of all admin actions"}
                </p>
              </div>
              <Button
                size="sm" variant="ghost"
                className="rounded-xl gap-1.5 text-xs text-muted-foreground hover:text-white"
                onClick={() => {
                  setLogsLoading(true);
                  api.admin.logs().then(setLogs).finally(() => setLogsLoading(false));
                }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {isRTL ? "تحديث" : "Refresh"}
              </Button>
            </div>

            {logsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground bg-[#0D0D0F] border border-white/5 rounded-2xl">
                <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{isRTL ? "لا توجد سجلات بعد" : "No logs yet"}</p>
                <p className="text-xs mt-1 opacity-60">{isRTL ? "ستظهر الإجراءات هنا تلقائياً" : "Actions will appear here automatically"}</p>
              </div>
            ) : (
              <div className="bg-[#0D0D0F] border border-white/5 rounded-2xl overflow-hidden">
                <div className="divide-y divide-white/5">
                  {logs.map((log, idx) => {
                    const entityIcon = log.entityType === "video" ? <PlayCircle className="w-3.5 h-3.5" /> :
                      log.entityType === "report" ? <FileText className="w-3.5 h-3.5" /> :
                      log.entityType === "user" ? <User className="w-3.5 h-3.5" /> :
                      log.entityType === "notification" ? <Bell className="w-3.5 h-3.5" /> :
                      <Activity className="w-3.5 h-3.5" />;
                    const entityColor = log.entityType === "video" ? "text-primary bg-primary/10" :
                      log.entityType === "report" ? "text-amber-400 bg-amber-400/10" :
                      log.entityType === "user" ? "text-blue-400 bg-blue-400/10" :
                      log.entityType === "notification" ? "text-green-400 bg-green-400/10" :
                      "text-muted-foreground bg-white/5";
                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors"
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${entityColor}`}>
                          {entityIcon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-white/90 leading-snug">{isRTL ? log.actionAr : log.actionEn}</p>
                          <p className="text-[10px] text-muted-foreground/50 mt-0.5" dir="ltr">{log.adminEmail}</p>
                        </div>
                        <div className="shrink-0 text-end">
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/40">
                            <Clock className="w-3 h-3" />
                            <span dir="ltr">{new Date(log.createdAt).toLocaleString(isRTL ? "ar-SA" : "en-US", { dateStyle: "short", timeStyle: "short" })}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="px-4 py-3 border-t border-white/5 bg-white/[0.01]">
                  <p className="text-[10px] text-muted-foreground/40 text-center">
                    {isRTL ? `إجمالي ${logs.length} إجراء محفوظ` : `${logs.length} actions logged in total`}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

          </div>
        </main>
      </div>

      {/* ── Delete User Confirmation Modal ── */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-sm bg-[#111114] border border-white/[0.09] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.8)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Red top accent */}
              <div className="h-[2px] bg-gradient-to-r from-transparent via-red-500/70 to-transparent" />
              <div className="p-6">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 mx-auto">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                {/* Title */}
                <h3 className="text-base font-black text-center mb-1">
                  {isRTL ? "تأكيد حذف المستخدم" : "Delete User Permanently?"}
                </h3>
                <p className="text-xs text-muted-foreground text-center mb-1">
                  {isRTL ? "سيتم حذف هذا المستخدم نهائيًا ولا يمكن التراجع عن هذا الإجراء." : "This action is irreversible. The user will be permanently removed."}
                </p>
                {/* User info */}
                <div className="mt-4 bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-3 mb-5 text-center">
                  <p className="font-bold text-sm text-white/90">{deleteConfirm.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5" dir="ltr">{deleteConfirm.email}</p>
                </div>
                {/* Actions */}
                <div className="flex gap-2.5">
                  <Button
                    variant="ghost"
                    className="flex-1 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-semibold"
                    onClick={() => setDeleteConfirm(null)}
                  >
                    {isRTL ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button
                    className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold border-0"
                    onClick={confirmDeleteUser}
                  >
                    <Trash2 className="w-3.5 h-3.5 me-1.5" />
                    {isRTL ? "حذف نهائيًا" : "Delete Forever"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
