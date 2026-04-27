import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { AuthBrandPanel } from "@/components/marketing/AuthBrandPanel";
import { CheckCircle2, Mail } from "lucide-react";
import logoImg from "@/assets/logo.png";

function mapSignupError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("already registered") || m.includes("already exists")) return "该邮箱已注册，请直接登录";
  if (m.includes("invalid email")) return "邮箱格式不正确";
  if (m.includes("password")) return "密码不符合要求，至少 8 位";
  if (m.includes("rate limit") || m.includes("too many")) return "操作过于频繁，请稍后再试";
  return "注册失败，请稍后重试";
}

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  /** 注册成功（邮件已发出）后展示验证提示界面，禁止直接进入 Dashboard */
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const nav = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/dashboard";
  const { session } = useAuth();

  useEffect(() => {
    document.title = "注册 · 入行 RuHang";
    if (session) nav(redirect, { replace: true });
  }, [session, nav, redirect]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("请填写邮箱");
      return;
    }
    if (password.length < 8) {
      toast.error("密码至少需要 8 位");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        // 邮箱验证完成后回到 redirect 目标
        emailRedirectTo: `${window.location.origin}${redirect}`,
        data: { name },
      },
    });
    setLoading(false);

    if (error) {
      toast.error(mapSignupError(error.message));
      return;
    }

    // Supabase 行为：开启邮箱验证后，data.session 会是 null，data.user 仍存在
    if (data.session) {
      toast.success("欢迎加入入行 🎉");
      nav(redirect);
    } else {
      setPendingEmail(email.trim());
    }
  };

  const resendEmail = async () => {
    if (!pendingEmail) return;
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: pendingEmail,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setLoading(false);
    if (error) {
      toast.error("重发失败", { description: error.message });
    } else {
      toast.success("验证邮件已重新发送，请查收");
    }
  };

  // ------ 已发出验证邮件的成功界面 ------
  if (pendingEmail) {
    return (
      <div className="min-h-screen grid lg:grid-cols-2">
        <AuthBrandPanel />
        <div className="flex items-center justify-center p-8 bg-background">
          <div className="w-full max-w-md space-y-8">
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <img src={logoImg} alt="入行" className="h-8 w-8 rounded-lg object-contain" />
              <span className="text-lg font-display font-semibold text-foreground">入行 RuHang</span>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              <Mail className="h-6 w-6 text-primary" />
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl font-display font-bold text-foreground">查收你的邮箱</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                我们已向 <span className="text-foreground font-medium">{pendingEmail}</span> 发送了一封验证邮件。
                请点击邮件里的链接完成验证，验证完成后会自动登录到控制台。
              </p>
            </div>

            <div className="rounded-xl border border-border/50 bg-secondary/30 p-4 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>邮件可能在 1–2 分钟内送达，请稍等</div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>如果没收到，请检查 <span className="text-foreground">垃圾邮件 / 推广邮件</span> 文件夹</div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>校园邮箱有时会延迟更久，建议使用 Gmail / QQ / 163 邮箱注册</div>
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={resendEmail} disabled={loading} variant="outline" className="w-full h-11">
                {loading ? "发送中..." : "重新发送验证邮件"}
              </Button>
              <Button asChild variant="ghost" className="w-full h-11 text-muted-foreground">
                <Link to="/login">已经验证过了？去登录</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ------ 默认注册表单 ------
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
            <p className="text-sm text-muted-foreground">
              注册即可免费体验「兴通投行 IPO」项目，不需要信用卡。
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm text-foreground">称呼</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11 bg-secondary/50 border-border/50 focus:border-primary" placeholder="例如：李同学" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-foreground">邮箱</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 bg-secondary/50 border-border/50 focus:border-primary" placeholder="yourname@example.com" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-foreground">密码</Label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 bg-secondary/50 border-border/50 focus:border-primary" placeholder="至少 8 位，建议含字母与数字" minLength={8} />
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
            创建账号即代表你同意《用户协议》与《隐私政策》。注册后需要完成邮箱验证才能开始使用。
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
