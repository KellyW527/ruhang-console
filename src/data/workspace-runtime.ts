type LeaderProfile = {
  name: string;
  title: string;
  roleLabel: string;
  avatarEmoji: string;
  email: string;
  greeting: string;
  tonePrompt: string;
  completionNote: string;
};

type SubmissionKind = "email" | "chat_attachment";
type SubmissionRecord = {
  kind: "email" | "file" | "image";
  filename?: string;
  subject?: string;
  fileUrl?: string;
};

type MaterialPacket = {
  id: string;
  title: string;
  description: string;
  filename: string;
  content: string;
};

type TaskRuntime = {
  expectedSubmissionKind: SubmissionKind;
  allowedExtensions: string[];
  minimumRequirement: string;
  retryTemplate: string;
  passTemplate: string;
  groupNudge: string;
  materials: MaterialPacket[];
};

type SimulationRuntime = {
  leader: LeaderProfile;
  groupName: string;
  groupRoleLabel: string;
  hrName: string;
  hrRoleLabel: string;
  hrEmail: string;
  hrFaq: string;
  groupReply: string;
  completionLetterTitle: string;
  tasks: TaskRuntime[];
};

import {
  groupWelcomeBySimulation,
  normalizeSimulationCode,
  phoneScriptsBySimulation,
  starterKitAssetsBySimulation,
  taskReferenceContentBySimulation,
} from "@/data/immersive-content";

export type ConversationKind = "leader" | "group" | "hr";

export type SubmissionEvaluation = {
  submissionType: SubmissionKind | "image" | "unknown";
  quality: "pass" | "retry";
  score: number | null;
  summary: string;
  detailMarkdown: string;
  leaderMessage: string;
};

const toDataUrl = (content: string) =>
  `data:text/markdown;charset=utf-8,${encodeURIComponent(content)}`;

const extOf = (value?: string) => {
  if (!value) return "";
  const cleanValue = value.split("?")[0].split("#")[0];
  const lastDot = cleanValue.lastIndexOf(".");
  return lastDot >= 0 ? cleanValue.slice(lastDot + 1).toLowerCase() : "";
};

const makeRuntimeTask = (
  _id: string,
  title: string,
  minimumRequirement: string,
  groupNudge: string,
  _materialTitle: string,
  _materialContent: string,
): TaskRuntime => ({
  expectedSubmissionKind: "chat_attachment",
  allowedExtensions: ["xlsx", "csv", "docx", "pdf", "md", "pptx"],
  minimumRequirement,
  retryTemplate: `这次还不能按「${title}」完成来收。请提交一份结构化附件，至少覆盖任务要求里的核心判断、关键数据和结论。`,
  passTemplate: `这版「${title}」已经能进入复盘。下一轮重点把数据来源、判断口径和风险边界再压实。`,
  groupNudge,
  materials: [],
});

const runtimeMap = {
  "ibd-ipo": {
    leader: {
      name: "周恺",
      title: "华锐证券投行部 VP",
      roleLabel: "VP · 科创板项目负责人",
      avatarEmoji: "👨‍💼",
      email: "zhoukai@huarui.com",
      greeting: "欢迎加入华锐证券。先跟着我把项目跑顺，有问题直接说。",
      tonePrompt: "说话利落、带投行节奏，强调结构、判断和可执行性。",
      completionNote: "这条线你已经能独立接住投行基础活了。继续练判断力和材料节奏，会很快从“能做”到“能扛”。",
    },
    groupName: "华锐证券 IPO 项目组",
    groupRoleLabel: "群聊 · 尽调 / 模板 / 共享盘",
    hrName: "华锐证券 HR",
    hrRoleLabel: "HR · 入职与制度",
    hrEmail: "hr@huarui.com",
    hrFaq: "入职手册、保密制度、邮箱权限和共享盘权限都在附件包里。请假、设备、保密条款都可以直接问我。",
    groupReply: "资料我重新贴一遍。先按目录把材料过完，别一上来只盯着交付件。",
    completionLetterTitle: "华锐证券 · 模拟实习结业通知",
    tasks: [
      {
        expectedSubmissionKind: "email",
        allowedExtensions: ["xlsx", "csv", "docx", "pdf", "md"],
        minimumRequirement: "通过邮件提交可读竞品表，附件需是表格或文档格式。",
        retryTemplate: "这次我收到了，但没法按完整竞品表判定完成。这个任务要求通过邮件交表格/文档版竞品梳理，图片或随手截屏不能算正式交付。",
        passTemplate: "这版至少是按投行交付方式来的，结构和口径都能往下改。下一轮把行业分层和上市可行性再说得更直接一点。",
        groupNudge: "共享盘里放了竞品池和口径模板，先按模板填，再补你的判断。",
        materials: [
          {
            id: "ibd-0-pack",
            title: "机器视觉赛道竞品池",
            description: "8 家竞品初筛名单、融资阶段和客户场景口径。",
            filename: "ibd-task-1-竞品池.md",
            content: `# 机器视觉 / AI 质检竞品池\n\n## 建议字段\n- 公司简称\n- 核心场景\n- 客户类型\n- 融资阶段 / 上市状态\n- 2025E 收入口径\n\n## 初筛名单\n| 公司 | 场景 | 客户 | 状态 |\n| --- | --- | --- | --- |\n| 星瞳智能 | 工业质检 | 3C / 汽车 | 拟申报 |\n| 视衡科技 | AOI 检测 | 面板 / 半导体 | Pre-IPO |\n| 朗识智造 | 视觉分拣 | 物流 / 仓储 | B+ 轮 |\n| 工曜自动化 | 工控检测 | 锂电 / 光伏 | 新三板 |\n\n## 提示\n结论至少回答两件事：谁已经验证商业化，谁仍停留在故事阶段。`,
          },
        ],
      },
      {
        expectedSubmissionKind: "chat_attachment",
        allowedExtensions: ["xlsx", "csv", "docx", "md", "pdf"],
        minimumRequirement: "通过聊天附件提交结构化 DD 清单，需覆盖业务、财务、法律、技术四维度。",
        retryTemplate: "这次提交我收到了，但不能按 DD 清单算完成。这个任务至少要有结构化附件，四个维度都要能落到资料来源和责任方。",
        passTemplate: "这版 DD 清单已经有执行感了，至少不是空泛 checklist。后面把收入确认链条和历史沿革节点再压实一点。",
        groupNudge: "我把尽调目录、底稿命名规则和访谈纪要都贴群里了，先按那个框架拉表。",
        materials: [
          {
            id: "ibd-1-pack",
            title: "IPO 尽调清单模板",
            description: "四维度清单模板和资料来源示例。",
            filename: "ibd-task-2-dd-template.md",
            content: `# IPO DD 清单模板\n\n| 维度 | 调查事项 | 资料来源 | 责任方 |\n| --- | --- | --- | --- |\n| 业务 | 客户集中度 | 销售台账 / Top10 客户合同 | 财务 + 业务 |\n| 财务 | 收入确认链条 | 验收单 / 发票 / 回款明细 | 财务 |\n| 法律 | 历史沿革 | 工商档案 / 股东会决议 | 法务 |\n| 技术 | 核心专利有效性 | 专利证书 / 年费缴纳记录 | 技术负责人 |\n\n## 特别关注\n- 科创属性论证材料\n- 实控人变更历史\n- 研发人员稳定性`,
          },
        ],
      },
      {
        expectedSubmissionKind: "email",
        allowedExtensions: ["xlsx", "csv"],
        minimumRequirement: "通过邮件提交表格文件，至少包含财务趋势表和异常说明。",
        retryTemplate: "文件我收到了，但这次不能按完整财务分析算。这个任务要求邮件提交表格版数据整理，纯图片或没有趋势表的附件不能判定完成。",
        passTemplate: "方向对了，至少把表和异常点先拉平了。接下来别只写“应收变高”，要把客户结构、验收周期和现金回笼一起讲清。",
        groupNudge: "财务包里有三年报表和口径说明，先按统一科目拉平再做分析。",
        materials: [
          {
            id: "ibd-2-pack",
            title: "星瞳智能三年财务包",
            description: "2022-2025 核心科目趋势表。",
            filename: "ibd-task-3-financials.csv",
            content: `年份,收入,毛利率,研发费用率,应收账款,经营现金流\n2022,318,41.2%,14.8%,62,-18\n2023,402,43.5%,15.1%,79,6\n2024,516,45.7%,16.4%,113,18\n2025E,624,47.1%,16.0%,148,24`,
          },
        ],
      },
      {
        expectedSubmissionKind: "chat_attachment",
        allowedExtensions: ["xlsx", "csv", "pdf", "md"],
        minimumRequirement: "通过聊天附件提交 comps table，至少含估值倍数和可比口径。",
        retryTemplate: "这次不能按估值任务完成来算。这个任务要交一版可比公司表，图片或没有口径说明的零散材料都不够。",
        passTemplate: "这版已经有 comps 的基本骨架了。下一轮先把可比性证明写在前面，再去算倍数，结论会更稳。",
        groupNudge: "群里补了可比口径和行业倍数快照，先用它筛标的。",
        materials: [
          {
            id: "ibd-3-pack",
            title: "机器视觉可比口径",
            description: "估值倍数和增长指标快照。",
            filename: "ibd-task-4-comps.csv",
            content: `公司,市值,2025E收入增速,毛利率,PS,PE\n视衡科技,118,28%,46%,5.8x,34x\n工曜自动化,86,21%,39%,4.1x,27x\n朗识智造,74,33%,43%,6.2x,NA\n光程智控,91,25%,41%,4.9x,31x`,
          },
        ],
      },
      {
        expectedSubmissionKind: "email",
        allowedExtensions: ["docx", "pdf", "md"],
        minimumRequirement: "通过邮件提交招股书章节初稿，附件需是文档格式。",
        retryTemplate: "这次我没法按招股书章节初稿收。这个任务要求邮件提交文档版正文，截图或零散图片不能替代正式稿。",
        passTemplate: "至少已经是申报材料的写法了，语气也控制住了。把监管口径和风险边界再补清楚，会更像正式稿。",
        groupNudge: "我把行业概况章节提纲和业务技术章节示例都同步到共享盘了。",
        materials: [
          {
            id: "ibd-4-pack",
            title: "招股书章节提纲",
            description: "业务与技术、行业概况章节结构模板。",
            filename: "ibd-task-5-prospectus-outline.md",
            content: `# 招股书章节提纲\n\n## 业务与技术\n1. 业务概述\n2. 产品体系\n3. 核心技术与先进性\n4. 研发体系与团队\n5. 客户与供应链\n\n## 行业概况与竞争格局\n1. 行业定义与边界\n2. 市场规模与增长驱动\n3. 竞争格局\n4. 行业壁垒\n5. 发行人竞争优势\n\n> 用客观、可验证表述，避免宣传式措辞。`,
          },
        ],
      },
      {
        expectedSubmissionKind: "chat_attachment",
        allowedExtensions: ["pptx", "pdf", "md", "docx"],
        minimumRequirement: "通过聊天附件提交路演问答或要点清单，至少覆盖经营、财务和风险问题。",
        retryTemplate: "材料我看到了，但这次还不能按路演问答完成来算。至少要有一版结构化 Q&A 附件，不能只发零散截屏。",
        passTemplate: "这版 Q&A 已经有路演味道了，特别是风险题的顺序比较对。后面再把回答压短一点，更适合现场用。",
        groupNudge: "路演问答高频问题和投委会追问清单已经发群里了，先按那个顺序排。",
        materials: [
          {
            id: "ibd-5-pack",
            title: "路演问答高频问题",
            description: "经营、财务、监管三类常见追问。",
            filename: "ibd-task-6-roadshow-qa.md",
            content: `# 路演 Q&A 高频问题\n\n- 收入确认为什么与现金回款存在时点差？\n- 毛利率提升是否具有可持续性？\n- 客户集中度会不会影响发行后业绩稳定性？\n- 核心专利壁垒是否足够支撑科创属性？\n- 2025E 业绩承压情景下估值安全边际如何看？`,
          },
        ],
      },
    ],
  },
  "pe-growth": {
    leader: {
      name: "林骁",
      title: "曜石资本投资副总裁",
      roleLabel: "VP · 消费科技投资负责人",
      avatarEmoji: "🧠",
      email: "linxiao@obsidiancap.com",
      greeting: "欢迎进组。我们这条线更看赛道判断和商业化逻辑，结论别飘。",
      tonePrompt: "像 PE/VC 投资人，关注赛道、商业模式、增长质量和回撤风险。",
      completionNote: "你已经能把赛道、业务和投委会视角串起来了。后面把反方观点练扎实，会更像真正能上会的人。",
    },
    groupName: "曜石资本 投资项目组",
    groupRoleLabel: "群聊 · 模板 / 共享盘 / 纪要",
    hrName: "曜石资本 HR",
    hrRoleLabel: "HR · 入职与制度",
    hrEmail: "hr@obsidiancap.com",
    hrFaq: "报销、出差、保密条款和共享盘权限说明都在入职包里，需要再发我可以补。",
    groupReply: "共享盘路径和模板我重新贴一下。先把底稿格式用起来，投委会材料最怕版本乱。",
    completionLetterTitle: "曜石资本 · 模拟项目结业通知",
    tasks: [
      {
        expectedSubmissionKind: "email",
        allowedExtensions: ["pptx", "pdf", "docx", "md"],
        minimumRequirement: "通过邮件提交赛道 mapping，附件需为文档或演示材料。",
        retryTemplate: "这次不能按赛道 mapping 完成来判。这个任务要交一版结构化投资视角材料，图片拼接或纯截图都不够。",
        passTemplate: "这版至少把赛道层级和玩家分层拉出来了。下一轮把壁垒和退出路径说得更像投资判断。",
        groupNudge: "赛道地图模板和一级市场融资快照都在共享盘里，先按模板搭骨架。",
        materials: [
          {
            id: "pe-0-pack",
            title: "消费科技赛道地图模板",
            description: "一级市场赛道 mapping 模板与融资快照。",
            filename: "pe-task-1-sector-map.md",
            content: `# 消费科技赛道地图模板\n\n## 分层建议\n- 交易入口\n- 履约与供应链\n- 品牌数字化工具\n- 数据中台 / CRM\n\n## 玩家快照\n| 公司 | 核心能力 | 客户类型 | 最近轮次 |\n| --- | --- | --- | --- |\n| 茶季霸王数字化 | 连锁茶饮 SaaS | 连锁品牌 | B 轮 |\n| 米冰雪城供应链云 | 门店供应链协同 | 下沉连锁 | A+ 轮 |\n| 果语鲜配 | 生鲜履约 | 社区零售 | B+ 轮 |`,
          },
        ],
      },
      {
        expectedSubmissionKind: "chat_attachment",
        allowedExtensions: ["xlsx", "csv", "docx", "md", "pdf"],
        minimumRequirement: "通过聊天附件提交商业模式拆解，至少包含收入、成本、获客与留存。",
        retryTemplate: "材料我收到了，但还没到商业模式拆解的最低标准。要有结构化附件，至少讲清收入来源、成本结构和增长约束。",
        passTemplate: "这版已经不是空谈故事了，收入和单位经济模型有了基本框架。再把增长约束和复购驱动拆细会更像投资 memo。",
        groupNudge: "我把单位经济模型示意和创始人访谈纪要补到群里了，先对着拆。",
        materials: [
          {
            id: "pe-1-pack",
            title: "商业模式拆解提示卡",
            description: "收入、成本、获客、留存四层拆解。",
            filename: "pe-task-2-biz-model.md",
            content: `# 商业模式拆解提示卡\n\n- 收入端：订阅费 / GMV 抽佣 / 增值服务\n- 成本端：销售、实施、研发、履约\n- 获客：渠道 / CAC / 回本周期\n- 留存：续费率 / 单店拓展 / 客单提升\n\n## 提醒\n不要只写“空间大”，要解释为什么能持续赚钱。`,
          },
        ],
      },
      {
        expectedSubmissionKind: "email",
        allowedExtensions: ["docx", "pdf", "md"],
        minimumRequirement: "通过邮件提交投资备忘录初稿，附件需为正式文档。",
        retryTemplate: "这次提交还不能按 Memo 初稿收。这个任务要邮件发正式文档，至少要有投资亮点、核心风险和建议方案。",
        passTemplate: "Memo 的骨架已经对了，特别是正反方摆得比较平。下一轮把反对意见写得更狠一点，材料会更可信。",
        groupNudge: "投委会 Memo 模板和过会意见摘要已经放资料包了。",
        materials: [
          {
            id: "pe-2-pack",
            title: "投资备忘录模板",
            description: "投资亮点、风险、估值与退出路径模板。",
            filename: "pe-task-3-investment-memo.md",
            content: `# Investment Memo 模板\n\n## 1. 一句话结论\n## 2. 投资亮点\n## 3. 商业化验证情况\n## 4. 核心风险\n## 5. 估值与交易结构\n## 6. 退出路径\n\n> 任何亮点都要配反例或反方验证。`,
          },
        ],
      },
      {
        expectedSubmissionKind: "chat_attachment",
        allowedExtensions: ["xlsx", "csv", "pdf", "md"],
        minimumRequirement: "通过聊天附件提交财务 / 经营模型，至少含收入拆分和敏感性。",
        retryTemplate: "模型我看到了，但这次不能按完整经营模型算。这个任务至少要有表格附件，且能看出收入拆分和关键假设。",
        passTemplate: "模型至少跑起来了，假设之间也基本连得上。后面把敏感性和 downside case 再做扎实一点。",
        groupNudge: "模型底稿和关键运营指标样表都放在共享盘，先别自己重新造格式。",
        materials: [
          {
            id: "pe-3-pack",
            title: "经营模型样表",
            description: "收入拆分与敏感性示例。",
            filename: "pe-task-4-model.csv",
            content: `指标,2024A,2025E,2026E\n付费门店数,820,1080,1380\n单店年费,2.8,2.9,3.0\n增值服务收入,620,880,1140\n毛利率,61%,63%,65%\n销售费用率,29%,27%,25%`,
          },
        ],
      },
      {
        expectedSubmissionKind: "email",
        allowedExtensions: ["pptx", "pdf", "docx", "md"],
        minimumRequirement: "通过邮件提交投委会答辩材料，附件需为 PPT 或文档。",
        retryTemplate: "这次还不能按投委会答辩材料来收。这个任务要求邮件提交正式材料，纯图片或零散页面不能替代完整答辩稿。",
        passTemplate: "答辩材料已经有上会节奏了，重点也抓得住。后面再把最容易被追问的风险点提前放一页，会更稳。",
        groupNudge: "我把投委会常见追问和答辩结构放到群里了，先按那个顺序排。",
        materials: [
          {
            id: "pe-4-pack",
            title: "投委会追问清单",
            description: "投资亮点、估值、退出三类高频追问。",
            filename: "pe-task-5-ic-questions.md",
            content: `# 投委会追问清单\n\n- 为什么现在是最好的投资时点？\n- 单店模型是否已验证全国复制？\n- 如果头部客户流失，收入弹性有多大？\n- 估值高于同类 SaaS 的核心依据是什么？\n- 三年内最现实的退出路径是什么？`,
          },
        ],
      },
      {
        expectedSubmissionKind: "chat_attachment",
        allowedExtensions: ["docx", "pdf", "md"],
        minimumRequirement: "通过聊天附件提交 post-investment 计划或跟进清单。",
        retryTemplate: "这次不能按投后计划完成来算。至少需要一版结构化跟进清单附件，明确里程碑、指标和责任人。",
        passTemplate: "投后计划已经有抓手了，说明你不是只会看 deal。后面把里程碑和预警阈值再量化一些。",
        groupNudge: "投后跟踪模板和月度经营看板字段已经同步，直接按那个填。",
        materials: [
          {
            id: "pe-5-pack",
            title: "投后跟进清单",
            description: "经营看板字段与里程碑模板。",
            filename: "pe-task-6-post-investment.md",
            content: `# 投后跟进清单\n\n| 模块 | 指标 | 月度跟踪 | 预警阈值 |\n| --- | --- | --- | --- |\n| 增长 | 净新增门店 | 是 | 连续两月低于计划 20% |\n| 收入 | ARPU | 是 | 连续两月下滑 |\n| 留存 | 续费率 | 季度 | 低于 85% |\n| 现金 | 月 burn | 月度 | 超预算 15% |`,
          },
        ],
      },
    ],
  },
  "er-new-energy": {
    leader: {
      name: "程澈",
      title: "明信证券新能源组高级分析师",
      roleLabel: "高级分析师 · 新能源覆盖负责人",
      avatarEmoji: "📈",
      email: "chengche@mingxinsec.com",
      greeting: "欢迎来组里。研究线最怕结论慢和证据弱，先把框架搭稳。",
      tonePrompt: "像卖方研究员，强调框架、数据口径、盈利预测和观点克制。",
      completionNote: "你已经有研究助理的基本节奏了。后面把数据口径和观点边界控制得更细，会更像能独立写点评的人。",
    },
    groupName: "明信证券 新能源组",
    groupRoleLabel: "群聊 · 数据库 / 模板 / 资料盘",
    hrName: "明信证券 HR",
    hrRoleLabel: "HR · 入职与制度",
    hrEmail: "hr@mingxinsec.com",
    hrFaq: "考勤、保密、合规培训和资料库权限都在入职包，需要补发直接找我。",
    groupReply: "数据库路径和模板我重新发一下。先统一口径，再开始写判断。",
    completionLetterTitle: "明信证券 · 模拟研究结业通知",
    tasks: [
      {
        expectedSubmissionKind: "chat_attachment",
        allowedExtensions: ["pptx", "pdf", "docx", "md"],
        minimumRequirement: "通过聊天附件提交行业框架图或框架稿。",
        retryTemplate: "这次还不能按行业框架完成来判。这个任务至少要有结构化框架附件，纯截图或零散图片不够。",
        passTemplate: "框架已经立起来了，主线抓得也对。下一轮把供给、需求、政策三条线的先后关系再写清楚。",
        groupNudge: "行业数据库口径和周报模板都在资料盘，先按那个框架画图。",
        materials: [
          {
            id: "er-0-pack",
            title: "新能源行业框架模板",
            description: "供给、需求、政策三层框架模板。",
            filename: "er-task-1-industry-framework.md",
            content: `# 新能源行业框架模板\n\n## 供给侧\n- 产能投放\n- 原材料价格\n- 技术路线变化\n\n## 需求侧\n- 装机量 / 渗透率\n- 海外需求节奏\n- 下游应用扩张\n\n## 政策侧\n- 补贴与配储\n- 电改推进\n- 海外贸易政策`,
          },
        ],
      },
      {
        expectedSubmissionKind: "email",
        allowedExtensions: ["docx", "pdf", "md"],
        minimumRequirement: "通过邮件提交公司深度提纲，附件需为文档。",
        retryTemplate: "这次还不能按公司深度提纲收。这个任务要求邮件发文档版提纲，至少要有业务、财务、估值三段。",
        passTemplate: "提纲已经有研究深度报告的样子了，逻辑顺序也对。后面把估值段和催化剂写得更像观点，而不是材料罗列。",
        groupNudge: "深度报告目录模板和公司口径卡我都贴群里了。",
        materials: [
          {
            id: "er-1-pack",
            title: "公司深度目录模板",
            description: "业务、财务、估值、催化剂结构。",
            filename: "er-task-2-company-deep-dive.md",
            content: `# 公司深度目录模板\n\n1. 投资要点\n2. 公司定位与竞争优势\n3. 行业景气度与公司份额\n4. 财务预测与盈利拆解\n5. 估值与目标价\n6. 风险提示`,
          },
        ],
      },
      {
        expectedSubmissionKind: "chat_attachment",
        allowedExtensions: ["xlsx", "csv"],
        minimumRequirement: "通过聊天附件提交盈利预测模型，附件需为表格。",
        retryTemplate: "模型这次不能算完成。这个任务要求提交表格版预测，图片或没有关键假设的附件都不够。",
        passTemplate: "预测模型至少已经自洽了，假设链条也基本连上。后面把原材料敏感性和装机节奏再做扎实一点。",
        groupNudge: "模型底稿和历史利润表都已经发在共享盘里，直接续在模板后面。",
        materials: [
          {
            id: "er-2-pack",
            title: "盈利预测底稿",
            description: "历史利润表和核心假设样表。",
            filename: "er-task-3-earnings-model.csv",
            content: `指标,2024A,2025E,2026E\n出货量(GWh),16.2,21.5,27.4\n单Wh净利(元),0.048,0.054,0.061\n收入,182,236,302\n毛利率,21.4%,23.0%,24.2%\n净利润,7.8,11.6,16.7`,
          },
        ],
      },
      {
        expectedSubmissionKind: "email",
        allowedExtensions: ["docx", "pdf", "md"],
        minimumRequirement: "通过邮件提交业绩点评快评，附件需为文档。",
        retryTemplate: "这次不能按业绩点评完成收。这个任务要邮件发快评稿，至少要有结论、核心变化和盈利预测影响。",
        passTemplate: "快评已经像卖方节奏了，结论也比较清楚。再把盈利预测调整和风险边界压得更短更狠，会更适合盘后发。",
        groupNudge: "快评模板和盘后数据口径都补群里了，先按模板出结论。",
        materials: [
          {
            id: "er-3-pack",
            title: "业绩快评模板",
            description: "一句话结论 + 三点核心变化模板。",
            filename: "er-task-4-earnings-flash.md",
            content: `# 业绩快评模板\n\n## 一句话结论\n维持 / 上调 / 下调观点，并说明最核心驱动。\n\n## 三点核心变化\n1. 收入 / 毛利率变化\n2. 盈利预测调整\n3. 催化剂或风险变化\n\n## 目标价 / 评级影响\n明确是否调整。`,
          },
        ],
      },
      {
        expectedSubmissionKind: "chat_attachment",
        allowedExtensions: ["pptx", "pdf", "md"],
        minimumRequirement: "通过聊天附件提交路演纪要摘要或会议纪要要点。",
        retryTemplate: "这次还不能按路演纪要完成来判。这个任务至少要有结构化纪要附件，不能只发几张截屏。",
        passTemplate: "纪要已经抓到管理层重点了，尤其经营目标和出海节奏两块。后面再把“没说什么”也写出来，会更像研究纪要。",
        groupNudge: "我把路演录屏摘要和纪要模板放到了资料盘，先按模板整理。",
        materials: [
          {
            id: "er-4-pack",
            title: "管理层路演摘要",
            description: "经营目标、出海进展和产能节奏摘要。",
            filename: "er-task-5-roadshow-notes.md",
            content: `# 管理层路演摘要\n\n- 2025E 出货目标维持 21-22GWh\n- 海外客户导入节奏快于年初预期\n- 新产线爬坡预计 Q3 稳定\n- 原材料价格波动仍是利润率主要扰动项\n- 管理层未正面给出全年 capex 下修指引`,
          },
        ],
      },
      {
        expectedSubmissionKind: "email",
        allowedExtensions: ["pptx", "pdf", "docx", "md"],
        minimumRequirement: "通过邮件提交周报 / 小结，附件需为文档或演示稿。",
        retryTemplate: "这次还不能按周报小结来收。这个任务要求邮件提交正式稿，至少要有本周变化、核心观点和下周跟踪点。",
        passTemplate: "周报收尾已经有研究组的节奏感了，信息筛选也不错。后面把“重要但不紧急”的跟踪项再留出来，会更完整。",
        groupNudge: "周报模板、跟踪表和下周日历都同步到群里了。",
        materials: [
          {
            id: "er-5-pack",
            title: "周报收尾模板",
            description: "本周变化、观点、下周跟踪点模板。",
            filename: "er-task-6-weekly-wrap.md",
            content: `# 周报收尾模板\n\n## 本周行业变化\n- 价格\n- 装机 / 出货\n- 政策\n\n## 观点更新\n- 维持观点 / 调整观点\n\n## 下周跟踪点\n- 数据发布\n- 路演 / 调研\n- 海外政策窗口`,
          },
        ],
      },
    ],
  },
  "ma-buyside": {
    leader: {
      name: "沈承宇",
      title: "华兴并购 M&A 组 VP",
      roleLabel: "VP · 买方并购项目负责人",
      avatarEmoji: "🤝",
      email: "shenchengyu@huaxingma.com",
      greeting: "欢迎进组。买方组节奏快、客户压力大，先把估值和材料的基本盘做扎实。",
      tonePrompt: "像 sell-side M&A 银行家，强调结构化输出、估值口径、客户视角和过会逻辑。",
      completionNote: "你已经能独立把一笔买方交易的核心估值和材料跑通了。后面把客户沟通和反方质疑练扎实，会更接近真正的 deal team 节奏。",
    },
    groupName: "华兴并购 京北数码 M&A 项目组",
    groupRoleLabel: "群聊 · 估值 / 模板 / 共享盘",
    hrName: "华兴并购 HR",
    hrRoleLabel: "HR · 入职与制度",
    hrEmail: "hr@huaxingma.com",
    hrFaq: "入职手册、保密协议、并购合规培训和共享盘权限都在附件包里。M&A 项目对客户信息保密要求最高，任何材料一律走加密渠道。",
    groupReply: "共享盘路径和模板我重新贴一下。M&A 材料先按格式走，IC 材料最怕版本错乱。",
    completionLetterTitle: "华兴并购 · 模拟实习结业通知",
    tasks: [
      {
        expectedSubmissionKind: "email",
        allowedExtensions: ["pptx", "pdf", "docx", "md"],
        minimumRequirement: "通过邮件提交 Target Profile 文档，需含业务概述、股权结构、管理层、EV 测算四部分。",
        retryTemplate: "这次还不能按 Target Profile 完成来判。这个任务要求邮件提交结构化文档/演示稿，至少要算出 EV 并列出业务和股权要点。",
        passTemplate: "这版 profile 已经能给客户看了，EV 计算也走通了。下一轮把估值折价的初步判断写得更直接一点，IC 才会买账。",
        groupNudge: "项目简报和市场数据快照都在共享盘 /京北数码M&A/ 下，先按 profile 模板填。",
        materials: [
          {
            id: "ma-0-pack",
            title: "Target Profile 骨架模板",
            description: "Profile 五段结构 + EV 计算公式提示。",
            filename: "ma-task-1-target-profile-template.md",
            content: `# Target Profile 模板（京北数码）\n\n## 1. 一页核心数据\n- 股价 / 市值 / EV / 52 周区间\n- FY24 营收 / EBITDA / 净利润\n- 评级与目标价（如有）\n\n## 2. 业务概述\n- 4 条业务线收入与占比\n- 商业模式 + 渠道结构\n\n## 3. 股权结构与管理层\n- Top 5 股东及持股比例\n- 实控人、董事长、CEO、CFO\n\n## 4. Enterprise Value 计算\nEV = 市值 + 有息负债 - 现金及等价物\n\n## 5. 初步交易考虑\n- 折价/溢价初判\n- 与客户战略契合点`,
          },
        ],
      },
      {
        expectedSubmissionKind: "chat_attachment",
        allowedExtensions: ["xlsx", "csv"],
        minimumRequirement: "通过聊天附件提交 IS 模型，需覆盖 FY22A-FY27E 五年预测，并标出 D&A 跳升对净利润的影响。",
        retryTemplate: "模型这次不能算完成。要交一版表格附件，至少 FY25E-FY27E 三年预测，关键假设（增速、毛利率、D&A）必须能看出来。",
        passTemplate: "这版预测的骨架立起来了，D&A 跳升那块也注意到了。下一轮把 D&A 一次性影响和经营性 EBITDA 拆开讲，结论会更稳。",
        groupNudge: "财务包里有 FY22-FY24 三年实际数据和 D&A 跳升说明，先按模板续到 FY27E。",
        materials: [
          {
            id: "ma-1-pack",
            title: "IS 预测建模模板",
            description: "FY22A-FY27E 利润表预测样表与关键假设。",
            filename: "ma-task-2-is-template.csv",
            content: `指标,FY22A,FY23A,FY24A,FY25E,FY26E,FY27E\n营业收入,7521,6853,6418,6610,6940,7287\n增长率,,−8.9%,−6.3%,3.0%,5.0%,5.0%\n毛利率,23.6%,23.8%,22.4%,22.8%,23.2%,23.6%\n销售管理费用率,16.1%,16.6%,16.8%,16.4%,16.0%,15.6%\nEBITDA,560,538,424,468,540,612\nD&A,148,156,168,256,232,210\nEBIT,412,382,256,212,308,402\n净利润,278,273,182,148,224,302\n备注,,,,FY25E D&A 跳升致净利润短期回落,,`,
          },
        ],
      },
      {
        expectedSubmissionKind: "email",
        allowedExtensions: ["xlsx", "csv"],
        minimumRequirement: "通过邮件提交 Trading Comps 表格，至少含 7 家可比公司、EV/Revenue 与 EV/EBITDA 倍数、均值/中位数。",
        retryTemplate: "这次不能按 Comps 完成来收。要邮件交一版表格，必须算出每家可比的 EV、EV/Rev、EV/EBITDA，并列出均值与中位数。",
        passTemplate: "这版 comps 至少把可比池跑通了，折价幅度也看得见。下一轮把'为什么折价合理'和'协同填补缺口'这两段写在前面。",
        groupNudge: "可比公司清单和最新市场快照都贴群里了，目标公司不要进可比池。",
        materials: [
          {
            id: "ma-2-pack",
            title: "Trading Comps 模板",
            description: "可比公司估值倍数模板与公式提示。",
            filename: "ma-task-3-comps-template.csv",
            content: `公司,股价,股本(亿),市值,有息负债,现金,EV,LTM收入,LTM EBITDA,EV/Revenue,EV/EBITDA\n苏宁易购,2.34,93.0,2176,5240,1820,5596,12480,860,0.45,6.51\n国美零售,0.86,32.4,279,1840,520,1599,5420,-180,0.30,nm\n京东集团-SW,128.6,31.2,40123,8240,12860,35503,288400,12640,0.12,2.81\n永辉超市,3.18,90.7,2884,3260,1480,4664,8650,420,0.54,11.10\n物美科技,15.40,18.6,2864,2180,860,4184,4250,520,0.98,8.05\n三江购物,9.85,5.42,534,180,220,494,3820,180,0.13,2.74\n中百集团,5.62,6.81,383,420,180,623,2840,160,0.22,3.89\n均值,,,,,,,,,0.39,5.85\n中位数,,,,,,,,,0.30,5.20\n京北数码（目标）,7.68,22.86,1756,412,226,1942,6418,424,0.30,4.58\n备注,目标 EV/Rev 与中位数接近·EV/EBITDA 显著低于均值,,,,,,,,,`,
          },
        ],
      },
      {
        expectedSubmissionKind: "chat_attachment",
        allowedExtensions: ["docx", "pdf", "md"],
        minimumRequirement: "通过聊天附件提交 ≤200 字战略备忘录，至少覆盖 3 个收购后投入方向（健康科技 / 出行电气化 / 户外生活方式）并给出排序判断。",
        retryTemplate: "这次不能按战略备忘录完成来收。要交一版结构化短稿，三个方向都要展开，至少给出排序与一句话理由。",
        passTemplate: "Memo 收尾已经有 IC 答辩的味道了，三个方向的优先级也排得清。下一轮把每个方向的资本开支量级和 2-3 年回报路径补上。",
        groupNudge: "三个方向的行业资料和管理层访谈纪要已经放在群里了，先按那个材料组织判断。",
        materials: [
          {
            id: "ma-3-pack",
            title: "战略备忘录提示卡",
            description: "三个收购后投入方向的论证框架。",
            filename: "ma-task-4-strategic-memo.md",
            content: `# 收购后战略备忘录提示\n\n## 候选方向\n1. 健康科技（智能穿戴 + 健康监测设备）\n2. 出行电气化（电动两轮车 + 充电配件 + 储能）\n3. 户外生活方式（露营 / 家庭健身 / 智能家居延伸）\n\n## 写作要点（≤200 字）\n- 排序：先写最优先方向，再写第二/第三\n- 每个方向 1 句话回答：为什么打、靠什么打、2-3 年看到什么\n- 结论必须落到"对鸿华百货收购后的协同价值"上\n\n## 不能写的话\n- "都很重要" → 客户不会买\n- "未来空间大" → 没有判断的空话`,
          },
        ],
      },
    ],
  },
  "ibd-robotics-ipo": {
    leader: {
      name: "顾庭远",
      title: "国曜投行股权融资部 VP",
      roleLabel: "VP · 科创板 IPO 项目负责人",
      avatarEmoji: "🤖",
      email: "gutingyuan@guoyaoib.com",
      greeting: "欢迎进组。星河机器人是硬科技项目，行业、公司和募投逻辑都要能被审核追问。",
      tonePrompt: "像投行股权融资 VP，强调科创属性、申报口径、数据来源和风险边界。",
      completionNote: "你已经跑完一条科创板 IPO 前期分析链路。继续练材料表达和审核追问，投行基本功会更稳。",
    },
    groupName: "国曜投行 星河机器人 IPO 项目组",
    groupRoleLabel: "群聊 · 行业 / 募投 / 申报材料",
    hrName: "国曜投行 HR",
    hrRoleLabel: "HR · 入职与制度",
    hrEmail: "hr@guoyaoib.com",
    hrFaq: "入职培训、保密协议、底稿规范和共享盘权限都在入职包里。IPO 项目材料请统一使用项目组共享盘版本。",
    groupReply: "资料包和底稿目录我重新贴一下。先把项目简报和财务数据包过完，再开始写交付件。",
    completionLetterTitle: "国曜投行 · 模拟实习结业通知",
    tasks: [
      makeRuntimeTask("ibd-robotics-ipo-task-1", "智能制造与工业机器人行业速览", "提交行业速览文档，覆盖市场规模、产业链、竞争格局和科创板适配性。", "资料包里有公司简报和财务数据，行业数据要标口径。", "行业速览交付提示", "# Task 1\n先用资料包确认行业边界，再拆市场规模、国产替代、下游应用和科创属性。"),
      makeRuntimeTask("ibd-robotics-ipo-task-2", "公司业务与客户结构梳理", "提交公司业务结构表，拆解收入来源、客户类型、核心产品和应用场景。", "重点看前五大客户、供应商依赖和研发投入。", "公司业务梳理提示", "# Task 2\n按产品线、行业、客户三个口径拆收入，并补客户集中度风险。"),
      makeRuntimeTask("ibd-robotics-ipo-task-3", "募投项目合理性分析", "提交募投项目分析表，说明资金用途、产能扩张逻辑和战略匹配度。", "募投分析要对标同行案例，不能只复述可研摘要。", "募投分析提示", "# Task 3\n逐项拆研发中心、产能扩建和补流，写清建设期、达产和收益假设。"),
      makeRuntimeTask("ibd-robotics-ipo-task-4", "IPO 投资亮点与风险因素总结", "提交 IPO 初步分析报告，包含投资亮点、风险因素和科创属性。", "亮点要有数据支撑，风险不能写成模板话。", "亮点与风险提示", "# Task 4\n从赛道、壁垒、订单、技术、财务五个角度提炼亮点，并配套主要风险。"),
    ],
  },
  "ma-semiconductor": {
    leader: {
      name: "陆衡",
      title: "海岳并购产业并购组 VP",
      roleLabel: "VP · 买方并购项目负责人",
      avatarEmoji: "💾",
      email: "luheng@haiyuema.com",
      greeting: "欢迎进组。半导体并购不能只讲赛道热，要讲买方为什么买、标的为什么值、风险怎么控。",
      tonePrompt: "像产业并购 VP，强调战略动因、技术壁垒、估值区间、协同和整合风险。",
      completionNote: "你已经把一笔产业并购从动因、标的到交易建议跑通了。下一步练反方尽调和交易结构会更接近真实项目。",
    },
    groupName: "海岳并购 蓝芯半导体项目组",
    groupRoleLabel: "群聊 · 标的 / 估值 / 交易风险",
    hrName: "海岳并购 HR",
    hrRoleLabel: "HR · 入职与制度",
    hrEmail: "hr@haiyuema.com",
    hrFaq: "并购项目保密要求较高，客户名称、估值区间和交易结构不得外传。共享盘权限由项目经理统一开通。",
    groupReply: "买方简报、标的资料和可比交易表都在共享盘，先把交易逻辑看清楚。",
    completionLetterTitle: "海岳并购 · 模拟实习结业通知",
    tasks: [
      makeRuntimeTask("ma-semiconductor-task-1", "买方战略诉求与并购动因分析", "提交并购动因 Memo，说明买方为什么要通过收购进入汽车芯片。", "先判断买方自身能力，再判断赛道吸引力。", "并购动因提示", "# Task 1\n回答三个问题：买方现状、为什么汽车芯片、为什么并购而不是自研。"),
      makeRuntimeTask("ma-semiconductor-task-2", "目标公司业务与竞争力分析", "提交目标公司分析表，覆盖产品、客户、技术壁垒、财务和竞争对手。", "Fabless 标的要看代工产能、认证周期和客户导入。", "标的分析提示", "# Task 2\n拆 MCU、功率芯片、客户结构、技术认证和现金消耗。"),
      makeRuntimeTask("ma-semiconductor-task-3", "可比交易与估值区间判断", "提交可比交易分析表，判断蓝芯半导体估值区间。", "可比交易要区分技术领域、盈利状态和控制权溢价。", "估值区间提示", "# Task 3\n用 EV/Revenue、EV/EBITDA 和技术溢价交叉验证估值。"),
      makeRuntimeTask("ma-semiconductor-task-4", "交易协同与主要风险总结", "提交买方并购建议书，说明是否推进、协同点和关键风险。", "建议书要有明确结论，不要只列利弊。", "交易建议提示", "# Task 4\n把技术协同、客户协同、供应链协同和整合风险放在同一张判断表里。"),
    ],
  },
  "pe-dental-chain": {
    leader: {
      name: "许知遥",
      title: "启明资本医疗消费组 VP",
      roleLabel: "VP · 成长型投资负责人",
      avatarEmoji: "🦷",
      email: "xuzhiyao@qimingcap.com",
      greeting: "欢迎进组。口腔连锁看起来是消费，底层其实是医生效率、单店模型和扩张纪律。",
      tonePrompt: "像 PE 投资 VP，关注单位经济、门店复制、医生供给、政策风险和退出路径。",
      completionNote: "你已经完成一份消费医疗 PE 初筛链路。继续把反方观点和估值纪律练扎实，会更像真正的投资组输出。",
    },
    groupName: "启明资本 悦齿医疗项目组",
    groupRoleLabel: "群聊 · 行业 / 门店模型 / 投资 Memo",
    hrName: "启明资本 HR",
    hrRoleLabel: "HR · 入职与制度",
    hrEmail: "hr@qimingcap.com",
    hrFaq: "投资项目资料和会议纪要仅限内部使用。尽调访谈、数据口径和模型版本请统一保存在项目共享盘。",
    groupReply: "投资简报和门店模型已经同步。先别急着下结论，单店经济要先跑明白。",
    completionLetterTitle: "启明资本 · 模拟实习结业通知",
    tasks: [
      makeRuntimeTask("pe-dental-chain-task-1", "口腔医疗行业与需求分析", "提交行业研究 Memo，分析口腔医疗需求、渗透率、政策和竞争格局。", "行业热不等于标的好，先判断需求和集中度。", "行业研究提示", "# Task 1\n拆正畸、种植、儿牙和基础治疗，重点看连锁化空间。"),
      makeRuntimeTask("pe-dental-chain-task-2", "公司商业模式与门店模型拆解", "提交门店经营模型表，包含单店收入、医生效率、客单价和获客成本。", "成熟店和新店要分层看，不能平均数一把梭。", "门店模型提示", "# Task 2\n按城市、成熟度、牙椅数、医生数、利润率和回本周期拆模型。"),
      makeRuntimeTask("pe-dental-chain-task-3", "投资亮点与风险判断", "提交投资初筛 Memo，梳理增长逻辑、竞争优势和潜在风险。", "亮点要和风险成对出现，尤其是医生供给和政策。", "投资初筛提示", "# Task 3\n从行业、公司、门店、团队、政策五个维度做正反判断。"),
      makeRuntimeTask("pe-dental-chain-task-4", "投资建议与退出路径", "提交 PE 投资建议书，判断是否进入下一轮尽调并说明退出方式。", "投资建议必须有条款关注点和退出路径。", "投资建议提示", "# Task 4\n写清是否推进、估值锚、条款保护、退出路径和 DD 清单。"),
    ],
  },
  "er-cxo": {
    leader: {
      name: "陈知行",
      title: "明信证券医药行业分析师",
      roleLabel: "医药组 · CXO 覆盖分析师",
      avatarEmoji: "💊",
      email: "chenzhixing@mingxinsec.com",
      greeting: "欢迎进组。CXO 不是只看估值低，核心是订单、产能利用率和政策风险边际变化。",
      tonePrompt: "像卖方医药分析师，强调行业框架、公司对比、边际变化、催化剂和风险提示。",
      completionNote: "你已经搭出一篇行业深度的主线。继续练数据验证和观点表达，就能更接近卖方研究日常。",
    },
    groupName: "明信证券 医药组 CXO 深度项目",
    groupRoleLabel: "群聊 · 框架 / 公司对比 / 报告",
    hrName: "明信证券 HR",
    hrRoleLabel: "HR · 入职与制度",
    hrEmail: "hr@mingxinsec.com",
    hrFaq: "研究报告底稿、合规审核和信息隔离要求请查看入职手册。公开资料引用必须保留来源。",
    groupReply: "行业框架和 comps 数据已经同步。先搭主线，再写公司排序。",
    completionLetterTitle: "明信证券 · 模拟实习结业通知",
    tasks: [
      makeRuntimeTask("er-cxo-task-1", "CXO 行业产业链与需求驱动分析", "提交行业框架图和研究 Memo，说明 CRO、CDMO、CMO 等环节差异。", "先区分短期融资周期和长期外包率提升。", "行业框架提示", "# Task 1\n把产业链、需求驱动、订单和地缘政治风险放到一个框架里。"),
      makeRuntimeTask("er-cxo-task-2", "重点公司业务与财务对比", "提交可比公司对比表，比较收入结构、毛利率、订单和产能利用率。", "CRO 和 CDMO 估值逻辑不同，不要混为一谈。", "公司对比提示", "# Task 2\n重点看海外收入、在手订单、产能利用率和客户集中度。"),
      makeRuntimeTask("er-cxo-task-3", "行业变化与估值修复逻辑", "提交投资逻辑 Memo，分析融资、订单、产能利用率和政策变化。", "估值修复要讲清楚催化剂和验证指标。", "估值修复提示", "# Task 3\n从融资回暖、订单拐点、产能利用率和政策缓和四个信号判断。"),
      makeRuntimeTask("er-cxo-task-4", "报告核心观点与风险提示", "提交卖方行业深度报告框架，包含核心结论、推荐逻辑和风险因素。", "卖方报告要有明确评级、主线和风险提示。", "报告框架提示", "# Task 4\n用一句话结论、三条推荐逻辑、两类催化剂和风险表收尾。"),
    ],
  },
  "vc-ai-interview": {
    leader: {
      name: "周未然",
      title: "辰星创投投资经理",
      roleLabel: "投资经理 · AI 应用与教育科技",
      avatarEmoji: "🎤",
      email: "zhouweiran@chenxingvc.com",
      greeting: "欢迎参与初筛。早期项目别急着算大市场，先判断需求真伪、产品差异和创始人学习速度。",
      tonePrompt: "像早期 VC 投资经理，关注需求、PMF、竞品、增长路径、团队和下一轮融资可能性。",
      completionNote: "你已经完成一份种子轮初筛 Memo。继续练非共识判断和反方风险，会更像真正的早期投资人。",
    },
    groupName: "辰星创投 AI 面试助手项目组",
    groupRoleLabel: "群聊 · BP / 市场 / 投资 Memo",
    hrName: "辰星创投 HR",
    hrRoleLabel: "HR · 入职与制度",
    hrEmail: "hr@chenxingvc.com",
    hrFaq: "投资项目 BP、访谈纪要和投资判断仅限内部使用。外部沟通请先和项目负责人确认口径。",
    groupReply: "BP 摘要和市场地图已经同步。先判断这是强需求还是漂亮功能。",
    completionLetterTitle: "辰星创投 · 模拟实习结业通知",
    tasks: [
      makeRuntimeTask("vc-ai-interview-task-1", "AI 求职与面试训练市场分析", "提交市场分析 Memo，说明目标用户、需求强度、市场规模和趋势。", "不要把求职培训大市场直接当 TAM。", "市场分析提示", "# Task 1\n从目标用户、真实需求、付费意愿和 AI 替代边界判断市场。"),
      makeRuntimeTask("vc-ai-interview-task-2", "产品功能与竞品对比", "提交竞品分析表，对比 AI 面试助手、简历工具、职业教育平台和通用 AI。", "通用 AI 是最大替代者，要正面比较。", "竞品分析提示", "# Task 2\n拆功能、用户、定价、留存和数据壁垒，判断垂直工具价值。"),
      makeRuntimeTask("vc-ai-interview-task-3", "商业模式与增长路径评估", "提交商业模式分析 Memo，分析 B2C 订阅、校园合作和企业合作。", "增长路径要和 CAC、LTV、留存一起看。", "商业模式提示", "# Task 3\n把 B2C、B2B2C、企业招聘合作分开测算，判断最可能的 PMF 路径。"),
      makeRuntimeTask("vc-ai-interview-task-4", "种子轮投资建议", "提交 VC 初筛投资 Memo，判断是否进入下一轮 DD。", "建议必须明确：投、跟进观察或 pass。", "投资 Memo 提示", "# Task 4\n从市场、产品、团队、数据、估值和风险六段写投资建议。"),
    ],
  },
  "fa-drone-series-a": {
    leader: {
      name: "韩予乔",
      title: "和桥资本 FA 项目经理",
      roleLabel: "项目经理 · 早期融资顾问",
      avatarEmoji: "🚁",
      email: "hanyuqiao@heqiaocap.com",
      greeting: "欢迎进组。FA 的工作不是把故事讲漂亮，而是把投资人会问的问题提前回答掉。",
      tonePrompt: "像 FA 项目经理，强调融资故事、投资人匹配、BP 结构、里程碑和风险问答。",
      completionNote: "你已经把一单 A 轮 FA 材料从市场、亮点、投资人到 BP 跑通了。继续练投资人沟通节奏会更实战。",
    },
    groupName: "和桥资本 云巡科技 A 轮 FA 项目组",
    groupRoleLabel: "群聊 · BP / 投资人 / 路演",
    hrName: "和桥资本 HR",
    hrRoleLabel: "HR · 入职与制度",
    hrEmail: "hr@heqiaocap.com",
    hrFaq: "FA 项目资料、投资人名单和融资节奏严格保密。对外材料版本由项目经理统一确认。",
    groupReply: "项目简报和投资人名单已经同步。先把故事主线和投资人匹配逻辑搭起来。",
    completionLetterTitle: "和桥资本 · 模拟实习结业通知",
    tasks: [
      makeRuntimeTask("fa-drone-task-1", "低空经济与无人机巡检市场分析", "提交市场研究 Memo，分析政策背景、应用场景、需求来源和行业空间。", "别把低空经济总盘子直接当巡检市场。", "市场研究提示", "# Task 1\n从政策、场景、客户、竞争格局和采购周期判断市场。"),
      makeRuntimeTask("fa-drone-task-2", "公司商业模式与融资亮点梳理", "提交融资亮点表，说明客户价值、技术壁垒、收入模式和增长路径。", "融资亮点必须能被投资人验证。", "融资亮点提示", "# Task 2\n把硬件、服务和 SaaS 收入拆开，突出 traction 和续约。"),
      makeRuntimeTask("fa-drone-task-3", "投资人画像与推荐名单设计", "提交投资人匹配表，区分财务 VC、产业资本、政府基金和战略投资方。", "名单不是越多越好，要有优先级和推荐理由。", "投资人匹配提示", "# Task 3\n按投资阶段、关注方向、资源协同和决策周期给投资人排序。"),
      makeRuntimeTask("fa-drone-task-4", "A 轮融资 BP 核心页面设计", "提交融资 BP 摘要，包含市场机会、解决方案、商业模式和融资用途。", "BP 要把投资人 FAQ 提前写进去。", "BP 摘要提示", "# Task 4\n用 8-10 页结构写清市场、产品、客户、收入、壁垒、融资用途和风险问答。"),
    ],
  },
} as const satisfies Record<string, SimulationRuntime>;

export const getSimulationRuntime = (code?: string | null) => {
  const normalized = normalizeSimulationCode(code);
  return normalized ? runtimeMap[normalized] : runtimeMap["ibd-ipo"];
};

export const getConversationKind = (
  conversation: { name: string; is_group: boolean; role_label: string },
  simulationCode?: string | null,
): ConversationKind => {
  const runtime = getSimulationRuntime(simulationCode);
  if (conversation.is_group) return "group";
  if (conversation.name === runtime.hrName || /hr|人力/i.test(conversation.role_label)) return "hr";
  return "leader";
};

export const getTaskRuntime = (simulationCode: string | null | undefined, orderIndex: number) =>
  getSimulationRuntime(simulationCode).tasks[orderIndex];

export const getTaskMaterials = (simulationCode: string | null | undefined, orderIndex: number) =>
  (getTaskRuntime(simulationCode, orderIndex)?.materials ?? []).map((material) => ({
    ...material,
    url: toDataUrl(material.content),
  }));

export const getStarterKitAssets = (simulationCode?: string | null) =>
  starterKitAssetsBySimulation[normalizeSimulationCode(simulationCode)];

export const getGroupWelcomeNotice = (simulationCode?: string | null) =>
  groupWelcomeBySimulation[normalizeSimulationCode(simulationCode)];

export const getTaskReferenceContent = (simulationCode: string | null | undefined, orderIndex: number) => {
  const code = normalizeSimulationCode(simulationCode);
  const arr = taskReferenceContentBySimulation[code];
  const reference = arr?.[orderIndex] ?? null;
  if (!reference) return null;
  return {
    ...reference,
    standardAnswer: expandStandardAnswer(code, orderIndex, reference.standardAnswer),
  };
};

const DD_BUSINESS_APPENDIX = `| B-007 | 订单与在手项目 | 在手订单金额、预计交付周期、取消/延期订单比例 | 销售台账+项目排期 | 销售VP | 高 | W1 |
| B-008 | 产品迭代路线 | MSD-Net、AutoLabel 等核心产品版本演进及商业化节奏 | 产品路线图+版本发布记录 | 产品部 | 中 | W2 |
| B-009 | 售后与验收 | 验收标准、验收失败率、返工率、质保费用趋势 | 验收单+售后工单 | 交付部 | 高 | W1 |
| B-010 | 竞品替代风险 | 基恩士/康耐视低价产品线对重点客户报价影响 | 竞品报价+客户访谈 | 销售+战略 | 中 | W2 |
| B-011 | 渠道与区域 | 直销/经销收入拆分、区域集中度、经销商合规 | 经销协议+收入明细 | 销售运营 | 中 | W2 |
| B-012 | 数据合规 | 客户产线图片、缺陷样本数据的采集授权和使用边界 | 数据授权文件+合同条款 | 法务+技术 | 高 | W1 |`;

const DD_FINANCE_APPENDIX = `| F-005 | 经营现金流 | 净利润与经营现金流差异、应收和存货对现金流的拖累 | 现金流量表+科目明细 | 高 |
| F-006 | 存货与跌价 | 原材料、在产品、发出商品结构及跌价准备充分性 | 存货明细+库龄表 | 中 |
| F-007 | 收入截止性 | 年末集中发货/验收、期后退货和红冲情况 | 发货单+验收单+期后流水 | 高 |
| F-008 | 毛利率拆分 | 设备、算法授权、整体方案分产品毛利率及变动原因 | 成本核算表+项目毛利表 | 高 |
| F-009 | 税务风险 | 高新技术企业资格、研发加计扣除、增值税优惠合规性 | 税务申报表+优惠备案 | 中 |
| F-010 | 预测基础 | 2025E 收入、毛利率、费用率预测与在手订单匹配性 | 预算表+订单台账 | 中 |`;

const DD_LEGAL_TECH_APPENDIX = `## 法律尽调（共8项）

| 编号 | 调查事项 | 核查要点 | 资料来源 | 优先级 |
| --- | --- | --- | --- | --- |
| L-001 | 历史沿革 | 历次增资、股权转让、估值依据、工商登记一致性 | 工商档案+股东会决议 | 高 |
| L-002 | 实控人认定 | 实控人及一致行动关系、配偶供应商持股影响 | 股权结构图+访谈纪要 | 高 |
| L-003 | 关联交易 | 光瞳光电采购价格公允性、替代供应商和审批流程 | 采购合同+第三方报价 | 高 |
| L-004 | 知识产权 | 专利权属、软件著作权、核心代码权属和质押限制 | 专利证书+软著+代码归属声明 | 高 |
| L-005 | 竞业限制 | 离职研发人员协议签署、补偿支付、仲裁进展 | 劳动合同+仲裁材料 | 高 |
| L-006 | 重大合同 | Top10 客户合同关键条款、验收、违约和赔偿责任 | 销售合同+补充协议 | 中 |
| L-007 | 诉讼仲裁 | 未决诉讼、潜在纠纷、行政处罚和合规整改 | 法务台账+公开检索 | 中 |
| L-008 | 数据与保密 | 客户生产数据使用授权、数据留存、保密义务 | 数据处理协议+保密协议 | 高 |

## 技术尽调（共6项）

| 编号 | 调查事项 | 核查要点 | 资料来源 | 优先级 |
| --- | --- | --- | --- | --- |
| T-001 | 核心技术清单 | MSD-Net、AutoLabel 等核心模块功能、成熟度和应用客户 | 技术白皮书+项目清单 | 高 |
| T-002 | 科创属性指标 | 研发投入、研发人员、发明专利、收入增速、核心技术收入占比 | 研发台账+财务明细 | 高 |
| T-003 | 第三方测试 | 精度、召回率、误检率、部署周期等测试报告真实性 | CESI报告+测试样本说明 | 高 |
| T-004 | 底层平台依赖 | NVIDIA/Intel 依赖程度、国产算力适配进展和性能差距 | 适配测试报告+采购记录 | 中 |
| T-005 | 代码与模型资产 | 代码仓库权限、模型版本管理、训练数据来源和可复现性 | Git记录+模型管理平台 | 高 |
| T-006 | 技术人员稳定性 | 核心研发人员职责、替代安排、离职影响和知识交接 | 组织架构+访谈纪要 | 高 |

## 输出要求

- W1 结束前完成所有高优先级事项的一轮资料收集和访谈安排。
- 每个红旗项必须形成独立 memo，不能只停留在清单层面。
- 清单更新频率为每日收盘前一次，所有 open item 标明责任人、缺口资料和下一步动作。`;

const PROSPECTUS_CONTINUATION = `### 2.3 研发组织与核心人员

截至报告期末，公司研发人员 186 人，占员工总数 38.4%，其中硕士及以上学历人员 72 人。公司设置算法平台部、视觉系统部、工业软件部和应用交付实验室四个研发单元，研发管理采用项目制和代码评审双线控制。

报告期内，公司两名核心研发人员离职并加入竞品视衡科技。上述人员主要参与 MSD-Net 二代引擎局部模块开发，公司已完成代码权限回收、技术交接和竞业限制程序启动。公司核心算法架构、训练数据集、模型参数及主要知识产权均归属于公司，离职事项未对核心技术持续研发构成重大不利影响。

### 2.4 研发投入与科创属性

| 指标 | 2022年 | 2023年 | 2024年 | 判断 |
| --- | --- | --- | --- | --- |
| 研发投入（百万元） | 43.3 | 54.2 | 73.8 | 持续增长 |
| 研发投入占收入比例 | 13.6% | 13.5% | 14.3% | 高于行业平均 |
| 发明专利数量 | 18 | 23 | 28 | 稳步增加 |
| 核心技术收入占比 | 82% | 85% | 88% | 满足科创属性论证需要 |

公司研发投入主要用于缺陷检测算法迭代、工业软件平台化和国产算力适配。报告期内研发资本化率有所上升，公司已建立项目立项、技术可行性评审、阶段验收和摊销复核流程，相关资本化处理需结合项目资料、测试报告和会计政策进一步核验。

## 三、行业竞争地位

公司在国产工业视觉厂商中处于第二梯队前列，与天准科技、矩子科技等上市公司相比，公司收入体量较小，但 AI 算法平台收入占比更高，标准缺陷样本集测试精度具备一定优势。与基恩士、康耐视等外资厂商相比，公司在本地化交付、定制化模型训练和响应速度方面具有优势，但在全球品牌、渠道覆盖和产品标准化程度方面仍存在差距。

### 3.1 竞争优势

1. **AI 缺陷检测算法积累**：MSD-Net 在裂纹、划痕、色差等复杂缺陷识别上具备较高召回率。
2. **软硬一体交付能力**：公司可同时提供视觉设备、算法授权和产线改造方案，客户部署成本较低。
3. **重点客户验证**：公司已进入锂电、光伏、3C 电子头部客户供应体系，具备跨行业复制基础。
4. **本地化服务能力**：针对中国制造客户的小批量、多场景需求，公司响应速度优于外资标准化产品。

### 3.2 竞争劣势

1. **收入规模仍小于头部上市公司**：公司 2024 年收入 5.16 亿元，低于天准科技、奥普特等可比公司。
2. **客户集中度较高**：第一大客户账期延长已对经营现金流造成压力，后续需持续披露回款改善情况。
3. **海外收入占比偏低**：公司海外渠道和认证体系仍在建设中，短期内难以复制外资厂商全球化优势。
4. **底层算力平台仍有外部依赖**：国产算力适配已有进展，但推理性能和生态成熟度仍需继续验证。

## 四、收入确认与业务模式说明

公司主要采用验收确认收入。对于视觉检测设备销售，公司在设备交付、安装调试完成并取得客户验收单后确认收入；对于 AI 算法平台授权，公司根据合同约定的授权期限、交付节点及验收条款确认收入；对于整体解决方案，公司按照合同中设备、软件和服务的履约义务进行拆分，并在各项履约义务满足收入确认条件时分别确认。

报告期内，公司设备收入占比有所下降、算法平台收入占比持续提升，主要系存量设备客户追加算法授权、下游客户对低样本学习和快速部署需求增加所致。该变化不代表公司设备竞争力下降，但公司需持续披露设备订单、算法授权续费率及整体解决方案毛利率变化，以支撑收入结构改善的可持续性。

## 五、风险因素摘要

- **客户集中度及回款风险**：若主要客户延长账期或减少采购，公司经营现金流可能继续承压。
- **研发资本化判断风险**：若部分资本化项目未达到预期商业化效果，可能影响利润质量。
- **核心人员流失风险**：公司已建立交接和竞业限制机制，但高端算法人才竞争仍较激烈。
- **市场竞争加剧风险**：外资厂商低价产品线和国产厂商快速追赶可能压缩公司毛利率。
- **底层硬件平台供应风险**：若 GPU 供应、价格或国产替代进展不及预期，公司模型训练和交付效率可能受到影响。

## 六、本节结论

公司主营业务、核心技术和研发投入具备科创板申报所需的基本支撑，但仍需在招股书中充分披露客户集中度、现金流质量、核心人员变动、底层平台依赖和竞争劣势。正式申报稿应避免使用单纯宣传性表述，所有技术先进性判断均需对应第三方测试、客户验证或专利/软著等可核查证据。`;

const ROADSHOW_QA_CONTINUATION = `### Q4：实控人配偶持有供应商股权，关联交易公允性怎么证明？

**回答要点：**
1. 公司已将光瞳光电视同关联方管理，相关交易履行了内部审批和价格复核程序。
2. 同类镜头/光源采购已取得至少两家第三方报价，光瞳光电采购价格与市场价格差异在合理区间内。
3. 公司正在降低单一供应商依赖，2025 年已引入两家替代供应商，预计关联采购占比将继续下降。

**不能说的话：**
- ❌ "金额不大所以没影响" → 投资者会追问治理规范性
- ❌ "价格肯定公允" → 必须给第三方比价证据

---

### Q5：政府补助占利润比例较高，盈利质量是否依赖补助？

**回答要点：**
1. 2024 年政府补助占利润总额约 10.1%，较 2022 年明显下降，盈利对补助依赖度在降低。
2. 公司扣除政府补助后仍保持盈利，主营业务毛利率和净利率均呈改善趋势。
3. 后续利润增长主要来自算法平台收入占比提升和规模效应，而非补助增加。

---

### Q6：公司是否真正符合科创属性？

**回答要点：**
1. 公司 2024 年研发投入占收入比例 14.3%，高于多数设备类可比公司。
2. 公司拥有 28 项发明专利、34 项软件著作权，核心技术收入占比约 88%。
3. MSD-Net 和 AutoLabel 已在多个工业场景商业化，不是停留在实验室阶段。

---

### Q7：海外战略为什么现在才开始？

**回答要点：**
1. 公司此前优先验证国内头部客户场景，先完成产品稳定性和交付模型打磨。
2. 海外扩张会采取审慎路径，先从东南亚和欧洲存量设备客户的算法授权切入。
3. 海外收入短期不是估值核心，中期价值在于证明算法平台的可复制性。

---

### Q8：基恩士低价 AI 视觉产品会不会压缩公司空间？

**回答要点：**
1. 基恩士低价产品主要覆盖标准化场景，对公司中低复杂度设备会有价格压力。
2. 公司优势在复杂缺陷识别、定制化部署和本地服务，核心客户不是完全价格导向。
3. 公司已将中低端产品线模块化，预计可通过成本下降部分对冲价格压力。

---

### Q9：客户集中度高，第一大客户变化会怎样影响收入？

**回答要点：**
1. 第一大客户收入占比虽高，但公司 Top10 客户横跨锂电、3C、光伏和汽车零部件，场景正在分散。
2. 公司在手订单显示新客户占比提升，2025 年第一大客户收入占比预计下降。
3. 对重点客户，公司通过算法授权续费和产线扩展提升粘性，不只是一次性设备销售。

---

### Q10：募资用途为什么合理？是否存在过度扩产？

**回答要点：**
1. 募资重点不是单纯扩产，而是算法平台迭代、国产算力适配和应用场景实验室建设。
2. 产能建设与在手订单和客户试点需求匹配，不会一次性大规模铺开。
3. 研发投入对应科创属性和长期竞争力，销售服务网络用于缩短交付周期。

---

### Q11：估值 50–65 亿元是否过高？

**回答要点：**
1. 估值中枢基于可比公司 PS 和 EV/Revenue，考虑了公司净利率低于部分可比公司的现实。
2. 星瞳算法平台收入占比更高，若续费率和毛利率持续验证，PS 法能更好反映成长性。
3. Bear case 下按 7–8x PS 测算仍有估值支撑，估值不是只靠乐观情景。

---

### Q12：产品结构变化是否可持续？

**回答要点：**
1. 算法平台收入占比提升来自存量设备客户追加授权和新场景部署，不只是会计拆分。
2. 公司需要持续披露算法授权续费率、单客户扩展模块数和新场景部署周期。
3. 设备仍是入口，算法平台是利润率改善的关键，两者不是替代关系。

---

### Q13：行业周期下行会不会影响公司增长？

**回答要点：**
1. 光伏和部分 3C 客户投资节奏放缓会影响设备新增订单，这是需要承认的行业压力。
2. 公司正在提升锂电、汽车零部件和半导体客户占比，降低单一行业周期影响。
3. 算法授权和售后升级收入受新增产线周期影响相对较小，可提供一定缓冲。

---

### Q14：核心技术人员离职后，团队稳定性如何保证？

**回答要点：**
1. 公司核心技术以平台和代码体系沉淀，不依赖单一研发人员。
2. 离职人员涉及模块已完成交接，相关竞业限制程序正在执行。
3. 公司已补充 3 名资深研发，并通过代码评审、模型版本管理和权限控制降低人员流动风险。

---

### Q15：如果上市后收入增速放缓，投资者应该看什么指标？

**回答要点：**
1. 除收入增速外，应重点看算法平台收入占比、续费率、毛利率和经营现金流改善。
2. 若应收周转天数回落、扣非净利润保持增长，即使收入短期放缓，质量也在提升。
3. 公司会把增长重点从单纯设备销售转向高毛利算法授权和跨场景复制。

---

## 敏感问题处理原则

1. **先承认事实**：应收、资本化、关联交易、人员离职都不要回避。
2. **再给证据**：用合同、测试报告、第三方报价、同行数据支撑解释。
3. **最后引导亮点**：把问题引回算法平台、客户验证、毛利率改善和国产替代逻辑。
4. **控制节奏**：高敏感问题回答 60–90 秒，低敏感问题 30–45 秒即可。`;

function expandStandardAnswer(simulationCode: string, orderIndex: number, answer: string) {
  if (simulationCode !== "ibd-ipo") return answer;
  if (orderIndex === 1) {
    return answer
      .replace("（... 续6项略 ...）", DD_BUSINESS_APPENDIX)
      .replace("（... 续6项略 ...）", DD_FINANCE_APPENDIX)
      .replace("## 法律尽调（共8项）/ 技术尽调（共6项）\n（按上述格式展开，覆盖历史沿革、知识产权、竞业限制、核心技术清单、底层平台依赖等）", DD_LEGAL_TECH_APPENDIX);
  }
  if (orderIndex === 4) {
    return answer.replace("（章节续...）", PROSPECTUS_CONTINUATION);
  }
  if (orderIndex === 5) {
    return answer.replace("（Q4-Q15 按同样格式覆盖：关联交易、政府补助、科创属性、海外战略、基恩士竞争、客户集中度、募资用途、估值合理性、产品结构变化、行业周期影响等问题）", ROADSHOW_QA_CONTINUATION);
  }
  return answer;
}

export const getPhoneScript = (simulationCode?: string | null): import("@/data/immersive-content").PhoneScript | undefined => {
  const scripts = phoneScriptsBySimulation[normalizeSimulationCode(simulationCode)];
  return scripts?.[0];
};

const submissionLabel: Record<string, string> = {
  email: "邮件提交",
  chat_attachment: "聊天附件",
  image: "图片上传",
  unknown: "未识别提交",
};

export const evaluateSubmission = ({
  task,
  simulationCode,
  submission,
}: {
  task: {
    title: string;
    score: number;
    requirements: string[];
    feedback_message: string;
    scoring_rubric: { dim: string; score: number; max: number }[];
    boss_commentary: string;
  };
  simulationCode?: string | null;
  submission: SubmissionRecord;
}): SubmissionEvaluation => {
  const taskRuntime = getTaskRuntime(simulationCode, (task as any).order_index ?? 0);
  const detectedType =
    submission.kind === "email"
      ? "email"
      : submission.kind === "image"
        ? "image"
        : "chat_attachment";
  const ext = extOf(submission.filename) || extOf(submission.subject);
  const hasFormalAttachment = Boolean(submission.fileUrl || submission.filename || submission.subject);
  const matchesExt =
    detectedType === "image"
      ? true
      : Boolean(ext) &&
        (taskRuntime.allowedExtensions.length === 0 || taskRuntime.allowedExtensions.includes(ext));
  // For email submissions: allow pass even without a matching extension if there's a subject (the email itself is the deliverable)
  const emailPassthrough = detectedType === "email" && Boolean(submission.subject);
  const pass = hasFormalAttachment && (matchesExt || emailPassthrough);

  if (!pass) {
    const summary = `${taskRuntime.retryTemplate} 请按要求重新提交。`;
    return {
      submissionType: detectedType,
      quality: "retry",
      score: null,
      summary,
      leaderMessage: summary,
      detailMarkdown: `### 判定结果\n- 当前状态：已收到提交，但暂不能判定完成\n- 任务要求：${taskRuntime.minimumRequirement}\n- 本次提交：${submissionLabel[detectedType] ?? submissionLabel.unknown}${ext ? ` · .${ext}` : ""}\n\n### 为什么需要重交\n- 需要一个可判读的正式附件\n- 可接受附件格式：${taskRuntime.allowedExtensions.map((item) => `.${item}`).join("、")}${taskRuntime.allowedExtensions.length ? "" : "（不限）"}\n- 当前任务最低标准：${taskRuntime.minimumRequirement}\n\n### 重交建议\n- ${taskRuntime.retryTemplate}\n- 补齐后重新提交即可，不会影响后续任务继续推进。`,
    };
  }

  const summary = `${taskRuntime.passTemplate} ${task.feedback_message}`;
  return {
    submissionType: detectedType,
    quality: "pass",
    score: task.score,
    summary,
    leaderMessage: summary,
    detailMarkdown: `### 判定结果\n- 当前状态：已命中最低提交要求\n- 提交附件：${submissionLabel[detectedType]}${ext ? ` · .${ext}` : ""}\n- 最低标准：${taskRuntime.minimumRequirement}\n\n### 评分拆解\n| 维度 | 得分 |\n| --- | --- |\n${task.scoring_rubric.map((item) => `| ${item.dim} | ${item.score} / ${item.max} |`).join("\n")}\n\n### 上级反馈\n${task.boss_commentary}\n\n### 下一轮继续补强\n- ${taskRuntime.passTemplate}\n- ${task.requirements[0] ?? "继续按结构化方式提交"}`,
  };
};

export const getAutomatedReply = ({
  conversationKind,
  simulationCode,
  text,
  activeTask,
}: {
  conversationKind: ConversationKind;
  simulationCode?: string | null;
  text: string;
  activeTask?: { title: string; deadline_hours: number } | null;
}) => {
  const runtime = getSimulationRuntime(simulationCode);
  const normalized = text.trim();

  if (!normalized) return null;

  if (conversationKind === "group") {
    if (/资料|模板|共享盘|底稿|目录|数据库/i.test(normalized)) {
      return {
        delayMs: 4200,
        content: `${runtime.groupReply}${activeTask ? ` 当前任务先看《${activeTask.title}》对应资料包。` : ""}`,
      };
    }
    if (/deadline|ddl|截止|什么时候/i.test(normalized) && activeTask) {
      return {
        delayMs: 3200,
        content: `当前任务先按 ${activeTask.deadline_hours} 小时内回传来排。资料已经补齐，先开工。`,
      };
    }
    return {
      delayMs: 3600,
      content: "收到。我把相关模板和资料目录保持在群里，缺哪块直接说具体文件。",
    };
  }

  if (conversationKind === "hr") {
    if (/保密|制度|合规/i.test(normalized)) {
      return { delayMs: 2800, content: "保密、合规和资料使用边界都在入职包里，涉及客户信息的材料不要外传或二次分发。" };
    }
    if (/邮箱|共享盘|账号|权限/i.test(normalized)) {
      return { delayMs: 2500, content: "邮箱和共享盘权限都已开通。如遇到权限异常，把报错截图发我，我帮你处理。" };
    }
    return { delayMs: 2600, content: runtime.hrFaq };
  }

  if (/下一步|下一个任务|接下来/i.test(normalized) && activeTask) {
    return {
      delayMs: 3200,
      content: `先把手上这项《${activeTask.title}》收干净，再往下走。材料和最低要求都已经给你了。`,
    };
  }

  if (/收到|看一下|已发|辛苦/i.test(normalized)) {
    return { delayMs: 2400, content: "嗯，收到了。我这边过一下，有结论再回你。" };
  }

  return null;
};
