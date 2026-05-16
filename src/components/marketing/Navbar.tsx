import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import logoImg from "@/assets/logo.png";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { session } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoImg} alt="入行" className="h-8 w-8 rounded-lg object-contain" />
          <span className="text-lg font-display font-semibold text-foreground">入行</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="/#tracks" className="text-sm text-muted-foreground hover:text-foreground transition-colors">赛道</a>
          <a href="/#how" className="text-sm text-muted-foreground hover:text-foreground transition-colors">运作方式</a>
          {!session && (
            <Link to="/demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">产品 Demo</Link>
          )}
          {session && (
            <Link to="/library" className="text-sm text-muted-foreground hover:text-foreground transition-colors">项目库</Link>
          )}
          <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">定价</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <Button asChild className="gradient-gold text-primary-foreground border-0 hover:opacity-90">
              <Link to="/dashboard">进入控制台</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">登录</Link>
              </Button>
              <Button asChild className="gradient-gold text-primary-foreground border-0 hover:opacity-90">
                <Link to="/register">免费注册</Link>
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl p-6 space-y-4">
          <a href="/#tracks" className="block text-sm text-muted-foreground">赛道</a>
          <a href="/#how" className="block text-sm text-muted-foreground">运作方式</a>
          {!session && (
            <Link to="/demo" className="block text-sm text-muted-foreground">产品 Demo</Link>
          )}
          {session && (
            <Link to="/library" className="block text-sm text-muted-foreground">项目库</Link>
          )}
          <Link to="/pricing" className="block text-sm text-muted-foreground">定价</Link>
          <div className="flex gap-3 pt-4">
            {session ? (
              <Button asChild className="gradient-gold text-primary-foreground border-0"><Link to="/dashboard">进入控制台</Link></Button>
            ) : (
              <>
                <Button variant="ghost" asChild><Link to="/login">登录</Link></Button>
                <Button asChild className="gradient-gold text-primary-foreground border-0"><Link to="/register">免费注册</Link></Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
