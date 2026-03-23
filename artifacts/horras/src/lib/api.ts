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
  url: string;
  category: string;
  duration: string;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  joinDate: string;
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

  admin: {
    users: () => request<AdminUser[]>("/admin/users"),
  },
};
