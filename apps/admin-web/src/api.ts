import Constants from "expo-constants";

export type Session = {
  token: string;
  user: { id: string; role: "member" | "admin"; name: string; avatar?: string };
};

export type Signup = {
  memberId: string;
  name: string;
  initial: string;
  number: string;
  avatar: string;
  signedAt: string;
};

export type Match = {
  id: string;
  title: string;
  status: "upcoming" | "live" | "completed";
  startAt: string;
  endAt: string;
  signupDeadline: string;
  location: string;
  maxPlayers: number;
  description: string;
  tags?: string[];
  coverUrl: string;
  images: string[];
  signups: Signup[];
  registeredCount: number;
  isSignedUp: boolean;
  result: MatchResult;
};

export type MatchResult = {
  published: boolean;
  updatedAt?: string;
  periodScores?: Array<{ label: string; quarters: number[]; total: number }>;
  games?: Array<{ round: string; teamA: string; scoreA: number; teamB: string; scoreB: number }>;
  champion?: string;
  teams: Array<{
    id: string;
    name: string;
    score: number;
    players: Array<{ memberId: string; name?: string; avatar?: string; number?: string; points: number; assists: number; rebounds: number }>;
  }>;
};

export type Member = {
  id: string;
  name: string;
  number: string;
  position: string;
  avatar: string;
  phone?: string;
  bio?: string;
  attendance?: number;
  attendanceStats?: { month: number; season: number; total: number };
  games?: number;
  rank?: number;
  balance?: number;
  scoreAvg?: number;
  reboundAvg?: number;
  honors?: number;
  videoUrl?: string;
};

const runtimeApi = (globalThis as typeof globalThis & { EXPO_PUBLIC_API_BASE?: string }).EXPO_PUBLIC_API_BASE;
const appConfigApi = Constants.expoConfig?.extra?.apiBase as string | undefined;
const apiBase = (runtimeApi || appConfigApi || process.env.EXPO_PUBLIC_API_BASE || (
  typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "http://localhost:1488/api"
    : "https://api.cbf1488.com/api"
)).replace(/\/$/, "");
const apiOrigin = apiBase.replace(/\/api\/?$/, "");

export function assetUrl(value?: string): string {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/static/")) return value;
  return `${apiOrigin}${value.startsWith("/") ? "" : "/"}${value}`;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getSession()?.token;
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.ok === false) {
    throw new Error(body.error?.message || `请求失败（${response.status}）`);
  }
  return body.data as T;
}

const SESSION_KEY = "cbf1488.session";

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(SESSION_KEY);
    return value ? JSON.parse(value) as Session : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session): void {
  if (typeof window !== "undefined") window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(SESSION_KEY);
}

export const api = {
  baseUrl: apiBase,
  currentUser: () => request<Session["user"]>("/auth/me"),
  matches: (status = "all") => request<Match[]>(`/matches?status=${encodeURIComponent(status)}`),
  match: (id: string) => request<Match>(`/matches/${encodeURIComponent(id)}`),
  results: (id: string) => request<MatchResult>(`/matches/${encodeURIComponent(id)}/results`),
  signup: (id: string) => request<Match>(`/matches/${encodeURIComponent(id)}/signups`, { method: "POST", body: "{}" }),
  cancelSignup: (id: string) => request<Match>(`/matches/${encodeURIComponent(id)}/signups/me`, { method: "DELETE" }),
  leaderboard: (period = "season") => request<{ period: string; completedMatches: number; members: Member[] }>(`/leaderboard?period=${encodeURIComponent(period)}`),
  members: (keyword = "") => request<Member[]>(`/members?q=${encodeURIComponent(keyword)}`),
  member: (id: string) => request<Member & { upcomingMatches: Match[]; completedMatches: Match[] }>(`/members/${encodeURIComponent(id)}`),
  profile: () => request<{ member: Member; attendance: number; balance: number; honors: number }>("/me/profile"),
  dashboard: () => request<{ memberCount: number; upcomingMatches: number; liveMatches: number; recentMatches: Match[] }>("/admin/dashboard"),
  charges: () => request<Array<{ id: string; amount: number; date: string; note: string; memberName: string }>>("/admin/charges"),
  createMatch: (data: Record<string, unknown>) => request<Match>("/admin/matches", { method: "POST", body: JSON.stringify(data) }),
  uploadMedia: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const token = getSession()?.token;
    const response = await fetch(`${apiBase}/admin/uploads`, {
      method: "POST",
      body: form,
      headers: token ? { authorization: `Bearer ${token}` } : {},
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) throw new Error(body.error?.message || "文件上传失败");
    return body.data as { url: string; type: "image" | "video"; size: number };
  },
  demoLogin: (role: "member" | "admin") => request<Session>("/auth/dev-login", { method: "POST", body: JSON.stringify({ role }) }),
};
