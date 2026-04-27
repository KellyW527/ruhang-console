import { Link } from "react-router-dom";
import { Mail, Briefcase, Users, Filter } from "lucide-react";
import logoImg from "@/assets/logo.png";

const PARTNERSHIP_EMAIL = "3165784931@qq.com";
const PARTNERSHIP_SUBJECT = "合作联系";

export function Footer() {
  return (
    <footer className="border-t border-border/30 bg-background">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="space-y-4 lg:col-span-1">
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
              <Link to="/privacy" className="block text-sm text-muted-foreground hover:text-primary transition-colors">隐私政策</Link>
              <Link to="/terms" className="block text-sm text-muted-foreground hover:text-primary transition-colors">服务条款</Link>
            </div>
          </div>

          <div className="space-y-4 md:col-span-2 lg:col-span-1">
            <h4 className="text-sm font-semibold text-foreground font-sans">合作联系</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              面向企业、机构以及在金融行业有经验的前辈，我们开放三类合作：
            </p>
            <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-2">
                <Briefcase className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                <span><span className="text-foreground">定制化项目授权</span> · 共建专属赛道与任务</span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                <span><span className="text-foreground">人才数据访问权限</span> · 经学员授权后获取完成度优秀的学员名单，定向发送面试邀请</span>
              </li>
              <li className="flex items-start gap-2">
                <Filter className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                <span><span className="text-foreground">人才漏斗转化</span> · 完成模拟任务的学生具备更强意向与基础技能，帮企业前置筛选</span>
              </li>
            </ul>
            <a
              href={`mailto:${PARTNERSHIP_EMAIL}?subject=${encodeURIComponent(PARTNERSHIP_SUBJECT)}`}
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:opacity-80 transition-opacity break-all"
            >
              <Mail className="h-3.5 w-3.5 shrink-0" />
              {PARTNERSHIP_EMAIL}
            </a>
            <p className="text-[11px] text-muted-foreground">邮件标题请填"合作联系"</p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} RuHang. 模拟内容仅供学习交流。</p>
        </div>
      </div>
    </footer>
  );
}
