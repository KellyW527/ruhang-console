import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthBrandPanel } from "@/components/marketing/AuthBrandPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 接入现有逻辑 — Supabase auth.resetPasswordForEmail
    setSent(true);
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

          <div className="space-y-2">
            <h1 className="text-2xl font-display font-bold text-foreground">重置密码</h1>
            <p className="text-sm text-muted-foreground">输入你的邮箱，我们将发送重置链接。</p>
          </div>

          {sent ? (
            <div className="glass-card-gold p-6 text-center space-y-3">
              <p className="text-foreground font-medium">重置链接已发送</p>
              <p className="text-sm text-muted-foreground">请检查你的邮箱 {email}，点击链接重置密码。</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-foreground">邮箱</Label>
                <Input id="email" type="email" placeholder="your@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} className="bg-secondary/50 border-border/50 focus:border-primary" />
              </div>
              <Button type="submit" className="w-full gradient-gold text-primary-foreground border-0 hover:opacity-90 h-11">
                发送重置链接
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
