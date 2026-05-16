import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { AuthBrandPanel } from "@/components/marketing/AuthBrandPanel";
import { Eye, EyeOff } from "lucide-react";
import logoImg from "@/assets/logo.png";

/** 把 Supabase 英文错误映射成中文友好提示 */
function mapLoginError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials")) return "邮箱或密码错误，请检查后重试";
  if (m.includes("email not confirmed")) return "请先完成邮箱验证后再登录（查收注册邮件）";
  if (m.includes("too many requests") || m.includes("rate limit")) return "尝试次数过多，请稍后再试";
  if (m.includes("user not found")) return "该邮箱尚未注册，请先创建账号";
  if (m.includes("network")) return "网络异常，请检查后重试";
  return "登录失败，请稍后重试";
}

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/dashboard";
  const { session } = useAuth();

  useEffect(() => {
    document.title = "登录 · 入行";
    if (session) nav(redirect, { replace: true });
  }, [session, nav, redirect]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("请填写邮箱和密码");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      toast.error(mapLoginError(error.message));
    } else {
      toast.success("欢迎回来 👋");
      nav(redirect);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <AuthBrandPanel />

      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
             <img src={logoImg} alt="入行" className="h-8 w-8 rounded-lg object-contain" />
            <span className="text-lg font-display font-semibold text-foreground">入行</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-display font-bold text-foreground">欢迎回来</h1>
            <p className="text-sm text-muted-foreground">用注册时的邮箱和密码登录。</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-foreground">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="yourname@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-secondary/50 border-border/50 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm text-foreground">密码</Label>
                <Link to="/reset-password" className="text-xs text-primary hover:text-primary/80 transition-colors">
                  忘记密码？
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 bg-secondary/50 border-border/50 focus:border-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPw ? "隐藏密码" : "显示密码"}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full gradient-gold text-primary-foreground border-0 hover:opacity-90 h-11">
              {loading ? "登录中..." : "登录"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            新来这里？{" "}
            <Link to={`/register${redirect !== "/dashboard" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`} className="text-primary hover:text-primary/80 font-medium transition-colors">
              创建账号 →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
