/**
 * Demo 页用的纯本地脚本数据。
 * 不接 Supabase、不依赖 useAuth，可在未登录状态下播放一段"模拟工作日"体验。
 */

export type DemoMessage = {
  id: string;
  /** "leader" = AI 上级；"me" = 演示用户 */
  from: "leader" | "me" | "system";
  text: string;
  /** 距上一条出现的延迟（毫秒）。第一条以挂载时刻为基准 */
  delay: number;
  /** 可选：附带任务卡 */
  taskCard?: { title: string; deadline: string };
};

export const DEMO_LEADER = {
  name: "周恺",
  title: "VP · 投行 IBD 组",
  avatar: "周",
};

export const DEMO_USER = {
  name: "李同学",
  role: "Analyst Intern",
};

export const DEMO_PROJECT = {
  company: "兴通投行",
  title: "兴通投行 · 科创板 IPO 项目组",
  client: "云岚科技（HR SaaS）",
  day: "Day 1 / 共 6 天",
};

export const DEMO_MESSAGES: DemoMessage[] = [
  {
    id: "m1",
    from: "leader",
    text: "小李，刚拿到一个项目意向：杭州一家做 HR SaaS 的公司，叫\"云岚科技\"。",
    delay: 800,
  },
  {
    id: "m2",
    from: "leader",
    text: "今晚 9 点前给我一份「企业级 SaaS」的行业研究框架，要能放进立项会用。",
    delay: 1800,
  },
  {
    id: "m3",
    from: "leader",
    text: "重点：市场规模拆分、关键指标（ARR/NDR/Magic Number）、竞争格局、近 3 年并购退出案例。",
    delay: 2200,
    taskCard: {
      title: "行业研究框架：企业级 SaaS 赛道",
      deadline: "今晚 21:00 前",
    },
  },
  {
    id: "m4",
    from: "me",
    text: "收到周恺，今晚之前给您。请问可以先用 starter kit 里的财务包当 benchmark 吗？",
    delay: 2600,
  },
  {
    id: "m5",
    from: "leader",
    text: "可以，starter kit 已经放在右侧任务面板，下载下来直接用。有问题随时 @ 我。",
    delay: 1700,
  },
];

export const DEMO_TASKS = [
  { id: "t1", name: "行业研究框架", status: "doing" as const, kit: "/starter-kits/ibd/xingtong-project-brief.html" },
  { id: "t2", name: "财务尽调清单", status: "locked" as const },
  { id: "t3", name: "DCF / 可比公司估值", status: "locked" as const },
  { id: "t4", name: "招股书撰写", status: "locked" as const },
  { id: "t5", name: "问询函回复", status: "locked" as const },
];

export const DEMO_EMAIL = {
  from: "周恺 <zhouk@xingtong-ib.com>",
  to: "你 <intern@ruhang.demo>",
  subject: "[立项] 云岚科技 SaaS 行业研究框架 · 今晚 21:00 截止",
  preview: "小李，附件是 starter kit，请按 IBD 标准模板撰写。重点关注 ARR/NDR/Magic Number 等指标…",
  time: "刚刚",
};

export const DEMO_AI_FEEDBACK = {
  scoreOverall: 82,
  dimensions: [
    { name: "信息完整度", score: 18, max: 20 },
    { name: "结构与逻辑", score: 17, max: 20 },
    { name: "数据准确性", score: 14, max: 20 },
    { name: "行业洞察", score: 17, max: 20 },
    { name: "表达专业度", score: 16, max: 20 },
  ],
  highlights: [
    "市场规模拆分清晰，按客户类型 / ARPU / 渗透率三维度搭建",
    "关键指标（ARR、NDR、Magic Number）解释到位，举了 Salesforce 与金蝶两个对照",
  ],
  improvements: [
    "近 3 年并购退出案例只列了美股，A 股科创板的 SaaS 公司案例需补充",
    "建议在行业框架后加一节「为什么是云岚」，把行业逻辑落到标的本身",
  ],
};
