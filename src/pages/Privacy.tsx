import { useEffect } from "react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";

const Privacy = () => {
  useEffect(() => {
    document.title = "隐私政策 · 入行";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-24 px-6">
        <article className="container mx-auto max-w-3xl space-y-10">
          <header className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary">
              法律 · 隐私
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">隐私政策</h1>
            <p className="text-sm text-muted-foreground">最后更新：2026 年 4 月 27 日</p>
          </header>

          <section className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              入行（入行，以下简称"本平台"）尊重并保护所有用户的隐私。本政策说明我们在你使用本平台时收集、使用、存储与共享个人信息的方式，请你在使用前仔细阅读。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">一、我们收集的信息</h2>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pl-5">
              <li>账号信息：邮箱、昵称、密码（加密存储）。</li>
              <li>使用数据：访问的页面、点击的按钮、完成的任务、提交的作业内容、AI 反馈交互记录。</li>
              <li>支付信息：仅由 Stripe 处理，本平台不会存储你的信用卡卡号或 CVV。</li>
              <li>设备信息：浏览器类型、操作系统、IP 地址，用于安全防护与故障排查。</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">二、我们如何使用信息</h2>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pl-5">
              <li>提供与维护服务，包括账号管理、任务派发、AI 反馈、能力报告与证书生成。</li>
              <li>改进产品体验、定位 Bug、防范滥用与欺诈。</li>
              <li>在你授权的范围内，向你发送服务通知与产品更新。</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">三、第三方服务</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              本平台依赖以下第三方服务运行，相应数据将按其各自的隐私政策处理：
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pl-5">
              <li>Supabase：账号、数据库与文件存储。</li>
              <li>Stripe：支付处理。</li>
              <li>AI 服务提供商：用于生成上级反馈与对照标准答案。</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">四、Cookie 与本地存储</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              我们使用必要的 Cookie 与浏览器本地存储维持登录状态、保存界面偏好。你可以在浏览器中清除这些数据，但可能影响登录与体验。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">五、你的权利</h2>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pl-5">
              <li>随时在「设置」里查看并修改账号资料。</li>
              <li>申请导出或删除你的个人数据，请联系下方邮箱。</li>
              <li>取消订阅会员，后续周期不再续费。</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">六、联系我们</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              如对本政策有任何疑问或希望行使上述权利，请发送邮件至{" "}
              <a href="mailto:3165784931@qq.com" className="text-primary hover:underline">
                3165784931@qq.com
              </a>
              。
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
