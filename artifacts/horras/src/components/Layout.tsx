import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useApp } from "@/context/AppContext";
import { useLang } from "@/context/LangContext";
import { Shield, Menu, X, LogOut, ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useApp();
  const { t, lang, toggleLang, isRTL } = useLang();
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const ChevronDir = isRTL ? ChevronLeft : ChevronRight;

  const navLinks = [
    { labelKey: "nav.home", path: "/" },
    { labelKey: "nav.checkLink", path: "/check-link" },
    { labelKey: "nav.securityTest", path: "/security-test" },
    { labelKey: "nav.report", path: "/report" },
    { labelKey: "nav.learn", path: "/learn" },
    { labelKey: "nav.tools", path: "/tools" },
    { labelKey: "nav.about", path: "/about" },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50 w-full glass-card border-b-0 border-white/10 rounded-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="bg-primary/20 p-2 rounded-xl border border-primary/30 group-hover:bg-primary/30 transition-colors">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <span className="text-2xl font-black tracking-tight">{t("brand.name")}</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    location === link.path
                      ? "bg-white/10 text-primary"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  }`}
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* Language Toggle */}
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm font-bold text-muted-foreground hover:text-white"
                title={lang === "ar" ? "Switch to English" : "التحويل للعربية"}
              >
                <Globe className="w-4 h-4" />
                <span>{lang === "ar" ? "EN" : "AR"}</span>
              </button>

              <Button
                onClick={() => setLocation("/check-link")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl px-5 hover:-translate-y-0.5 transition-transform"
              >
                {t("nav.checkNow")}
              </Button>

              <div className="h-8 w-px bg-border mx-1"></div>

              {user ? (
                <div className="flex items-center gap-3">
                  <Link href="/dashboard" className="flex items-center gap-2 hover:bg-white/5 p-2 rounded-lg transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-amber-600 flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={logout} title={t("nav.logout")}>
                    <LogOut className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setLocation("/login")}>{t("nav.login")}</Button>
                  <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => setLocation("/signup")}>{t("nav.signup")}</Button>
                </div>
              )}
            </div>

            {/* Mobile: Language toggle + Menu button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleLang}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-xs font-bold text-muted-foreground"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{lang === "ar" ? "EN" : "AR"}</span>
              </button>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-border bg-card/95 backdrop-blur-xl absolute top-20 left-0 right-0 z-40"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              <Button
                onClick={() => { setLocation("/check-link"); setIsMobileMenuOpen(false); }}
                className="w-full bg-primary text-primary-foreground font-bold"
              >
                {t("nav.checkNow")}
              </Button>
              <div className="flex flex-col gap-1 border-y border-border py-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl font-medium flex justify-between items-center ${
                      location === link.path ? "bg-primary/10 text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {t(link.labelKey)}
                    <ChevronDir className="w-4 h-4 opacity-50" />
                  </Link>
                ))}
              </div>
              {user ? (
                <div className="flex items-center justify-between pt-2">
                  <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{lang === "ar" ? "لوحة التحكم" : "Dashboard"}</p>
                    </div>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
                    <LogOut className="w-5 h-5 text-destructive" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3 pt-2">
                  <Button className="flex-1" variant="outline" onClick={() => { setLocation("/login"); setIsMobileMenuOpen(false); }}>{t("nav.login")}</Button>
                  <Button className="flex-1" variant="outline" onClick={() => { setLocation("/signup"); setIsMobileMenuOpen(false); }}>{t("nav.signup")}</Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow flex flex-col relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-[#050505] pt-16 pb-8 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-primary" />
                <span className="text-2xl font-black">{t("brand.name")}</span>
              </Link>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {t("footer.description")}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">{t("footer.quickLinks")}</h4>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                <li><Link href="/check-link" className="hover:text-primary transition-colors">{t("nav.checkLink")}</Link></li>
                <li><Link href="/security-test" className="hover:text-primary transition-colors">{t("nav.securityTest")}</Link></li>
                <li><Link href="/report" className="hover:text-primary transition-colors">{t("nav.report")}</Link></li>
                <li><Link href="/learn" className="hover:text-primary transition-colors">{t("nav.learn")}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">{t("footer.resources")}</h4>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                <li><Link href="/tools" className="hover:text-primary transition-colors">{t("nav.tools")}</Link></li>
                <li><Link href="/tools" className="hover:text-primary transition-colors">{t("footer.simulator")}</Link></li>
                <li><Link href="/" className="hover:text-primary transition-colors">{t("footer.stats")}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">{t("footer.legal")}</h4>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary transition-colors">{t("footer.about")}</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">{t("footer.privacy")}</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">{t("footer.terms")}</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} {t("brand.name")}. {t("footer.copyright")}</p>
            <p className="text-xs max-w-md text-center opacity-60">
              {t("footer.disclaimer")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
