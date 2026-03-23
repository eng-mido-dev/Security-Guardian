import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/context/AppContext";
import { useLang } from "@/context/LangContext";
import { useToast } from "@/hooks/use-toast";

interface FormErrors {
  email?: string;
  password?: string;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useApp();
  const { t } = useLang();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = t("login.emailRequired");
    } else if (!emailRegex.test(email)) {
      newErrors.email = t("login.emailInvalid");
    }

    if (!password) {
      newErrors.password = t("login.passwordRequired");
    } else if (password.length < 6) {
      newErrors.password = t("login.passwordMin");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const name = email.split("@")[0];
    login({ name, email });
    toast({ title: t("login.success") });
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card rounded-[2.5rem] p-10 border-white/10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex bg-primary/10 p-4 rounded-2xl mb-4 border border-primary/20">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-black mb-2">{t("login.title")}</h1>
          <p className="text-muted-foreground text-sm">{t("login.subtitle")}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5" noValidate>
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">{t("login.email")}</Label>
            <div className="relative">
              <Mail className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                className={`h-12 rounded-xl bg-black/40 pe-10 ${errors.email ? "border-destructive focus-visible:ring-destructive" : "border-white/10"}`}
                style={{ direction: "ltr", textAlign: "left" }}
              />
            </div>
            <AnimatePresence>
              {errors.email && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-destructive text-xs mt-1">
                  {errors.email}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t("login.password")}</Label>
              <span className="text-xs text-primary cursor-pointer hover:underline">{t("login.forgotPassword")}</span>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                className={`h-12 rounded-xl bg-black/40 pe-10 ${errors.password ? "border-destructive focus-visible:ring-destructive" : "border-white/10"}`}
                style={{ direction: "ltr", textAlign: "left" }}
              />
            </div>
            <AnimatePresence>
              {errors.password && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-destructive text-xs mt-1">
                  {errors.password}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 text-base font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 mt-4"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                {t("login.submit")}...
              </span>
            ) : t("login.submit")}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          {t("login.noAccount")}{" "}
          <Link href="/signup" className="text-primary font-bold hover:underline">
            {t("login.signupLink")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
