import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

type PublicSupabaseEnv = {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  VITE_SUPABASE_ANON_KEY?: string;
};

export type SupabasePublicConfig = {
  ok: boolean;
  url: string | null;
  key: string | null;
  keySource: "publishable" | "anon" | "missing";
  issues: string[];
};

const FALLBACK_SUPABASE_URL = "https://placeholder.supabase.co";
const FALLBACK_SUPABASE_KEY = "placeholder-public-key";

const normalizeSupabaseUrl = (rawUrl?: string) => {
  const trimmed = rawUrl?.trim() ?? "";
  if (!trimmed) return "";
  return trimmed.replace(/^https:\/\/https:\/\//, "https://");
};

export function resolveSupabasePublicConfig(env: PublicSupabaseEnv): SupabasePublicConfig {
  const issues: string[] = [];
  const url = normalizeSupabaseUrl(env.VITE_SUPABASE_URL);
  const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
  const anonKey = env.VITE_SUPABASE_ANON_KEY?.trim() ?? "";

  let validUrl: string | null = null;
  if (!url) {
    issues.push("缺少 VITE_SUPABASE_URL");
  } else {
    try {
      const parsed = new URL(url);
      if (!/^https?:$/.test(parsed.protocol)) {
        issues.push("VITE_SUPABASE_URL 不是有效的 http(s) 地址");
      } else {
        validUrl = parsed.toString().replace(/\/$/, "");
      }
    } catch {
      issues.push("VITE_SUPABASE_URL 格式无效");
    }
  }

  const key = publishableKey || anonKey || null;
  let keySource: SupabasePublicConfig["keySource"] = "missing";
  if (publishableKey) keySource = "publishable";
  else if (anonKey) keySource = "anon";
  else issues.push("缺少 VITE_SUPABASE_PUBLISHABLE_KEY（或过渡兼容的 VITE_SUPABASE_ANON_KEY）");

  return {
    ok: issues.length === 0 && Boolean(validUrl && key),
    url: validUrl,
    key,
    keySource,
    issues,
  };
}

export const supabasePublicConfig = resolveSupabasePublicConfig(import.meta.env);

export const supabase = createClient<Database>(
  supabasePublicConfig.url ?? FALLBACK_SUPABASE_URL,
  supabasePublicConfig.key ?? FALLBACK_SUPABASE_KEY,
);
