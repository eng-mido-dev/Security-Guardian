import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Shield, User, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useApp();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && password) {
      // Mock signup -> auto login
      login({ name, email });
      toast({ title: "تم إنشاء الحساب بنجاح!" });
      setLocation("/dashboard");
    }
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
          <h1 className="text-3xl font-black mb-2">إنشاء حساب جديد</h1>
          <p className="text-muted-foreground text-sm">انضم إلى مجتمع حراس وقم بحماية تواجدك الرقمي</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">الاسم بالكامل</Label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                id="name" 
                type="text" 
                required 
                value={name}
                onChange={e => setName(e.target.value)}
                className="h-12 rounded-xl bg-black/40 border-white/10 pr-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                id="email" 
                type="email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-12 rounded-xl bg-black/40 border-white/10 pr-10"
                style={{ direction: 'ltr', textAlign: 'left' }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-12 rounded-xl bg-black/40 border-white/10 pr-10"
                style={{ direction: 'ltr', textAlign: 'left' }}
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 mt-4">
            إنشاء الحساب
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">
            تسجيل الدخول
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
