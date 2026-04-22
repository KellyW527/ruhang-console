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
  const arr = taskReferenceContentBySimulation[normalizeSimulationCode(simulationCode)];
  return arr?.[orderIndex] ?? null;
};

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
