import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { useLang } from "@/context/LangContext";
import {
  Shield, Users, FileText, PlayCircle, TrendingUp, Plus, Trash2,
  Edit3, Save, X, Youtube, AlertCircle, Check, Activity,
  BarChart2, Eye, Database
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

const MOCK_REPORTS = [
  { id: "R-001", type: "phishing", url: "http://fake-bank.xyz/login", date: "2026-03-20", status: "pending" },
  { id: "R-002", type: "financial", url: "https://invest-now-profit.ml", date: "2026-03-21", status: "reviewed" },
  { id: "R-003", type: "identity", url: "", date: "2026-03-22", status: "pending" },
  { id: "R-004", type: "fake_message", url: "", date: "2026-03-23", status: "closed" },
];

export default function AdminDashboard() {
  const { getAllUsers } = useApp();
  const { isRTL } = useLang();
  const { toast } = useToast();

  const [videos, setVideos] = useState<Video[]>(() => {
    try { return JSON.parse(localStorage.getItem("horras_videos") || "[]") || DEFAULT_VIDEOS; } catch { return DEFAULT_VIDEOS; }
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Video>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newVideo, setNewVideo] = useState<Partial<Video>>({ title: "", url: "", category: "", duration: "" });
  const [activeTab, setActiveTab] = useState<"videos" | "reports" | "users">("videos");

  const users = getAllUsers();

  const saveVideos = (vids: Video[]) => {
    localStorage.setItem("horras_videos", JSON.stringify(vids));
    setVideos(vids);
  };

  const saveEdit = (id: string) => {
    saveVideos(videos.map((v) => (v.id === id ? { ...v, ...editData } : v)));
    setEditingId(null);
    setEditData({});
    toast({ title: isRTL ? "تم حفظ التغييرات" : "Changes saved" });
  };

  const deleteVideo = (id: string) => {
    saveVideos(videos.filter((v) => v.id !== id));
    toast({ title: isRTL ? "تم حذف الفيديو" : "Video deleted" });
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
    saveVideos([...videos, video]);
    setNewVideo({ title: "", url: "", category: "", duration: "" });
    setIsAddingNew(false);
    toast({ title: isRTL ? "تم إضافة الفيديو" : "Video added" });
  };

  const stats = [
    { icon: <Users className="w-5 h-5" />, label: isRTL ? "المستخدمون المسجلون" : "Registered Users", value: users.length, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
    { icon: <FileText className="w-5 h-5" />, label: isRTL ? "إجمالي البلاغات" : "Total Reports", value: MOCK_REPORTS.length, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
    { icon: <PlayCircle className="w-5 h-5" />, label: isRTL ? "فيديوهات التعلم" : "Learning Videos", value: videos.length, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
    { icon: <Activity className="w-5 h-5" />, label: isRTL ? "بلاغات معلقة" : "Pending Reports", value: MOCK_REPORTS.filter((r) => r.status === "pending").length, color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
  ];

  const tabs = [
    { id: "videos" as const, label: isRTL ? "فيديوهات التعلم" : "Learning Videos", icon: <PlayCircle className="w-4 h-4" /> },
    { id: "reports" as const, label: isRTL ? "البلاغات" : "Reports", icon: <FileText className="w-4 h-4" /> },
    { id: "users" as const, label: isRTL ? "المستخدمون" : "Users", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#070709]">
      {/* Admin Header */}
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
        {/* Stats Grid */}
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

        {/* Tabs */}
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

        {/* Video Management Tab */}
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
                        <Label className="text-xs text-muted-foreground">{isRTL ? "العنوان" : "Title"}</Label>
                        <Input value={newVideo.title} onChange={(e) => setNewVideo((p) => ({ ...p, title: e.target.value }))} className="h-10 rounded-xl bg-black/40 border-white/10 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">{isRTL ? "رابط YouTube" : "YouTube URL"}</Label>
                        <div className="relative">
                          <Youtube className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input value={newVideo.url} onChange={(e) => setNewVideo((p) => ({ ...p, url: e.target.value }))} className="h-10 rounded-xl bg-black/40 border-white/10 text-sm pe-9" style={{ direction: "ltr", textAlign: "left" }} placeholder="https://youtube.com/..." />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">{isRTL ? "التصنيف" : "Category"}</Label>
                        <Input value={newVideo.category} onChange={(e) => setNewVideo((p) => ({ ...p, category: e.target.value }))} className="h-10 rounded-xl bg-black/40 border-white/10 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">{isRTL ? "المدة" : "Duration"}</Label>
                        <Input value={newVideo.duration} onChange={(e) => setNewVideo((p) => ({ ...p, duration: e.target.value }))} className="h-10 rounded-xl bg-black/40 border-white/10 text-sm" placeholder="60s" />
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end">
                      <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => setIsAddingNew(false)}><X className="w-4 h-4" /></Button>
                      <Button size="sm" className="rounded-xl gap-1.5" onClick={addVideo} disabled={!newVideo.title}>
                        <Save className="w-4 h-4" /> {isRTL ? "حفظ" : "Save"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              {videos.map((video) => (
                <motion.div key={video.id} layout className="bg-[#0D0D0F] border border-white/5 rounded-2xl overflow-hidden">
                  {editingId === video.id ? (
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">{isRTL ? "العنوان" : "Title"}</Label>
                          <Input value={editData.title ?? video.title} onChange={(e) => setEditData((p) => ({ ...p, title: e.target.value }))} className="h-10 rounded-xl bg-black/40 border-white/10 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">{isRTL ? "رابط YouTube" : "YouTube URL"}</Label>
                          <div className="relative">
                            <Youtube className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input value={editData.url ?? video.url} onChange={(e) => setEditData((p) => ({ ...p, url: e.target.value }))} className="h-10 rounded-xl bg-black/40 border-white/10 text-sm pe-9" style={{ direction: "ltr", textAlign: "left" }} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">{isRTL ? "التصنيف" : "Category"}</Label>
                          <Input value={editData.category ?? video.category} onChange={(e) => setEditData((p) => ({ ...p, category: e.target.value }))} className="h-10 rounded-xl bg-black/40 border-white/10 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">{isRTL ? "المدة" : "Duration"}</Label>
                          <Input value={editData.duration ?? video.duration} onChange={(e) => setEditData((p) => ({ ...p, duration: e.target.value }))} className="h-10 rounded-xl bg-black/40 border-white/10 text-sm" />
                        </div>
                      </div>
                      <div className="flex gap-3 justify-end">
                        <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => { setEditingId(null); setEditData({}); }}><X className="w-4 h-4" /></Button>
                        <Button size="sm" className="rounded-xl gap-1.5" onClick={() => saveEdit(video.id)}><Save className="w-4 h-4" /> {isRTL ? "حفظ" : "Save"}</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 px-5 py-3.5">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <PlayCircle className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-medium text-sm">{video.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {video.category && <span className="text-xs bg-white/5 text-muted-foreground px-2 py-0.5 rounded-full">{video.category}</span>}
                          {video.duration && <span className="text-xs text-muted-foreground/60">⏱ {video.duration}</span>}
                          {video.url && <span className="text-xs text-blue-400/60 truncate max-w-[150px]" style={{ direction: "ltr" }}>{video.url}</span>}
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
          </motion.div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-lg font-bold mb-4">{isRTL ? "بلاغات المستخدمين" : "User Reports"}</h2>
            <div className="bg-[#0D0D0F] border border-white/5 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-muted-foreground text-xs uppercase tracking-wider">
                      <th className="px-5 py-3 text-start font-medium">{isRTL ? "رقم البلاغ" : "Report ID"}</th>
                      <th className="px-5 py-3 text-start font-medium">{isRTL ? "نوع الاحتيال" : "Fraud Type"}</th>
                      <th className="px-5 py-3 text-start font-medium">{isRTL ? "الرابط" : "URL"}</th>
                      <th className="px-5 py-3 text-start font-medium">{isRTL ? "التاريخ" : "Date"}</th>
                      <th className="px-5 py-3 text-start font-medium">{isRTL ? "الحالة" : "Status"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {MOCK_REPORTS.map((report) => (
                      <tr key={report.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{report.id}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-medium">{report.type}</span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-blue-400/70 font-mono max-w-[200px] truncate" dir="ltr">{report.url || "—"}</td>
                        <td className="px-5 py-3.5 text-xs text-muted-foreground">{report.date}</td>
                        <td className="px-5 py-3.5">
                          {report.status === "pending" && <span className="flex items-center gap-1 text-xs text-amber-400"><AlertCircle className="w-3 h-3" /> {isRTL ? "معلق" : "Pending"}</span>}
                          {report.status === "reviewed" && <span className="flex items-center gap-1 text-xs text-blue-400"><Eye className="w-3 h-3" /> {isRTL ? "مراجع" : "Reviewed"}</span>}
                          {report.status === "closed" && <span className="flex items-center gap-1 text-xs text-emerald-400"><Check className="w-3 h-3" /> {isRTL ? "مغلق" : "Closed"}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
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
                    {users.map((u, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
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
