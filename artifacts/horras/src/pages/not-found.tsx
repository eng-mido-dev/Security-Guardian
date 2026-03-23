import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ShieldOff, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="inline-flex bg-primary/10 p-6 rounded-3xl mb-8 border border-primary/20">
          <ShieldOff className="w-14 h-14 text-primary" />
        </div>

        <h1 className="text-7xl font-black text-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4">الصفحة غير موجودة</h2>
        <p className="text-muted-foreground mb-10 leading-relaxed">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>

        <Button
          size="lg"
          className="rounded-xl px-10 font-bold"
          onClick={() => setLocation("/")}
        >
          <Home className="w-5 h-5 ml-2" />
          العودة للرئيسية
        </Button>
      </motion.div>
    </div>
  );
}
