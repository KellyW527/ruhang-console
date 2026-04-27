import { useEffect } from "react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";

const Terms = () => {
  useEffect(() => {
    document.title = "服务条款 · 入行 RuHang";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-24 px-6">
        <article className="container mx-auto max-w-3xl space-y-10">
          <header className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary">
              法律 · 服务条款
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">服务条款</h1>
            <p className="text-sm text-muted-foreground">最后更新：2026 年 4 月 27 日</p>
          </header>

          <section className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              欢迎使用入行 RuHang（以下简称"本平台"）。在你注册账号或以任何方式使用本平台前，请仔细阅读本条款。一旦你点击"创建账号"或继续使用本平台，即视为你已阅读、理解并同意接受本条款的全部内容。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">一、账号</h2>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pl-5">
              <li>你需要使用真实有效的邮箱注册账号，并妥善保管登录凭证。</li>
              <li>账号仅供你本人使用，不得转让、出租或共享给第三方。</li>
              <li>如发现账号存在异常或被盗用，请立即联系我们。</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">二、付费与退款</h2>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pl-5">
              <li>付费通过 Stripe 处理。月度会员将按下单日的次月同一日自动续费，可随时在「设置」里取消。</li>
              <li>取消订阅后，当前周期内的服务仍可继续使用，到期不再扣款。</li>
              <li>单买的项目额度永久有效，不退还。</li>
              <li>如对扣费有疑问，请在购买后 7 天内联系客服处理。</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">三、内容与知识产权</h2>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pl-5">
              <li>本平台提供的项目背景、资料包、模板、标准答案等内容版权归本平台所有，仅授权用户在非商业的学习场景内使用。</li>
              <li>未经书面许可，不得将平台内容公开转售、公开发表、批量分发或用于训练第三方 AI 模型。</li>
              <li>你提交的作业、笔记等内容版权归你本人所有，本平台仅在评分、反馈、安全审计的必要范围内处理。</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">四、模拟性质免责</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              本平台所有项目、公司名称、数据、Offer Letter、上级人物均为教学模拟，与任何真实公司或机构无关，亦不构成任何投资、就业或法律建议。AI 生成的反馈仅供参考，不替代专业人士意见。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">五、禁止行为</h2>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pl-5">
              <li>使用脚本、爬虫、自动化工具批量请求或抓取平台内容。</li>
              <li>上传违法、侵权、含恶意代码或他人隐私信息的内容。</li>
              <li>任何尝试绕过付费机制、解锁未购买内容的行为。</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">六、终止</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              如你违反本条款，本平台有权暂停或终止你的账号，并保留追究法律责任的权利。你也可以随时申请注销账号，注销后相关数据将按隐私政策处理。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">七、条款变更</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              我们可能不定期更新本条款，重大变更会在站内通知。继续使用本平台即视为接受新版本条款。
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
