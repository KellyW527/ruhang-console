import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { supabase } from "../integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type ProfilePreferences = {
  preferred_name?: string | null;
  feedback_style?: "strict" | "balanced" | "encouraging" | null;
  reply_pacing?: "realistic" | "efficient" | null;
  show_beginner_hints?: boolean | null;
  show_starter_kit_guidance?: boolean | null;
};

type ProfileNotifications = {
  notify_new_task?: boolean | null;
  notify_leader_reply?: boolean | null;
  notify_email?: boolean | null;
  notify_badges?: boolean | null;
  notify_browser?: boolean | null;
};

export interface Profile {
  id: string;
  display_name?: string | null;
  name?: string | null;
  avatar_url?: string | null;
  chinese_name?: string | null;
  english_name?: string | null;
  school?: string | null;
  major?: string | null;
  grade?: string | null;
  track?: string | null;
  plan?: string | null;
  preferences?: ProfilePreferences | null;
  notifications?: ProfileNotifications | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  // Track last fetched userId to avoid redundant profile fetches
  const lastProfileUserId = useRef<string | null>(null);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile((data as Profile | null) ?? null);
    lastProfileUserId.current = userId;
  };

  useEffect(() => {
    // Use onAuthStateChange as the single source of truth.
    // It fires immediately with INITIAL_SESSION on subscribe (Supabase JS v2),
    // so we don't need a separate getSession() call which would cause double state updates.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);

      // Only clear user on explicit sign-out, never during token refresh.
      // This prevents ProtectedRoute from briefly seeing user=null and redirecting to /login.
      if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        lastProfileUserId.current = null;
      } else if (session?.user) {
        setUser(session.user);
        // Avoid redundant profile fetches on every TOKEN_REFRESHED if user hasn't changed.
        if (lastProfileUserId.current !== session.user.id) {
          void fetchProfile(session.user.id);
        }
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (!user?.id) return;
    await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
