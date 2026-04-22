import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./lib/auth";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import OfferLetter from "./pages/OfferLetter";
import Workspace from "./pages/Workspace";
import Report from "./pages/Report";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import { supabasePublicConfig } from "./integrations/supabase/client";

const queryClient = new QueryClient();

function ConfigErrorScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="glass-card-gold max-w-lg w-full p-10 space-y-6 text-center">
        <div className="h-14 w-14 mx-auto rounded-2xl gradient-gold flex items-center justify-center">
          <span className="text-xl font-bold text-primary-foreground">R</span>
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground">配置未完成</h1>
        <p className="text-sm text-muted-foreground">
          Supabase 公共环境变量还没配完整，应用无法初始化。
        </p>
        <ul className="text-left space-y-2">
          {supabasePublicConfig.issues.map((issue) => (
            <li key={issue} className="text-sm text-destructive flex items-start gap-2">
              <span className="text-destructive">•</span> {issue}
            </li>
          ))}
        </ul>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>请在 Vercel 中设置 <code className="text-primary">VITE_SUPABASE_URL</code> 和 <code className="text-primary">VITE_SUPABASE_PUBLISHABLE_KEY</code></p>
          <p>设置后需要重新触发 Redeploy。</p>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-xl gradient-gold flex items-center justify-center animate-pulse">
            <span className="text-sm font-bold text-primary-foreground">R</span>
          </div>
          <p className="text-sm text-muted-foreground">加载中…</p>
        </div>
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/simulation/:id/offer" element={<ProtectedRoute><OfferLetter /></ProtectedRoute>} />
      <Route path="/simulation/:id" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
      <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  if (!supabasePublicConfig.ok) {
    return <ConfigErrorScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
