import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useApp } from "@/context/AppContext";
import { Shield, Menu, X, LogOut, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useApp();
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "الرئيسية", path: "/" },
    { label: "افحص الرابط", path: "/check-link" },
    { label: "اختبر أمانك", path: "/security-test" },
    { label: "بلّغ عن احتيال", path: "/report" },
    { label: "تعلّم بسرعة", path: "/learn" },
    { label: "أدوات الأمان", path: "/tools" },
    { label: "عن المنصة", path: "/about" },
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
              <span className="text-2xl font-black tracking-tight">حراس</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-1 lg:gap-2">
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
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions (Left Side) */}
            <div className="hidden md:flex items-center gap-4">
              <Button 
                onClick={() => setLocation("/check-link")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl px-5 hover:-translate-y-0.5 transition-transform"
              >
                افحص رابط الآن
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
                  <Button variant="ghost" size="icon" onClick={logout} title="تسجيل خروج">
                    <LogOut className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setLocation("/login")}>دخول</Button>
                  <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => setLocation("/signup")}>تسجيل</Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
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
                افحص رابط الآن
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
                    {link.label}
                    <ChevronLeft className="w-4 h-4 opacity-50" />
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
                      <p className="text-xs text-muted-foreground">لوحة التحكم</p>
                    </div>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
                    <LogOut className="w-5 h-5 text-destructive" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3 pt-2">
                  <Button className="flex-1" variant="outline" onClick={() => { setLocation("/login"); setIsMobileMenuOpen(false); }}>دخول</Button>
                  <Button className="flex-1" variant="outline" onClick={() => { setLocation("/signup"); setIsMobileMenuOpen(false); }}>تسجيل</Button>
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
                <span className="text-2xl font-black">حراس</span>
              </Link>
              <p className="text-muted-foreground leading-relaxed text-sm">
                منصة رقمية عربية رائدة لتعزيز الوعي بالأمن السيبراني وحماية الشباب من الاحتيال الرقمي والاختراقات في بيئة آمنة وتفاعلية.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6">روابط سريعة</h4>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                <li><Link href="/check-link" className="hover:text-primary transition-colors">افحص الرابط</Link></li>
                <li><Link href="/security-test" className="hover:text-primary transition-colors">اختبر أمانك</Link></li>
                <li><Link href="/report" className="hover:text-primary transition-colors">بلّغ عن احتيال</Link></li>
                <li><Link href="/learn" className="hover:text-primary transition-colors">تعلّم بسرعة</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">موارد</h4>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                <li><Link href="/tools" className="hover:text-primary transition-colors">أدوات الأمان</Link></li>
                <li><Link href="/tools" className="hover:text-primary transition-colors">محاكي الاحتيال</Link></li>
                <li><Link href="/" className="hover:text-primary transition-colors">الإحصائيات</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">قانوني</h4>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary transition-colors">عن المنصة</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">سياسة الخصوصية</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">شروط الاستخدام</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} حراس. جميع الحقوق محفوظة.</p>
            <p className="text-xs max-w-md text-center md:text-left opacity-60">
              تنويه: هذه المنصة تعليمية توعوية ولا تغني عن الإبلاغ الرسمي للجهات الأمنية المختصة في بلدك.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
