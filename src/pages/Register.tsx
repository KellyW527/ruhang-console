import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { AuthBrandPanel } from "@/components/marketing/AuthBrandPanel";
import logoImg from "@/assets/logo.png";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    document.title = "注册 · 入行 RuHang";
    if (session) nav("/dashboard", { replace: true });
  }, [session, nav]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { name },
      },
    });
    setLoading(false);
    if (error) {
      toast.error("注册失败", { description: error.message });
    } else {
      toast.success("欢迎加入入行 🎉", { description: "正在为你打开控制台..." });
      nav("/dashboard");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <AuthBrandPanel />

      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <img src={logoImg} alt="入行" className="h-8 w-8 rounded-lg object-contain" />
            <span className="text-lg font-display font-semibold text-foreground">入行 RuHang</span>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary">
              注册 · 永久免费
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">开启你的金融职业旅程</h1>
            <p className="text-sm text-muted-foreground">注册即可免费体验完整 IB IPO 模拟，不需要信用卡。</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm text-foreground">称呼</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11 bg-secondary/50 border-border/50 focus:border-primary" placeholder="例如：李同学" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-foreground">邮箱</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 bg-secondary/50 border-border/50 focus:border-primary" placeholder="yourname@school.edu.cn" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-foreground">密码</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 bg-secondary/50 border-border/50 focus:border-primary" placeholder="至少 6 位" />
            </div>

            <Button type="submit" disabled={loading} className="w-full gradient-gold text-primary-foreground border-0 hover:opacity-90 h-11">
              {loading ? "创建账号中..." : "创建账号"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            已有账号？{" "}
            <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
              直接登录
            </Link>
          </p>

          <p className="text-xs text-muted-foreground text-center">
            创建账号即代表你同意《用户协议》与《隐私政策》。
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
