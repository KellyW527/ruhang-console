import { useState } from "react";
import { Link } from "react-router-dom";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, User, Sliders, Bell, Crown, Shield,
  Download, Trash2, Save
} from "lucide-react";

// TODO: 接入现有逻辑

const sections = [
  { id: "account", label: "账户", icon: User },
  { id: "preferences", label: "模拟偏好", icon: Sliders },
  { id: "notifications", label: "通知", icon: Bell },
  { id: "subscription", label: "订阅与权益", icon: Crown },
  { id: "privacy", label: "数据与隐私", icon: Shield },
];

const Settings = () => {
  const [activeSection, setActiveSection] = useState("account");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/30 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto flex items-center h-14 px-6 gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="font-display font-semibold text-foreground">设置</span>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="flex gap-8">
          {/* Left Nav */}
          <div className="w-56 flex-shrink-0 hidden md:block">
            <nav className="space-y-1 sticky top-24">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors text-left ${
                    activeSection === s.id
                      ? "bg-secondary/80 text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  }`}
                >
                  <s.icon className="h-4 w-4" />
                  {s.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Mobile tabs */}
          <div className="md:hidden flex gap-2 overflow-x-auto pb-4 w-full">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs whitespace-nowrap transition-colors ${
                  activeSection === s.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                <s.icon className="h-3 w-3" />
                {s.label}
              </button>
            ))}
          </div>

          {/* Right Content */}
          <div className="flex-1 space-y-6 min-w-0">
            {activeSection === "account" && (
              <>
                <div className="space-y-1">
                  <h2 className="text-xl font-display font-semibold text-foreground">账户设置</h2>
                  <p className="text-sm text-muted-foreground">管理你的个人信息和登录凭证。</p>
                </div>
                <GlassCard className="p-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xl font-display font-bold text-primary">K</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Kelly Wang</p>
                      <p className="text-sm text-muted-foreground">kelly@example.com</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">姓名</Label>
                      <Input defaultValue="Kelly Wang" className="bg-secondary/50 border-border/30" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">邮箱</Label>
                      <Input defaultValue="kelly@example.com" className="bg-secondary/50 border-border/30" />
                    </div>
                  </div>
                  <Button className="gradient-gold text-primary-foreground border-0 gap-2">
                    <Save className="h-4 w-4" /> 保存更改
                  </Button>
                </GlassCard>
                <GlassCard className="p-6 space-y-4">
                  <h3 className="font-medium text-foreground">修改密码</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">当前密码</Label>
                      <Input type="password" className="bg-secondary/50 border-border/30" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">新密码</Label>
                      <Input type="password" className="bg-secondary/50 border-border/30" />
                    </div>
                  </div>
                  <Button variant="outline" className="border-border/50">更新密码</Button>
                </GlassCard>
              </>
            )}

            {activeSection === "preferences" && (
              <>
                <div className="space-y-1">
                  <h2 className="text-xl font-display font-semibold text-foreground">模拟偏好</h2>
                  <p className="text-sm text-muted-foreground">个性化你的模拟体验。</p>
                </div>
                <GlassCard className="p-6 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm">称呼名称 (Preferred Name)</Label>
                    <Input defaultValue="Kelly" className="bg-secondary/50 border-border/30" />
                    <p className="text-xs text-muted-foreground">模拟中同事和 Leader 将使用此名称称呼你。</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">反馈风格 (Feedback Style)</Label>
                    <Select defaultValue="balanced">
                      <SelectTrigger className="bg-secondary/50 border-border/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="direct">直接型 — 直指问题</SelectItem>
                        <SelectItem value="balanced">平衡型 — 优点+改进</SelectItem>
                        <SelectItem value="encouraging">鼓励型 — 重点肯定</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">回复节奏 (Reply Pacing)</Label>
                    <Select defaultValue="normal">
                      <SelectTrigger className="bg-secondary/50 border-border/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fast">快速 — 立即回复</SelectItem>
                        <SelectItem value="normal">正常 — 模拟真实延迟</SelectItem>
                        <SelectItem value="slow">慢速 — 更多思考时间</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="gradient-gold text-primary-foreground border-0 gap-2">
                    <Save className="h-4 w-4" /> 保存偏好
                  </Button>
                </GlassCard>
              </>
            )}

            {activeSection === "notifications" && (
              <>
                <div className="space-y-1">
                  <h2 className="text-xl font-display font-semibold text-foreground">通知设置</h2>
                  <p className="text-sm text-muted-foreground">控制你接收通知的方式。</p>
                </div>
                <GlassCard className="p-6 space-y-6">
                  {[
                    { label: "任务提醒", desc: "新任务分配或截止时提醒" },
                    { label: "Leader 消息", desc: "Leader 发送新消息时通知" },
                    { label: "模拟完成", desc: "模拟完成后发送报告通知" },
                    { label: "产品更新", desc: "新功能和改进通知" },
                  ].map((n) => (
                    <div key={n.label} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{n.label}</p>
                        <p className="text-xs text-muted-foreground">{n.desc}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </GlassCard>
              </>
            )}

            {activeSection === "subscription" && (
              <>
                <div className="space-y-1">
                  <h2 className="text-xl font-display font-semibold text-foreground">订阅与权益</h2>
                  <p className="text-sm text-muted-foreground">管理你的订阅计划。</p>
                </div>
                <GlassCard variant="gold" className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Crown className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Pro 计划</p>
                        <p className="text-xs text-muted-foreground">全部模拟线 + 高级报告</p>
                      </div>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-primary/30 border">当前计划</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {["全部模拟线", "详细能力报告", "自定义偏好", "优先支持"].map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {f}
                      </div>
                    ))}
                  </div>
                </GlassCard>
                <Button asChild variant="outline" className="border-border/50">
                  <Link to="/pricing">查看所有计划</Link>
                </Button>
              </>
            )}

            {activeSection === "privacy" && (
              <>
                <div className="space-y-1">
                  <h2 className="text-xl font-display font-semibold text-foreground">数据与隐私</h2>
                  <p className="text-sm text-muted-foreground">管理你的数据和隐私设置。</p>
                </div>
                <GlassCard className="p-6 space-y-4">
                  <h3 className="font-medium text-foreground">数据导出</h3>
                  <p className="text-sm text-muted-foreground">导出你的所有模拟数据和能力报告。</p>
                  <Button variant="outline" className="gap-2 border-border/50">
                    <Download className="h-4 w-4" /> 导出数据
                  </Button>
                </GlassCard>
                <GlassCard className="p-6 space-y-4 border-destructive/20">
                  <h3 className="font-medium text-destructive">危险操作</h3>
                  <p className="text-sm text-muted-foreground">删除账户将永久清除所有数据，此操作不可逆。</p>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" /> 删除账户
                  </Button>
                </GlassCard>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
