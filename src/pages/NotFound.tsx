import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home, LayoutDashboard, Compass } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "页面未找到 · 入行 RuHang";
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="text-center max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary">
            404 · 页面走丢了
          </div>
          <h1 className="font-display font-bold text-7xl md:text-8xl text-gradient-gold leading-none">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground">
            页面未找到
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            抱歉，你访问的页面不存在、已被移动或链接有误。
            <br className="hidden sm:block" />
            你可以返回首页，或直接进入工作台继续之前的项目。
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild className="gradient-gold text-primary-foreground border-0 hover:opacity-90 h-11 px-6">
              <Link to="/">
                <Home className="h-4 w-4 mr-1.5" />
                返回首页
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 px-6">
              <Link to="/dashboard">
                <LayoutDashboard className="h-4 w-4 mr-1.5" />
                进入控制台
              </Link>
            </Button>
            <Button asChild variant="ghost" className="h-11 px-4 text-muted-foreground hover:text-foreground">
              <Link to="/#tracks">
                <Compass className="h-4 w-4 mr-1.5" />
                查看赛道
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
