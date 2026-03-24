const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

function getToken(): string | null {
  return localStorage.getItem("horras_token");
}

function setToken(token: string): void {
  localStorage.setItem("horras_token", token);
}

function clearToken(): void {
  localStorage.removeItem("horras_token");
}

class ApiError extends Error {
  status: number;
  code: string;
  constructor(code: string, status: number) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options?.headers as Record<string, string>) ?? {}),
  };

  const res = await fetch(`${API_BASE}/api${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new ApiError(body.error ?? "request_failed", res.status);
  }

  return res.json() as Promise<T>;
}

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  joinDate: string;
}

export interface ApiActivity {
  quizScore: number | null;
  linksChecked: number;
  toolsChecked: string[];
  failedTopics: string[];
}

export interface ApiVideo {
  id: number;
  title: string;
  titleAr: string;
  url: string;
  category: string;
  duration: string;
  description: string;
  descriptionAr: string;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  joinDate: string;
}

export interface ApiCategory {
  id: number;
  nameAr: string;
  nameEn: string;
  createdAt: string;
}

export interface ApiNotification {
  id: number;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  isActive: boolean;
  sentAt: string;
}

export interface ApiAdminLog {
  id: number;
  adminEmail: string;
  actionAr: string;
  actionEn: string;
  entityType: string;
  entityId: string;
  createdAt: string;
}

export interface ApiAnalytics {
  avgScore: number | null;
  topFailedTopics: { topic: string; count: number }[];
  totalLinksChecked: number;
  usersWithQuiz: number;
  totalUsers: number;
  scoreBuckets: { excellent: number; good: number; average: number; poor: number };
}

export interface ScanCheck {
  label: string;
  labelEn: string;
  passed: boolean;
  detail: string;
  detailEn: string;
}

export interface ScanReport {
  checks: ScanCheck[];
  status: "safe" | "suspicious" | "danger";
  score: number;
  reachable: boolean;
  isRedirected: boolean;
  finalUrl?: string;
}

export interface ScanHistoryItem {
  id: number;
  url: string;
  score: number;
  status: "safe" | "suspicious" | "danger";
  scannedAt: string;
}

export interface ApiReport {
  id: number;
  userId: number;
  userEmail: string;
  fraudType: string;
  url: string;
  description: string;
  attachmentUrl: string;
  isAnonymous: string;
  status: "pending" | "resolved";
  submittedAt: string;
}

export const api = {
  auth: {
    register: (name: string, email: string, password: string) =>
      request<{ token: string; user: ApiUser; activity: ApiActivity }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      }),

    login: (email: string, password: string) =>
      request<{ token: string; user: ApiUser; activity: ApiActivity }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),

    me: () => request<{ user: ApiUser; activity: ApiActivity }>("/auth/me"),
    setToken,
    getToken,
    clearToken,
  },

  videos: {
    list: () => request<ApiVideo[]>("/videos"),
    create: (data: Omit<ApiVideo, "id" | "createdAt">) =>
      request<ApiVideo>("/videos", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Omit<ApiVideo, "id" | "createdAt">>) =>
      request<ApiVideo>(`/videos/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) =>
      request<{ ok: boolean }>(`/videos/${id}`, { method: "DELETE" }),
  },

  activity: {
    get: () => request<ApiActivity>("/activity"),
    update: (data: Partial<ApiActivity & { failedTopics: string[] }>) =>
      request<ApiActivity>("/activity", { method: "PATCH", body: JSON.stringify(data) }),
  },

  notifications: {
    getActive: () => request<ApiNotification[]>("/notifications/active"),
  },

  admin: {
    users: () => request<AdminUser[]>("/admin/users"),
    deleteUser: (id: number) =>
      request<{ ok: boolean }>(`/admin/users/${id}`, { method: "DELETE" }),
    resetPassword: (id: number) =>
      request<{ ok: boolean; newPassword: string; userEmail: string }>(`/admin/users/${id}/reset-password`, { method: "POST" }),
    analytics: () => request<ApiAnalytics>("/admin/analytics"),
    logs: () => request<ApiAdminLog[]>("/admin/logs"),
    categories: {
      list: () => request<ApiCategory[]>("/admin/categories"),
      create: (nameAr: string, nameEn: string) =>
        request<ApiCategory>("/admin/categories", {
          method: "POST",
          body: JSON.stringify({ nameAr, nameEn }),
        }),
      update: (id: number, nameAr: string, nameEn: string) =>
        request<ApiCategory>(`/admin/categories/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ nameAr, nameEn }),
        }),
      delete: (id: number) =>
        request<{ ok: boolean }>(`/admin/categories/${id}`, { method: "DELETE" }),
    },
    notifications: {
      list: () => request<ApiNotification[]>("/admin/notifications"),
      create: (data: { titleAr?: string; titleEn?: string; bodyAr: string; bodyEn?: string }) =>
        request<ApiNotification>("/admin/notifications", { method: "POST", body: JSON.stringify(data) }),
      toggle: (id: number) =>
        request<ApiNotification>(`/admin/notifications/${id}/toggle`, { method: "PATCH" }),
      delete: (id: number) =>
        request<{ ok: boolean }>(`/admin/notifications/${id}`, { method: "DELETE" }),
    },
  },

  scan: {
    check: (url: string) =>
      request<ScanReport>("/scan", { method: "POST", body: JSON.stringify({ url }) }),
    history: () => request<ScanHistoryItem[]>("/scan/history"),
  },

  reports: {
    submit: (data: { fraudType: string; url?: string; description?: string; attachmentUrl?: string; isAnonymous?: boolean }) =>
      request<{ id: number; message: string }>("/reports", { method: "POST", body: JSON.stringify(data) }),
    list: () => request<ApiReport[]>("/reports"),
    resolve: (id: number) =>
      request<ApiReport>(`/reports/${id}/resolve`, { method: "PATCH" }),
    delete: (id: number) =>
      request<{ ok: boolean }>(`/reports/${id}`, { method: "DELETE" }),
  },
};
