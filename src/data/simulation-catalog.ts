/**
 * Simulation Catalog
 * 集中维护全量项目元数据。Library 页面、Dashboard 推荐区都从这里读取。
 *
 * 新增项目时：
 * 1. 在 db/migrations/ 增加 SQL 迁移（写入 simulations / tasks 表）
 * 2. 在这里追加一条 SIMULATION_CATALOG 记录（用于 UI 展示与赛道筛选）
 *
 * recommended=true 的项目会出现在首页空状态推荐区（每条赛道挑一个代表作）。
 */

export type SimulationTrack = "ibd" | "ma" | "pe" | "er";

export type CatalogEntry = {
  /** 与 simulations.code 一致 */
  code: string;
  title: string;
  company: string;
  role: string;
  /** UI 上显示的中文赛道名（与 simulations.track 字段一致） */
  trackLabel: string;
  /** 用于赛道筛选的内部 key */
  track: SimulationTrack;
  description: string;
  coverEmoji: string;
  durationLabel: string;
  difficulty: "入门" | "进阶" | "高阶";
  isPro: boolean;
  /** 标签：用于卡片底部展示 */
  tags: string[];
  /** 是否在首页空状态推荐区出现（每个赛道至多 1 个） */
  recommended?: boolean;
  /** 证书上展示的项目方文字 logo（后续可换成真实 PNG/SVG） */
  companyLogoText: string;
  /** 证书上展示的"在本项目中你证明了你掌握了"技能列表 */
  skills: string[];
  /** 证书签名人姓名 */
  signoffName: string;
  /** 证书签名人头衔 */
  signoffTitle: string;
};

export const SIMULATION_TRACKS: Array<{
  key: SimulationTrack | "all";
  label: string;
  emoji: string;
  desc: string;
}> = [
  { key: "all", label: "全部", emoji: "✨", desc: "入行上线的全部沉浸式项目" },
  { key: "ibd", label: "IBD 投行", emoji: "💼", desc: "IPO、再融资、债券承销" },
  { key: "ma", label: "M&A 并购", emoji: "🤝", desc: "买方/卖方并购全流程" },
  { key: "pe", label: "PE 私募股权", emoji: "📊", desc: "尽调、估值、投决" },
  { key: "er", label: "ER 行业研究", emoji: "📈", desc: "卖方研究、行业框架" },
];

export const SIMULATION_CATALOG: CatalogEntry[] = [
  {
    code: "ibd-ipo",
    title: "兴通投行 · 京东物流 IPO",
    company: "兴通投行",
    role: "投行 IPO 分析师",
    trackLabel: "IBD 投行",
    track: "ibd",
    description:
      "加入兴通投行 IPO 团队，跟随 VP 推进京东物流 H 股上市：从行业框架、可比公司估值到工作底稿与路演材料，体验真实的投行节奏。",
    coverEmoji: "💼",
    durationLabel: "约 2 周",
    difficulty: "入门",
    isPro: false,
    tags: ["IPO", "估值", "工作底稿", "适合新手"],
    recommended: true,
    companyLogoText: "兴通投行",
    skills: ["可比公司估值", "工作底稿撰写", "行业研究框架", "路演材料制作"],
    signoffName: "周恺",
    signoffTitle: "兴通投行 IPO 项目组 VP",
  },
  {
    code: "ma-buyside",
    title: "华兴并购 · 京北数码买方组",
    company: "华兴并购",
    role: "买方并购分析师",
    trackLabel: "M&A 并购",
    track: "ma",
    description:
      "加入华兴并购 M&A 组，跟随 VP 沈承宇为客户鸿华百货完成京北数码 100% 收购的估值与材料：从 Target Profile、五年利润表预测、Trading Comps 到收购后战略备忘。",
    coverEmoji: "🤝",
    durationLabel: "约 2-3 周",
    difficulty: "进阶",
    isPro: true,
    tags: ["买方并购", "DCF", "Trading Comps", "战略备忘"],
    recommended: true,
    companyLogoText: "华兴并购",
    skills: ["Target Profile 撰写", "DCF 估值建模", "Trading Comps 分析", "并购整合战略"],
    signoffName: "沈承宇",
    signoffTitle: "华兴并购 M&A 组 VP",
  },
  {
    code: "pe-deal",
    title: "时晔资本 · 跨境消费品 PE",
    company: "时晔资本",
    role: "PE 投资分析师",
    trackLabel: "PE 私募股权",
    track: "pe",
    description:
      "加入时晔资本投资团队，跟随合伙人完成一家跨境消费品牌的尽调与估值：从公司画像、行业空间、LBO 模型到投决备忘，体验真实的 PE deal 节奏。",
    coverEmoji: "📊",
    durationLabel: "约 2 周",
    difficulty: "进阶",
    isPro: true,
    tags: ["尽调", "LBO", "投决", "消费"],
    recommended: true,
    companyLogoText: "时晔资本",
    skills: ["商业尽调", "LBO 模型搭建", "投资备忘录撰写", "投委会答辩"],
    signoffName: "林骁",
    signoffTitle: "时晔资本 投资合伙人",
  },
  {
    code: "er-saas",
    title: "卖方研究 · SaaS 行业框架",
    company: "卖方研究所",
    role: "行业研究助理",
    trackLabel: "ER 行业研究",
    track: "er",
    description:
      "加入卖方研究团队，输出一份 SaaS 行业研究框架：行业地图、关键指标、龙头公司画像、估值锚定与投资观点。体验真实卖方研究节奏。",
    coverEmoji: "📈",
    durationLabel: "约 1-2 周",
    difficulty: "入门",
    isPro: false,
    tags: ["行业研究", "SaaS", "估值锚定", "适合新手"],
    companyLogoText: "明信证券研究所",
    skills: ["行业地图绘制", "关键指标分析", "公司画像撰写", "投资观点输出"],
    signoffName: "高航",
    signoffTitle: "明信证券研究所 SaaS 首席",
  },
];

/** 从 catalog 取一条赛道一个推荐项目（首页空状态用） */
export function getRecommendedProjects(): CatalogEntry[] {
  return SIMULATION_CATALOG.filter((entry) => entry.recommended);
}

export function getCatalogEntryByCode(code?: string | null): CatalogEntry | undefined {
  if (!code) return undefined;
  return SIMULATION_CATALOG.find((entry) => entry.code === code);
}
