import { Link } from "react-router-dom";
import logoImg from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="border-t border-border/30 bg-background">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={logoImg} alt="入行" className="h-8 w-8 rounded-lg object-contain" />
              <span className="text-lg font-display font-semibold text-foreground">入行 RuHang</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              沉浸式金融职场训练平台，在真实场景中掌握核心能力。
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground font-sans">产品</h4>
            <div className="space-y-2">
              <a href="#tracks" className="block text-sm text-muted-foreground hover:text-primary transition-colors">赛道</a>
              <Link to="/pricing" className="block text-sm text-muted-foreground hover:text-primary transition-colors">定价</Link>
              <a href="#how" className="block text-sm text-muted-foreground hover:text-primary transition-colors">运作方式</a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground font-sans">账户</h4>
            <div className="space-y-2">
              <Link to="/login" className="block text-sm text-muted-foreground hover:text-primary transition-colors">登录</Link>
              <Link to="/register" className="block text-sm text-muted-foreground hover:text-primary transition-colors">注册</Link>
              <Link to="/dashboard" className="block text-sm text-muted-foreground hover:text-primary transition-colors">控制台</Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground font-sans">法律</h4>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">隐私政策</a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">服务条款</a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} RuHang. 模拟内容仅供学习交流。</p>
        </div>
      </div>
    </footer>
  );
}
