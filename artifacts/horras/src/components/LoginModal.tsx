import { motion, AnimatePresence } from "framer-motion";
import { Shield, X, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/context/LangContext";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { t, isRTL } = useLang();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const goLogin = () => { onClose(); setLocation("/login"); };
  const goSignup = () => { onClose(); setLocation("/signup"); };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full max-w-sm bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl text-center overflow-hidden"
              dir={isRTL ? "rtl" : "ltr"}
            >
              {/* Gold top glow */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 end-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/15 border border-primary/20 mb-5 mx-auto">
                <Shield className="w-8 h-8 text-primary" />
              </div>

              {/* Title */}
              <h2 className="text-xl font-black mb-3 text-white">
                {t("gate.title")}
              </h2>

              {/* Message */}
              <p className="text-muted-foreground text-sm leading-relaxed mb-7 max-w-xs mx-auto">
                {t("gate.message")}
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  className="w-full rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                  onClick={goLogin}
                >
                  <LogIn className="w-4 h-4" />
                  {t("gate.loginBtn")}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full rounded-xl font-bold border-white/10 bg-white/5 hover:bg-white/10 gap-2"
                  onClick={goSignup}
                >
                  <UserPlus className="w-4 h-4" />
                  {t("gate.signupBtn")}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
