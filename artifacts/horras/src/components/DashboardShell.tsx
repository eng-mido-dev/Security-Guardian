import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useApp } from "@/context/AppContext";
import { useLang } from "@/context/LangContext";
import { api, type ApiNotification } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, LogOut, Globe, Bell, X,
  LayoutDashboard, Target, PlayCircle, Link2, AlertTriangle, Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const DASH_NAV = [
  { labelAr: "لوحتي", labelEn: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { labelAr: "اختبار الأمان", labelEn: "Security Quiz", path: "/security-test", icon: Target },
  { labelAr: "تعلّم", labelEn: "Learn", path: "/learn", icon: PlayCircle },
  { labelAr: "فحص رابط", labelEn: "Check Link", path: "/check-link", icon: Link2 },
  { labelAr: "أبلغ", labelEn: "Report", path: "/report", icon: AlertTriangle },
  { labelAr: "الأدوات", labelEn: "Tools", path: "/tools", icon: Wrench },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useApp();
  const { lang, isRTL, toggleLang } = useLang();
  const [location] = useLocation();

  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [seenIds, setSeenIds] = useState<Set<number>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.notifications.getActive()
      .then((notifs) => {
        setNotifications(notifs);
        const stored = localStorage.getItem("horras_dismissed_notifs");
        const dismissed = stored ? new Set<number>(JSON.parse(stored) as number[]) : new Set<number>();
        setDismissedIds(dismissed);
        const seen = localStorage.getItem("horras_seen_notifs");
        const seenSet = seen ? new Set<number>(JSON.parse(seen) as number[]) : new Set<number>();
        setSeenIds(seenSet);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const visibleNotifs = notifications.filter((n) => !dismissedIds.has(n.id));
  const unreadCount = visibleNotifs.filter((n) => !seenIds.has(n.id)).length;

  const openBell = () => {
    setBellOpen((v) => !v);
    if (!bellOpen) {
      const allIds = visibleNotifs.map((n) => n.id);
      const newSeen = new Set([...seenIds, ...allIds]);
      setSeenIds(newSeen);
      localStorage.setItem("horras_seen_notifs", JSON.stringify([...newSeen]));
    }
  };

  const dismissNotif = (id: number) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem("horras_dismissed_notifs", JSON.stringify([...next]));
      return next;
    });
  };

  const isActive = (path: string) => location === path;

  const SidebarNavItem = ({ item }: { item: typeof DASH_NAV[0] }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    return (
      <Link
        href={item.path}
        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 select-none ${
          active
            ? "text-primary bg-gradient-to-r from-primary/15 to-primary/[0.03]"
            : "text-white/45 hover:text-white hover:bg-white/[0.045]"
        }`}
      >
        {active && (
          <span
            className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "right-0" : "left-0"} w-[3px] h-6 rounded-full bg-primary`}
            style={{ boxShadow: "0 0 10px rgba(255,184,0,0.7)" }}
          />
        )}
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
            active
              ? "bg-primary/20"
              : "bg-white/[0.035] group-hover:bg-primary/10 group-hover:-translate-y-px"
          }`}
        >
          <Icon
            className={`w-4 h-4 transition-colors ${
              active ? "text-primary" : "text-white/35 group-hover:text-primary/75"
            }`}
          />
        </div>
        <span className={`transition-colors flex-1 ${active ? "text-primary" : "group-hover:text-white/90"}`}>
          {isRTL ? item.labelAr : item.labelEn}
        </span>
        {active && (
          <span
            className="ms-auto w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0"
            style={{ boxShadow: "0 0 6px rgba(255,184,0,0.8)" }}
          />
        )}
      </Link>
    );
  };

  const currentBanner = visibleNotifs[0] ?? null;

  return (
    <div
      className="flex h-screen overflow-hidden bg-[#0A0A0A]"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-e border-white/[0.055] bg-[#080808]/90 backdrop-blur-2xl">
        <Link href="/" className="flex items-center gap-2.5 px-5 py-[18px] border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors group">
          <div className="bg-primary/15 p-1.5 rounded-lg border border-primary/25 group-hover:bg-primary/25 transition-colors">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-black tracking-tight">حُراس</span>
        </Link>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-none">
          {DASH_NAV.map((item) => (
            <SidebarNavItem key={item.path} item={item} />
          ))}
        </nav>

        <div className="border-t border-white/[0.05] px-3 py-3 space-y-1">
          <button
            onClick={toggleLang}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white/35 hover:text-white/70 hover:bg-white/[0.04] transition-all"
          >
            <Globe className="w-3.5 h-3.5 shrink-0" />
            {lang === "ar" ? "Switch to English" : "التحويل للعربية"}
          </button>
          {user && (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.025] transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                <span className="text-sm font-black text-primary">{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-xs font-bold text-white/75 truncate">{user.name}</p>
                <p className="text-[10px] text-white/28 truncate">{user.email}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 shrink-0 rounded-lg text-white/28 hover:text-red-400 hover:bg-red-500/10 transition-all"
                onClick={logout}
                title={isRTL ? "تسجيل الخروج" : "Log out"}
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Top Header ── */}
        <header className="relative shrink-0 h-14 flex items-center justify-between px-5 border-b border-white/[0.05] bg-[#080808]/60 backdrop-blur-xl z-[60]">
          {/* Mobile logo — clickable, navigates home */}
          <Link href="/" className="md:hidden flex items-center gap-2 group">
            <div className="bg-primary/15 p-1 rounded-md border border-primary/20 group-hover:bg-primary/25 transition-colors">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <span className="font-black text-sm">حُراس</span>
          </Link>
          {/* Desktop spacer (sidebar already has the logo) */}
          <div className="hidden md:block" />

          <div className="flex items-center gap-1.5">
            {/* Bell */}
            <div className="relative" ref={bellRef}>
              <button
                onClick={openBell}
                className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  bellOpen
                    ? "bg-primary/15 text-primary shadow-[0_0_12px_rgba(255,184,0,0.2)]"
                    : "bg-white/[0.04] hover:bg-white/[0.08] text-white/45 hover:text-white"
                }`}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-0.5 -end-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-lg"
                    style={{ animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {bellOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-[calc(100%+10px)] w-80 bg-[#0d0d0d]/85 backdrop-blur-2xl border border-white/[0.09] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden z-[9999] end-0"
                  >
                    <div className="h-[1.5px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                    <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-3.5 h-3.5 text-primary" />
                        <span className="text-sm font-bold">{isRTL ? "الإشعارات" : "Notifications"}</span>
                      </div>
                      {visibleNotifs.length > 0 && (
                        <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-bold border border-primary/20">
                          {visibleNotifs.length}
                        </span>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto scrollbar-none">
                      {visibleNotifs.length === 0 ? (
                        <div className="px-4 py-10 text-center">
                          <Bell className="w-8 h-8 text-white/10 mx-auto mb-2.5" />
                          <p className="text-xs text-white/28 font-medium">
                            {isRTL ? "لا توجد إشعارات جديدة" : "No new notifications"}
                          </p>
                        </div>
                      ) : (
                        <div className="p-2 space-y-1">
                          {visibleNotifs.map((notif) => (
                            <div
                              key={notif.id}
                              className="group relative flex gap-3 p-3 rounded-xl hover:bg-white/[0.035] transition-colors cursor-default"
                              dir={isRTL ? "rtl" : "ltr"}
                            >
                              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                                <Bell className="w-3.5 h-3.5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                {(isRTL ? notif.titleAr : notif.titleEn) && (
                                  <p className="text-xs font-bold text-white/85 mb-0.5">
                                    {isRTL ? (notif.titleAr || notif.titleEn) : (notif.titleEn || notif.titleAr)}
                                  </p>
                                )}
                                <p className="text-xs text-white/45 leading-relaxed">
                                  {isRTL ? notif.bodyAr : (notif.bodyEn || notif.bodyAr)}
                                </p>
                              </div>
                              <button
                                onClick={() => dismissNotif(notif.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 w-5 h-5 rounded-full hover:bg-white/10 flex items-center justify-center text-white/28 hover:text-white/60"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-white/[0.04] px-4 py-2.5">
                      <p className="text-[10px] text-white/20 text-center">
                        {isRTL ? "رسائل من فريق حُراس" : "Messages from Horras team"}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Lang toggle */}
            <button
              onClick={toggleLang}
              className="hidden sm:flex w-9 h-9 rounded-xl items-center justify-center text-[11px] font-black text-white/40 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.05] transition-all"
            >
              {lang === "ar" ? "EN" : "AR"}
            </button>

            {/* Mobile user avatar */}
            {user && (
              <div className="md:hidden flex items-center gap-1">
                <Link
                  href="/dashboard"
                  className="w-8 h-8 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center"
                >
                  <span className="text-xs font-black text-primary">{user.name.charAt(0).toUpperCase()}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-lg text-white/28 hover:text-red-400 hover:bg-red-500/10"
                  onClick={logout}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* ── Notification Banner (slim, above content) ── */}
        <AnimatePresence>
          {currentBanner && !bellOpen && (
            <motion.div
              key={currentBanner.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="shrink-0 overflow-hidden"
            >
              <div
                className="bg-primary/[0.07] border-b border-primary/20 px-5 py-2 flex items-center gap-3"
                dir={isRTL ? "rtl" : "ltr"}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"
                  style={{ animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }}
                />
                <div className="flex-1 min-w-0 text-xs">
                  {(isRTL ? currentBanner.titleAr : currentBanner.titleEn) && (
                    <span className="font-bold text-primary me-1.5">
                      {isRTL
                        ? (currentBanner.titleAr || currentBanner.titleEn)
                        : (currentBanner.titleEn || currentBanner.titleAr)}:
                    </span>
                  )}
                  <span className="text-white/55">
                    {isRTL ? currentBanner.bodyAr : (currentBanner.bodyEn || currentBanner.bodyAr)}
                  </span>
                </div>
                {visibleNotifs.length > 1 && (
                  <span className="text-[10px] text-white/30 shrink-0">+{visibleNotifs.length - 1}</span>
                )}
                <button
                  onClick={() => dismissNotif(currentBanner.id)}
                  className="shrink-0 text-white/28 hover:text-white/60 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Scrollable Content ── */}
        <main className="flex-1 overflow-y-auto scrollbar-none pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Navigation ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center h-16 bg-[#080808]/95 backdrop-blur-2xl border-t border-white/[0.07] px-1"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {DASH_NAV.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl mx-0.5 transition-all duration-200 ${
                active ? "text-primary" : "text-white/28 hover:text-white/55"
              }`}
            >
              <div className="relative w-6 h-6 flex items-center justify-center">
                <Icon className={`w-[18px] h-[18px] transition-transform duration-200 ${active ? "scale-110" : ""}`} />
                {active && (
                  <span
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                    style={{ boxShadow: "0 0 6px rgba(255,184,0,0.9)" }}
                  />
                )}
              </div>
              <span className={`text-[9px] font-bold leading-none ${active ? "text-primary" : ""}`}>
                {isRTL ? item.labelAr : item.labelEn}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
