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
    // Supabase v2 fires onAuthStateChange immediately with INITIAL_SESSION on subscribe,
    // and fires SIGNED_IN on EVERY window focus (via visibilitychange → _recoverAndRefresh).
    // We must avoid unnecessary state updates to prevent React re-renders that could
    // reset child component state.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        // Explicit sign-out: clear everything
        setSession(null);
        setUser(null);
        setProfile(null);
        lastProfileUserId.current = null;
        setLoading(false);
        return;
      }

      if (!session?.user) {
        setLoading(false);
        return;
      }

      // Only update session state if the access token actually changed.
      // Supabase fires SIGNED_IN on every window focus even when nothing changed —
      // setting a new object reference on every focus would cause unnecessary re-renders.
      setSession(prev =>
        prev?.access_token === session.access_token ? prev : session
      );

      // Same for user: only update if the user ID changed (i.e. a different user logged in).
      // TOKEN_REFRESHED / SIGNED_IN on focus produces a new user object with the same id —
      // we keep the previous reference to avoid triggering downstream effects.
      setUser(prev =>
        prev?.id === session.user.id ? prev : session.user
      );

      // Only fetch profile once per unique user
      if (lastProfileUserId.current !== session.user.id) {
        void fetchProfile(session.user.id);
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
