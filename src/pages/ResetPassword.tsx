import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthBrandPanel } from "@/components/marketing/AuthBrandPanel";
import { ArrowLeft } from "lucide-react";

function mapResetError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("requires an email")) return "请输入注册邮箱";
  if (m.includes("for security purposes") || m.includes("rate limit") || m.includes("too many")) return "操作过于频繁，请稍后再试";
  if (m.includes("invalid email")) return "邮箱格式不正确";
  return "操作失败，请稍后重试";
}

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    document.title = "重置密码 · 入行";
    if (window.location.hash.includes("type=recovery")) {
      setRecoveryMode(true);
    }
  }, []);

  const requestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("请输入注册邮箱");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) toast.error(mapResetError(error.message));
    else {
      setSent(true);
      toast.success("重置链接已发送，请查收邮箱");
    }
  };

  const updatePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("新密码至少需要 8 位");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) toast.error(mapResetError(error.message));
    else toast.success("密码已更新，请重新登录");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <AuthBrandPanel />

      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} />
            返回登录
          </Link>

          {recoveryMode ? (
            <>
              <div className="space-y-2">
                <h1 className="text-2xl font-display font-bold text-foreground">设置新密码</h1>
                <p className="text-sm text-muted-foreground">请设置一个新密码，下次直接用新密码登录。</p>
              </div>
              <form onSubmit={updatePwd} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm text-foreground">新密码</Label>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-11 bg-secondary/50 border-border/50 focus:border-primary" placeholder="至少 8 位" />
                </div>
                <Button type="submit" disabled={loading} className="w-full gradient-gold text-primary-foreground border-0 hover:opacity-90 h-11">
                  {loading ? "更新中..." : "更新密码"}
                </Button>
              </form>
            </>
          ) : sent ? (
            <div className="glass-card-gold p-6 text-center space-y-3">
              <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">✉️</span>
              </div>
              <p className="text-foreground font-medium">重置链接已发送</p>
              <p className="text-sm text-muted-foreground">请检查你的邮箱 <span className="text-foreground">{email}</span>，点击链接重置密码。</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <h1 className="text-2xl font-display font-bold text-foreground">重置密码</h1>
                <p className="text-sm text-muted-foreground">输入你的注册邮箱，我们会发一封包含重置链接的邮件。</p>
              </div>
              <form onSubmit={requestReset} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm text-foreground">邮箱</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 bg-secondary/50 border-border/50 focus:border-primary" placeholder="yourname@example.com" />
                </div>
                <Button type="submit" disabled={loading} className="w-full gradient-gold text-primary-foreground border-0 hover:opacity-90 h-11">
                  {loading ? "发送中..." : "发送重置链接"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
