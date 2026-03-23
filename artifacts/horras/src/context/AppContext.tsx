import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  name: string;
  email: string;
}

export interface AppState {
  user: User | null;
  quizScore: number | null;
  linksChecked: number;
  profileSetup: boolean;
  toolsChecked: string[];
}

interface AppContextType extends AppState {
  login: (user: User) => void;
  logout: () => void;
  setQuizScore: (score: number) => void;
  incrementLinksChecked: () => void;
  toggleToolChecked: (toolId: string) => void;
  getSecurityScore: () => number;
  getSecurityLevel: () => { label: string; color: string; badgeColor: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem("horras_state");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // invalid json
      }
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
  }, [state]);

  const login = (user: User) => {
    setState((prev) => ({ ...prev, user, profileSetup: true }));
  };

  const logout = () => {
    setState((prev) => ({ ...prev, user: null }));
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
    if (state.quizScore !== null) score += 30; // completed quiz: +30
    if (state.linksChecked > 0) score += 30;   // checked at least one link: +30
    if (state.profileSetup) score += 20;        // profile setup / signup: +20
    if (state.toolsChecked.length >= 8) score += 20; // completed full security checklist: +20
    
    return Math.min(100, score);
  };

  const getSecurityLevel = () => {
    const score = getSecurityScore();
    if (score >= 80) return { label: "خبير", color: "text-emerald-400", badgeColor: "bg-emerald-400/20 text-emerald-400 border-emerald-400/30" };
    if (score >= 50) return { label: "متوسط", color: "text-amber-400", badgeColor: "bg-amber-400/20 text-amber-400 border-amber-400/30" };
    return { label: "في خطر", color: "text-destructive", badgeColor: "bg-destructive/20 text-destructive border-destructive/30" };
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
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
