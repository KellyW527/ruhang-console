export type MedalDefinition = {
  id: string;
  name: string;
  description: string;
  condition: string;
  rarity: "普通" | "稀有" | "史诗";
};

export const medalDefinitions: MedalDefinition[] = [
  { id: "entry", name: "初入职场", description: "完成第一个任务", condition: "完成任意模拟线的第一个任务", rarity: "普通" },
  { id: "ontime", name: "准时交付", description: "按时提交 5 次", condition: "累计 5 次按时合格提交", rarity: "普通" },
  { id: "working-paper", name: "底稿达人", description: "IB 财务分析高分", condition: "IB IPO 线财务任务得分 ≥ 85", rarity: "稀有" },
  { id: "first-memo", name: "首份 Memo", description: "PE 投资备忘录完成", condition: "PE 线完成投资备忘录任务", rarity: "稀有" },
  { id: "sector-insight", name: "赛道洞察", description: "行研高分完成", condition: "行研线任意任务得分 ≥ 90", rarity: "稀有" },
  { id: "three-angles", name: "三线并进", description: "参与全部赛道", condition: "在三条赛道中均完成至少一个任务", rarity: "史诗" },
  { id: "self-aware", name: "自我认知", description: "完成 8 次自评", condition: "累计提交 8 次自我评估", rarity: "稀有" },
  { id: "full-close", name: "全线通关", description: "完成一条完整模拟", condition: "任意模拟线全部任务完成", rarity: "史诗" },
];

export type FaqEntry = {
  question: string;
  answer: string;
};

export const hrFaqEntries: FaqEntry[] = [
  {
    question: "我的企业邮箱什么时候能开通？格式是什么？",
    answer: "入职当天 IT 部门会发短信通知，邮箱格式统一为姓名拼音首字母 + 工号@公司域名。如果入职 24 小时内还没收到通知，直接在这个群里 @我，我帮你催。初始密码在短信里，第一次登录记得改掉，否则会锁定。",
  },
  {
    question: "项目模板和公司资料在哪里找？",
    answer: "公司资料统一放在内部知识库（飞书文档-公共资料库-模板区），路径是：全员可见 → 投研工具箱 → 按岗位分类。第一次用建议先把模板复制到自己的文件夹，不要直接在原始文件上改。",
  },
];

export const buildHrFaqCard = () =>
  `[FAQ]\n${hrFaqEntries
    .map((entry) => `Q: ${entry.question}\nA: ${entry.answer}`)
    .join("\n\n")}`;

const simulationAliasMap: Record<string, string> = {
  "ibd-ipo": "ibd-ipo",
  "ib-huarui": "ibd-ipo",
  "pe-growth": "pe-growth",
  "pe-zhiyuan": "pe-growth",
  "er-new-energy": "er-new-energy",
  "er-mingxin": "er-new-energy",
};

export const normalizeSimulationCode = (code?: string | null) =>
  (code ? simulationAliasMap[code] : undefined) ?? "ibd-ipo";

export const groupWelcomeBySimulation: Record<string, string> = {
  "ibd-ipo": "【华锐证券投资银行部｜鼎盛建材 IPO 项目组】\n欢迎加入项目组。",
  "pe-growth": "【知远资本｜拾野生活项目组】\n你好，欢迎进组。",
  "er-new-energy": "【明澈研究所｜企业服务组｜新成员同步】\n欢迎，先了解一下组里的工作节奏。",
};

export type StarterKitAsset = {
  id: string;
  title: string;
  description: string;
  filename: string;
  sizeLabel: string;
  url: string;
};

export const starterKitAssetsBySimulation: Record<string, StarterKitAsset[]> = {
  "ibd-ipo": [
    { id: "ibd-brief", title: "项目背景简报", description: "30 分钟建立全局观", filename: "鼎盛建材_项目背景简报_v1.0.html", sizeLabel: "HTML · 6页", url: "/starter-kits/ibd/dingsheng-project-brief.html" },
    { id: "ibd-financial-summary", title: "三年财务摘要表", description: "2021–2023 核心科目趋势表", filename: "鼎盛建材_三年财务摘要表_v1.0.csv", sizeLabel: "CSV · 3年数据", url: "/starter-kits/ibd/dingsheng-financial-summary.csv" },
  ],
  "pe-growth": [
    { id: "pe-company-brief", title: "公司基本情况简报", description: "公司沿革、融资历史、团队背景", filename: "拾野生活_公司基本情况简报_v1.0.html", sizeLabel: "HTML · 5页", url: "/starter-kits/pe/shiye-company-brief.html" },
  ],
  "er-new-energy": [
    { id: "er-framework", title: "赛道研究框架", description: "企业服务 SaaS 研究背景", filename: "企业服务SaaS赛道研究框架_初稿_v1.0.html", sizeLabel: "HTML · 研究大纲", url: "/starter-kits/er/saas-research-framework.html" },
  ],
};

export type PhoneScript = {
  title: string;
  taskDirection: string;
  style: string;
  intro: string;
  lines: string[];
  followup: string;
};

export const phoneScriptsBySimulation: Record<string, PhoneScript[]> = {};

export type TaskReferenceContent = {
  standardAnswer: string;
  analysis: string;
};

export const taskReferenceContentBySimulation: Record<string, Partial<Record<number, TaskReferenceContent>>> = {};
