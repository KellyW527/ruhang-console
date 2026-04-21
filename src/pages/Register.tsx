import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthBrandPanel } from "@/components/marketing/AuthBrandPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 接入现有逻辑 — Supabase auth.signUp
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <AuthBrandPanel />

      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-lg gradient-gold flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">R</span>
            </div>
            <span className="text-lg font-display font-semibold text-foreground">RuHang</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-display font-bold text-foreground">创建账户</h1>
            <p className="text-sm text-muted-foreground">注册 RuHang，开启你的沉浸式训练。</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm text-foreground">姓名</Label>
              <Input id="name" placeholder="你的姓名" value={name} onChange={(e) => setName(e.target.value)}
                className="bg-secondary/50 border-border/50 focus:border-primary" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-foreground">邮箱</Label>
              <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary/50 border-border/50 focus:border-primary" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-foreground">密码</Label>
              <div className="relative">
                <Input id="password" type={showPw ? "text" : "password"} placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)} className="bg-secondary/50 border-border/50 focus:border-primary pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-sm text-foreground">确认密码</Label>
              <Input id="confirm" type="password" placeholder="••••••••" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} className="bg-secondary/50 border-border/50 focus:border-primary" />
            </div>

            <Button type="submit" className="w-full gradient-gold text-primary-foreground border-0 hover:opacity-90 h-11">
              注册
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            已有账户？{" "}
            <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">登录</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
