import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { api, type ApiUser, type ApiActivity } from "@/lib/api";

export interface User {
  id?: number;
  name: string;
  email: string;
  role: "admin" | "user";
  joinDate?: string;
}

export interface AppState {
  user: User | null;
  quizScore: number | null;
  linksChecked: number;
  profileSetup: boolean;
  toolsChecked: string[];
  isLoading: boolean;
}

interface LoginResult {
  success: boolean;
  error?: string;
}

interface RegisterResult {
  success: boolean;
  error?: string;
}

interface AppContextType extends AppState {
  isAdmin: boolean;
  validateLogin: (email: string, password: string) => Promise<LoginResult>;
  register: (name: string, email: string, password: string) => Promise<RegisterResult>;
  logout: () => void;
  setQuizScore: (score: number) => Promise<void>;
  incrementLinksChecked: () => Promise<void>;
  toggleToolChecked: (toolId: string) => Promise<void>;
  getSecurityScore: () => number;
  getSecurityLevel: () => { label: string; color: string; badgeColor: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_STATE: AppState = {
  user: null,
  quizScore: null,
  linksChecked: 0,
  profileSetup: false,
  toolsChecked: [],
  isLoading: true,
};

function applyAuth(user: ApiUser, activity: ApiActivity): Partial<AppState> {
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "admin" | "user",
      joinDate: user.joinDate,
    },
    quizScore: activity.quizScore,
    linksChecked: activity.linksChecked,
    toolsChecked: activity.toolsChecked,
    profileSetup: true,
    isLoading: false,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const activityRef = useRef<ApiActivity>({ quizScore: null, linksChecked: 0, toolsChecked: [] });

  useEffect(() => {
    const token = api.auth.getToken();
    if (!token) {
      setState((p) => ({ ...p, isLoading: false }));
      return;
    }
    api.auth
      .me()
      .then(({ user, activity }) => {
        activityRef.current = activity;
        setState((p) => ({ ...p, ...applyAuth(user, activity) }));
      })
      .catch(() => {
        api.auth.clearToken();
        setState((p) => ({ ...p, isLoading: false }));
      });
  }, []);

  const isAdmin = state.user?.role === "admin";

  const validateLogin = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const { token, user, activity } = await api.auth.login(email, password);
      api.auth.setToken(token);
      activityRef.current = activity;
      setState((p) => ({ ...p, ...applyAuth(user, activity) }));
      return { success: true };
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "unknown";
      return { success: false, error: code };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
  ): Promise<RegisterResult> => {
    try {
      const { token, user, activity } = await api.auth.register(name, email, password);
      api.auth.setToken(token);
      activityRef.current = activity;
      setState((p) => ({ ...p, ...applyAuth(user, activity) }));
      return { success: true };
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "unknown";
      return { success: false, error: code };
    }
  };

  const logout = () => {
    api.auth.clearToken();
    setState(INITIAL_STATE);
    setState((p) => ({ ...p, isLoading: false }));
  };

  const setQuizScore = async (score: number) => {
    setState((p) => ({ ...p, quizScore: score }));
    try {
      await api.activity.update({ quizScore: score });
    } catch {
      /* non-blocking */
    }
  };

  const incrementLinksChecked = async () => {
    const newCount = state.linksChecked + 1;
    setState((p) => ({ ...p, linksChecked: newCount }));
    try {
      await api.activity.update({ linksChecked: newCount });
    } catch {
      /* non-blocking */
    }
  };

  const toggleToolChecked = async (toolId: string) => {
    const isChecked = state.toolsChecked.includes(toolId);
    const toolsChecked = isChecked
      ? state.toolsChecked.filter((id) => id !== toolId)
      : [...state.toolsChecked, toolId];
    setState((p) => ({ ...p, toolsChecked }));
    try {
      await api.activity.update({ toolsChecked });
    } catch {
      /* non-blocking */
    }
  };

  const getSecurityScore = () => {
    let score = 0;
    if (state.quizScore !== null) score += 30;
    if (state.linksChecked > 0) score += 30;
    if (state.profileSetup) score += 20;
    if (state.toolsChecked.length >= 8) score += 20;
    return Math.min(100, score);
  };

  const getSecurityLevel = () => {
    const score = getSecurityScore();
    if (score >= 80)
      return {
        label: "خبير",
        color: "text-emerald-400",
        badgeColor: "bg-emerald-400/20 text-emerald-400 border-emerald-400/30",
      };
    if (score >= 50)
      return {
        label: "متوسط",
        color: "text-amber-400",
        badgeColor: "bg-amber-400/20 text-amber-400 border-amber-400/30",
      };
    return {
      label: "في خطر",
      color: "text-destructive",
      badgeColor: "bg-destructive/20 text-destructive border-destructive/30",
    };
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        isAdmin,
        validateLogin,
        register,
        logout,
        setQuizScore,
        incrementLinksChecked,
        toggleToolChecked,
        getSecurityScore,
        getSecurityLevel,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
