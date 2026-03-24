import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useApp } from "@/context/AppContext";
import { useLang } from "@/context/LangContext";
import { Shield, Menu, X, LogOut, Globe, ChevronDown, LayoutDashboard, AlertTriangle, PlayCircle, Wrench, Info, Home, Link2, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const NAV_PRIMARY = [
  { labelKey: "nav.home", path: "/", icon: Home },
  { labelKey: "nav.checkLink", path: "/check-link", icon: Link2 },
  { labelKey: "nav.securityTest", path: "/security-test", icon: ClipboardCheck },
];

const NAV_MORE = [
  { labelKey: "nav.report", path: "/report", icon: AlertTriangle, descAr: "أبلغ عن رابط أو حساب مشبوه", descEn: "Report a suspicious link or account" },
  { labelKey: "nav.learn", path: "/learn", icon: PlayCircle, descAr: "فيديوهات قصيرة في 60 ثانية", descEn: "Short videos in 60 seconds" },
  { labelKey: "nav.tools", path: "/tools", icon: Wrench, descAr: "أدوات وقوائم فحص الأمان", descEn: "Security tools & checklists" },
  { labelKey: "nav.about", path: "/about", icon: Info, descAr: "تعرّف على مهمة المنصة", descEn: "Learn about the platform mission" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, logout } = useApp();
  const { t, lang, toggleLang, isRTL } = useLang();
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
  }, [location]);

  const isActive = (path: string) => location === path;
  const allNav = [...NAV_PRIMARY, ...NAV_MORE];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Admin badge strip */}
      {isAdmin && (
        <div className="bg-primary text-primary-foreground text-center text-xs font-bold py-1.5 tracking-widest uppercase">
          {isRTL ? "وضع المدير — Admin Mode" : "Admin Mode — وضع المدير"}
        </div>
      )}

      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Logo */}
            <button
              onClick={() => {
                if (location === "/") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                } else {
                  setLocation("/");
                }
              }}
              className="flex items-center gap-2.5 group shrink-0 cursor-pointer"
            >
              <div className="bg-primary/15 p-1.5 rounded-lg border border-primary/25 group-hover:bg-primary/25 transition-colors">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl font-black tracking-tight">{t("brand.name")}</span>
            </button>

            {/* Desktop Primary Nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {NAV_PRIMARY.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isActive(link.path)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  }`}
                >
                  {t(link.labelKey)}
                </Link>
              ))}

              {/* More Dropdown */}
              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setMoreOpen((v) => !v)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    moreOpen ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white hover:bg-white/5"
                  }`}
                >
                  {isRTL ? "المزيد" : "More"}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {moreOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className={`absolute top-[calc(100%+10px)] w-64 bg-[#0f0f0f]/98 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden z-[100] ${isRTL ? "right-0" : "left-0"}`}
                    >
                      {/* Gold top accent */}
                      <div className="h-[1.5px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                      <div className="p-1.5">
                        {NAV_MORE.map((link) => {
                          const Icon = link.icon;
                          const active = isActive(link.path);
                          return (
                            <Link
                              key={link.path}
                              href={link.path}
                              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                                active
                                  ? "bg-primary/10 text-primary"
                                  : "text-muted-foreground hover:text-primary hover:bg-primary/[0.07]"
                              }`}
                            >
                              <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                active ? "bg-primary/20" : "bg-white/[0.04] group-hover:bg-primary/15"
                              }`}>
                                <Icon className={`w-4 h-4 ${active ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold leading-tight">{t(link.labelKey)}</p>
                                <p className="text-[10px] text-muted-foreground/70 leading-tight mt-0.5 truncate">
                                  {isRTL ? link.descAr : link.descEn}
                                </p>
                              </div>
                              {active && <div className="ms-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                            </Link>
                          );
                        })}
                      </div>
                      <div className="h-px bg-white/[0.04] mx-1.5" />
                      <div className="px-3 py-2">
                        <p className="text-[10px] text-muted-foreground/40 text-center">{isRTL ? "منصة حُراس للأمن الرقمي" : "Horras Digital Security Platform"}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Language toggle */}
              <button
                onClick={toggleLang}
                title={lang === "ar" ? "Switch to English" : "التحويل للعربية"}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-xs font-bold text-muted-foreground hover:text-white"
              >
                <Globe className="w-3.5 h-3.5" />
                {lang === "ar" ? "EN" : "AR"}
              </button>

              {user ? (
                <>
                  {/* Dashboard link */}
                  <Link
                    href="/dashboard"
                    className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      isActive("/dashboard") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${isAdmin ? "bg-primary text-primary-foreground" : "bg-white/10 text-white"}`}>
                      {isAdmin ? "A" : user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:inline">{isAdmin ? (isRTL ? "لوحة المدير" : "Admin Panel") : user.name}</span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-muted-foreground hover:text-destructive"
                    onClick={logout}
                    title={t("nav.logout")}
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="rounded-lg h-8 px-3 text-sm" onClick={() => setLocation("/login")}>
                    {t("nav.login")}
                  </Button>
                  <Button size="sm" className="rounded-lg h-8 px-3 text-sm bg-primary text-primary-foreground hover:bg-primary/90 font-bold" onClick={() => setLocation("/signup")}>
                    {t("nav.signup")}
                  </Button>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-all"
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-border bg-[#0D0D0D] sticky top-16 z-40 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-0.5">
              {allNav.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-primary/[0.07] hover:text-primary"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      active ? "bg-primary/20" : "bg-white/[0.04] group-hover:bg-primary/15"
                    }`}>
                      <Icon className={`w-4 h-4 ${active ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                    </div>
                    <span>{t(link.labelKey)}</span>
                    {active && <div className="ms-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                  </Link>
                );
              })}

              <div className="border-t border-white/5 pt-3 mt-3 flex items-center gap-3">
                <button
                  onClick={toggleLang}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-xs font-bold text-muted-foreground"
                >
                  <Globe className="w-3.5 h-3.5" />
                  {lang === "ar" ? "EN" : "AR"}
                </button>

                {user ? (
                  <div className="flex items-center gap-2 flex-grow">
                    <Link href="/dashboard" className="flex items-center gap-2 flex-grow px-3 py-2 rounded-lg hover:bg-white/5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${isAdmin ? "bg-primary text-primary-foreground" : "bg-white/10 text-white"}`}>
                        {isAdmin ? "A" : user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{user.name}</span>
                    </Link>
                    <Button variant="ghost" size="icon" className="w-9 h-9 text-muted-foreground hover:text-destructive shrink-0" onClick={logout}>
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2 flex-grow">
                    <Button size="sm" variant="outline" className="flex-1 rounded-lg border-white/10 text-sm" onClick={() => setLocation("/login")}>{t("nav.login")}</Button>
                    <Button size="sm" className="flex-1 rounded-lg bg-primary text-primary-foreground text-sm font-bold" onClick={() => setLocation("/signup")}>{t("nav.signup")}</Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow flex flex-col relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-[#050505] pt-14 pb-8 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-5">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-xl font-black">{t("brand.name")}</span>
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed">{t("footer.description")}</p>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-muted-foreground/60">{t("footer.quickLinks")}</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="/check-link" className="hover:text-primary transition-colors">{t("nav.checkLink")}</Link></li>
                <li><Link href="/security-test" className="hover:text-primary transition-colors">{t("nav.securityTest")}</Link></li>
                <li><Link href="/report" className="hover:text-primary transition-colors">{t("nav.report")}</Link></li>
                <li><Link href="/learn" className="hover:text-primary transition-colors">{t("nav.learn")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-muted-foreground/60">{t("footer.resources")}</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="/tools" className="hover:text-primary transition-colors">{t("nav.tools")}</Link></li>
                <li><Link href="/tools" className="hover:text-primary transition-colors">{t("footer.simulator")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-muted-foreground/60">{t("footer.legal")}</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary transition-colors">{t("footer.about")}</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">{t("footer.privacy")}</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">{t("footer.terms")}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-muted-foreground/50">
            <p>© {new Date().getFullYear()} {t("brand.name")}. {t("footer.copyright")}</p>
            <p className="max-w-sm text-center">{t("footer.disclaimer")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
