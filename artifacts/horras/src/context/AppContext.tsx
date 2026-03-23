import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  name: string;
  email: string;
  role: "admin" | "user";
  joinDate?: string;
}

export interface StoredUser {
  name: string;
  email: string;
  password: string;
  joinDate: string;
}

export interface UserActivity {
  quizScore: number | null;
  linksChecked: number;
  toolsChecked: string[];
}

export interface AppState {
  user: User | null;
  quizScore: number | null;
  linksChecked: number;
  profileSetup: boolean;
  toolsChecked: string[];
}

const ADMIN_EMAIL = "admin@h.com";
const ADMIN_PASSWORD = "Admin";

const getStoredUsers = (): StoredUser[] => {
  try {
    return JSON.parse(localStorage.getItem("horras_users") || "[]");
  } catch {
    return [];
  }
};

const saveStoredUsers = (users: StoredUser[]) => {
  localStorage.setItem("horras_users", JSON.stringify(users));
};

const activityKey = (email: string) => `horras_activity_${email.toLowerCase()}`;

const loadUserActivity = (email: string): UserActivity => {
  try {
    const raw = localStorage.getItem(activityKey(email));
    if (!raw) return { quizScore: null, linksChecked: 0, toolsChecked: [] };
    const parsed = JSON.parse(raw);
    return {
      quizScore: parsed.quizScore ?? null,
      linksChecked: parsed.linksChecked ?? 0,
      toolsChecked: Array.isArray(parsed.toolsChecked) ? parsed.toolsChecked : [],
    };
  } catch {
    return { quizScore: null, linksChecked: 0, toolsChecked: [] };
  }
};

const saveUserActivity = (email: string, activity: UserActivity) => {
  localStorage.setItem(activityKey(email), JSON.stringify(activity));
};

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
  validateLogin: (email: string, password: string) => LoginResult;
  register: (name: string, email: string, password: string) => RegisterResult;
  login: (user: User) => void;
  logout: () => void;
  setQuizScore: (score: number) => void;
  incrementLinksChecked: () => void;
  toggleToolChecked: (toolId: string) => void;
  getSecurityScore: () => number;
  getSecurityLevel: () => { label: string; color: string; badgeColor: string };
  getAllUsers: () => StoredUser[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_ACTIVITY: UserActivity = { quizScore: null, linksChecked: 0, toolsChecked: [] };

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem("horras_state");
      if (saved) {
        const parsed: AppState = JSON.parse(saved);
        if (parsed.user) {
          const activity = loadUserActivity(parsed.user.email);
          return {
            ...parsed,
            quizScore: activity.quizScore,
            linksChecked: activity.linksChecked,
            toolsChecked: activity.toolsChecked,
          };
        }
        return parsed;
      }
    } catch {
      /* ignore */
    }
    return {
      user: null,
      quizScore: null,
      linksChecked: 0,
      profileSetup: false,
      toolsChecked: [],
    };
  });

  useEffect(() => {
    localStorage.setItem("horras_state", JSON.stringify(state));
    if (state.user) {
      saveUserActivity(state.user.email, {
        quizScore: state.quizScore,
        linksChecked: state.linksChecked,
        toolsChecked: state.toolsChecked,
      });
    }
  }, [state]);

  const isAdmin = state.user?.role === "admin";

  const validateLogin = (email: string, password: string): LoginResult => {
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail === ADMIN_EMAIL.toLowerCase()) {
      if (password !== ADMIN_PASSWORD) {
        return { success: false, error: "wrong_password" };
      }
      const activity = loadUserActivity(ADMIN_EMAIL);
      const users = getStoredUsers();
      const adminRecord = users.find((u) => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
      const adminJoinDate = adminRecord?.joinDate ?? new Date().toISOString();
      setState((prev) => ({
        ...prev,
        user: { name: "Admin", email: ADMIN_EMAIL, role: "admin", joinDate: adminJoinDate },
        profileSetup: true,
        quizScore: activity.quizScore,
        linksChecked: activity.linksChecked,
        toolsChecked: activity.toolsChecked,
      }));
      return { success: true };
    }

    const users = getStoredUsers();
    const found = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!found) return { success: false, error: "user_not_found" };
    if (found.password !== password) return { success: false, error: "wrong_password" };

    const activity = loadUserActivity(normalizedEmail);
    setState((prev) => ({
      ...prev,
      user: { name: found.name, email: found.email, role: "user", joinDate: found.joinDate },
      profileSetup: true,
      quizScore: activity.quizScore,
      linksChecked: activity.linksChecked,
      toolsChecked: activity.toolsChecked,
    }));
    return { success: true };
  };

  const register = (name: string, email: string, password: string): RegisterResult => {
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail === ADMIN_EMAIL.toLowerCase()) {
      return { success: false, error: "email_taken" };
    }

    const users = getStoredUsers();
    if (users.find((u) => u.email.toLowerCase() === normalizedEmail)) {
      return { success: false, error: "email_taken" };
    }

    const joinDate = new Date().toISOString();
    const newUser: StoredUser = { name: name.trim(), email: normalizedEmail, password, joinDate };
    saveStoredUsers([...users, newUser]);

    saveUserActivity(normalizedEmail, DEFAULT_ACTIVITY);

    setState((prev) => ({
      ...prev,
      user: { name: name.trim(), email: normalizedEmail, role: "user", joinDate },
      profileSetup: true,
      quizScore: null,
      linksChecked: 0,
      toolsChecked: [],
    }));
    return { success: true };
  };

  const login = (user: User) => {
    const activity = loadUserActivity(user.email);
    setState((prev) => ({
      ...prev,
      user,
      profileSetup: true,
      quizScore: activity.quizScore,
      linksChecked: activity.linksChecked,
      toolsChecked: activity.toolsChecked,
    }));
  };

  const logout = () => {
    setState((prev) => ({
      ...prev,
      user: null,
      quizScore: null,
      linksChecked: 0,
      profileSetup: false,
      toolsChecked: [],
    }));
  };

  const setQuizScore = (score: number) => {
    setState((prev) => ({ ...prev, quizScore: score }));
  };

  const incrementLinksChecked = () => {
    setState((prev) => ({ ...prev, linksChecked: prev.linksChecked + 1 }));
  };

  const toggleToolChecked = (toolId: string) => {
    setState((prev) => {
      const isChecked = prev.toolsChecked.includes(toolId);
      const toolsChecked = isChecked
        ? prev.toolsChecked.filter((id) => id !== toolId)
        : [...prev.toolsChecked, toolId];
      return { ...prev, toolsChecked };
    });
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
    if (score >= 80) return { label: "خبير", color: "text-emerald-400", badgeColor: "bg-emerald-400/20 text-emerald-400 border-emerald-400/30" };
    if (score >= 50) return { label: "متوسط", color: "text-amber-400", badgeColor: "bg-amber-400/20 text-amber-400 border-amber-400/30" };
    return { label: "في خطر", color: "text-destructive", badgeColor: "bg-destructive/20 text-destructive border-destructive/30" };
  };

  const getAllUsers = (): StoredUser[] => getStoredUsers();

  return (
    <AppContext.Provider
      value={{
        ...state,
        isAdmin,
        validateLogin,
        register,
        login,
        logout,
        setQuizScore,
        incrementLinksChecked,
        toggleToolChecked,
        getSecurityScore,
        getSecurityLevel,
        getAllUsers,
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
