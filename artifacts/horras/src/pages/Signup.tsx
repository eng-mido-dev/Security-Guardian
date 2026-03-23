import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, User, Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/context/AppContext";
import { useLang } from "@/context/LangContext";
import { useToast } from "@/hooks/use-toast";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useApp();
  const { t, isRTL } = useLang();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const passwordStrength = (): number => {
    if (password.length === 0) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strengthColors = ["bg-destructive", "bg-amber-500", "bg-amber-400", "bg-emerald-400", "bg-emerald-500"];
  const strength = passwordStrength();

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name.trim()) newErrors.name = t("signup.nameRequired");
    else if (name.trim().length < 2) newErrors.name = t("signup.nameMin");
    if (!email.trim()) newErrors.email = t("signup.emailRequired");
    else if (!emailRegex.test(email)) newErrors.email = t("signup.emailInvalid");
    if (!password) newErrors.password = t("signup.passwordRequired");
    else if (password.length < 8) newErrors.password = t("signup.passwordMin");
    if (!confirmPassword) newErrors.confirmPassword = t("signup.confirmRequired");
    else if (confirmPassword !== password) newErrors.confirmPassword = t("signup.passwordMismatch");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const result = register(name, email, password);
    setIsLoading(false);

    if (!result.success) {
      if (result.error === "email_taken") {
        toast({
          title: isRTL ? "البريد الإلكتروني مستخدم" : "Email Already Registered",
          description: isRTL
            ? "هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول."
            : "This email is already registered. Please sign in instead.",
          variant: "destructive",
        });
        setErrors({ email: isRTL ? "البريد الإلكتروني مستخدم مسبقاً" : "Email already taken" });
      }
      return;
    }

    toast({ title: isRTL ? "تم إنشاء الحساب بنجاح 🎉" : "Account created successfully 🎉" });
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md glass-card rounded-[2.5rem] p-10 border-white/10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex bg-primary/10 p-4 rounded-2xl mb-4 border border-primary/20">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-black mb-2">{t("signup.title")}</h1>
          <p className="text-muted-foreground text-sm">{t("signup.subtitle")}</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">{t("signup.name")}</Label>
            <div className="relative">
              <User className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
                className={`h-12 rounded-xl bg-black/40 pe-10 ${errors.name ? "border-destructive" : "border-white/10"}`}
              />
            </div>
            <AnimatePresence>
              {errors.name && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-destructive text-xs">
                  {errors.name}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("signup.email")}</Label>
            <div className="relative">
              <Mail className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                className={`h-12 rounded-xl bg-black/40 pe-10 ${errors.email ? "border-destructive" : "border-white/10"}`}
                style={{ direction: "ltr", textAlign: "left" }}
              />
            </div>
            <AnimatePresence>
              {errors.email && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-destructive text-xs">
                  {errors.email}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("signup.password")}</Label>
            <div className="relative">
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                className={`h-12 rounded-xl bg-black/40 pe-10 ${errors.password ? "border-destructive" : "border-white/10"}`}
                style={{ direction: "ltr", textAlign: "left" }}
              />
            </div>
            {password.length > 0 && (
              <div className="flex gap-1 mt-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColors[strength] : "bg-white/10"}`}></div>
                ))}
              </div>
            )}
            <AnimatePresence>
              {errors.password && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-destructive text-xs">
                  {errors.password}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("signup.confirmPassword")}</Label>
            <div className="relative">
              <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors">
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {confirmPassword && confirmPassword === password && (
                <CheckCircle className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
              )}
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: undefined })); }}
                className={`h-12 rounded-xl bg-black/40 pe-10 ${errors.confirmPassword ? "border-destructive" : confirmPassword && confirmPassword === password ? "border-emerald-400/50" : "border-white/10"}`}
                style={{ direction: "ltr", textAlign: "left" }}
              />
            </div>
            <AnimatePresence>
              {errors.confirmPassword && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-destructive text-xs">
                  {errors.confirmPassword}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 text-base font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                {t("signup.submit")}...
              </span>
            ) : t("signup.submit")}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          {t("signup.hasAccount")}{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">
            {t("signup.loginLink")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
