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

export type SimulationTrack = "ibd" | "ma" | "pe" | "er" | "vcfa";

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
  { key: "vcfa", label: "VC / FA", emoji: "🚀", desc: "早期投资、融资顾问、商业计划书" },
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
    code: "pe-growth",
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
    code: "er-new-energy",
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
  {
    code: "ibd-robotics-ipo",
    title: "国曜投行 · 星河机器人科创板 IPO",
    company: "国曜投行",
    role: "投行股权融资部实习生",
    trackLabel: "IBD 投行",
    track: "ibd",
    description:
      "参与星河机器人科创板 IPO 项目，完成智能制造行业速览、公司业务拆解、募投项目分析和投资亮点与风险提炼。",
    coverEmoji: "🤖",
    durationLabel: "约 2-3 周",
    difficulty: "进阶",
    isPro: false,
    tags: ["科创板", "硬科技", "募投分析"],
    companyLogoText: "国曜投行",
    skills: ["行业速览", "业务拆解", "募投分析", "风险因素撰写"],
    signoffName: "顾庭远",
    signoffTitle: "国曜投行 股权融资部 VP",
  },
  {
    code: "ma-semiconductor",
    title: "海岳并购 · 蓝芯半导体收购案",
    company: "海岳并购",
    role: "并购分析实习生",
    trackLabel: "M&A 并购",
    track: "ma",
    description:
      "协助买方评估蓝芯半导体收购案：从买方动因、标的竞争力、可比交易估值到协同风险，体验产业并购分析流程。",
    coverEmoji: "💾",
    durationLabel: "约 2-3 周",
    difficulty: "高阶",
    isPro: false,
    tags: ["产业并购", "半导体", "可比交易"],
    companyLogoText: "海岳并购",
    skills: ["并购动因分析", "标的竞争力判断", "可比交易估值", "交易风险识别"],
    signoffName: "陆衡",
    signoffTitle: "海岳并购 产业并购组 VP",
  },
  {
    code: "pe-dental-chain",
    title: "启明资本 · 连锁口腔医疗 PE 投资",
    company: "启明资本",
    role: "医疗消费组投资分析实习生",
    trackLabel: "PE 私募股权",
    track: "pe",
    description:
      "评估悦齿医疗连锁口腔投资机会：从行业需求、门店模型、投资亮点风险到退出路径，训练 PE 初筛 Memo 能力。",
    coverEmoji: "🦷",
    durationLabel: "约 2-3 周",
    difficulty: "进阶",
    isPro: true,
    tags: ["消费医疗", "门店模型", "投资 Memo"],
    companyLogoText: "启明资本",
    skills: ["行业研究", "单店模型分析", "投资亮点提炼", "退出路径判断"],
    signoffName: "许知遥",
    signoffTitle: "启明资本 医疗消费组 VP",
  },
  {
    code: "er-cxo",
    title: "明信证券 · 创新药 CXO 行业深度",
    company: "明信证券",
    role: "医药组研究实习生",
    trackLabel: "ER 行业研究",
    track: "er",
    description:
      "协助医药组搭建 CXO 行业深度框架，完成产业链拆解、公司对比、估值修复逻辑和核心观点输出。",
    coverEmoji: "💊",
    durationLabel: "约 2-3 周",
    difficulty: "进阶",
    isPro: true,
    tags: ["医药研究", "CXO", "估值修复"],
    companyLogoText: "明信证券",
    skills: ["行业框架搭建", "可比公司分析", "估值周期复盘", "研究观点表达"],
    signoffName: "陈知行",
    signoffTitle: "明信证券 医药行业分析师",
  },
  {
    code: "vc-ai-interview",
    title: "辰星创投 · AI 面试助手种子轮投资",
    company: "辰星创投",
    role: "早期投资分析实习生",
    trackLabel: "VC / FA",
    track: "vcfa",
    description:
      "对 AI 面试助手项目做种子轮初筛，判断市场需求、产品壁垒、商业模式和投资建议，训练 VC 早期项目判断。",
    coverEmoji: "🎤",
    durationLabel: "约 1-2 周",
    difficulty: "入门",
    isPro: true,
    tags: ["VC", "AI 应用", "种子轮"],
    companyLogoText: "辰星创投",
    skills: ["市场空间判断", "竞品分析", "商业模式评估", "投资 Memo 写作"],
    signoffName: "周未然",
    signoffTitle: "辰星创投 投资经理",
  },
  {
    code: "fa-drone-series-a",
    title: "和桥资本 · 低空经济无人机 A 轮融资 FA",
    company: "和桥资本",
    role: "FA 分析实习生",
    trackLabel: "VC / FA",
    track: "vcfa",
    description:
      "协助云巡科技 A 轮融资，梳理低空经济市场、融资亮点、投资人名单和 BP 核心页面，体验 FA 项目材料节奏。",
    coverEmoji: "🚁",
    durationLabel: "约 2-3 周",
    difficulty: "进阶",
    isPro: true,
    tags: ["FA", "低空经济", "BP 设计"],
    companyLogoText: "和桥资本",
    skills: ["融资故事搭建", "投资人匹配", "BP 摘要设计", "项目亮点包装"],
    signoffName: "韩予乔",
    signoffTitle: "和桥资本 FA 项目经理",
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
