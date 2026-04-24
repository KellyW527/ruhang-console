-- ===========================================================
-- 新增模拟项目：华兴并购 · 京北数码 M&A 买方组（ma-buyside）
-- 文件位置：db/migrations/2026-04-24_add_ma_buyside_simulation.sql
-- 适用于 RuHang 后端（KellyW527/RuHang_Final）
-- 在 Supabase / Lovable Cloud SQL editor 中按顺序执行即可。
-- ===========================================================

-- 1) 插入 simulations 行
INSERT INTO public.simulations
  (code, title, company, role, track, description, is_pro, cover_emoji, duration_label)
VALUES
  (
    'ma-buyside',
    '华兴并购 · 京北数码买方组',
    '华兴并购',
    '买方并购分析师',
    'M&A 并购',
    '加入华兴并购 M&A 组，跟随 VP 沈承宇为客户鸿华百货完成京北数码 100% 收购的估值与材料：从 Target Profile、五年利润表预测、Trading Comps 到收购后战略备忘，体验真实的买方并购节奏。',
    true,
    '🤝',
    '约 2-3 周'
  )
ON CONFLICT (code) DO UPDATE SET
  title       = EXCLUDED.title,
  company     = EXCLUDED.company,
  role        = EXCLUDED.role,
  track       = EXCLUDED.track,
  description = EXCLUDED.description,
  is_pro      = EXCLUDED.is_pro,
  cover_emoji = EXCLUDED.cover_emoji,
  duration_label = EXCLUDED.duration_label
RETURNING id;

-- 2) 插入 4 个任务
WITH sim AS (SELECT id FROM public.simulations WHERE code = 'ma-buyside')
INSERT INTO public.tasks
  (simulation_id, order_index, title, brief, requirements, deadline_hours,
   assignment_message, feedback_message, score, scoring_rubric, standard_answer, boss_commentary)
VALUES
  -- Task 1: Target Profile + EV
  (
    (SELECT id FROM sim), 0,
    '京北数码 Target Profile 与 EV 测算',
    '客户鸿华百货拟收购京北数码，请基于项目简报和财务数据包，输出一份 Target Profile：业务概述、股权结构、管理层、Enterprise Value 计算、初步交易考虑。建议用 PPT 或文档形式提交。',
    '["一页核心数据含市值/EV/52周区间/FY24关键财务", "业务结构按 4 条业务线拆分含毛利率与趋势", "股权结构含 Top 5 股东与核心管理层", "EV 计算公式拆开列出（市值 + 有息负债 - 现金）", "初步交易考虑给出明确折价/溢价判断"]'::jsonb,
    24,
    '小李，先帮我把京北数码的 Target Profile 跑出来。客户那边明天要看，重点是 EV 算清楚、业务结构看明白、给出初步折价判断。模板和数据包都在共享盘 /京北数码M&A/ 下。',
    '这版至少能给客户看了。EV 算对了，业务结构也基本到位。下一轮把折价判断写得更直接，加上同行对比。',
    82,
    '[{"dim":"结构完整度","score":18,"max":20},{"dim":"EV 计算准确性","score":20,"max":20},{"dim":"业务结构理解","score":17,"max":20},{"dim":"判断与洞察","score":15,"max":20},{"dim":"格式与可读性","score":12,"max":20}]'::jsonb,
    '见 immersive-content.ts ma-buyside.0.standardAnswer',
    '见 immersive-content.ts ma-buyside.0.analysis'
  ),
  -- Task 2: 5-Year IS Forecast
  (
    (SELECT id FROM sim), 1,
    '京北数码五年利润表预测（FY22A–FY27E）',
    '基于 FY22-FY24 实际数据，建模 FY25E-FY27E 利润表预测。重点关注 FY25E D&A 跳升对净利润的短期影响，剥离 D&A 看经营性 EBITDA 改善趋势。提交 Excel 模型。',
    '["利润表覆盖 FY22A 至 FY27E 六年", "关键假设（增速/毛利率/D&A/费率）单独列出", "EBITDA 与净利润分别预测", "标识 FY25E D&A 跳升至 ¥256M 对净利润的影响", "建议至少 1 个 downside 情景"]'::jsonb,
    36,
    '现在做第二项：把 FY25-27 利润表预测拉出来。重点提醒——千店数字化改造 FY25 起进摊销期，D&A 会跳升 50% 以上，净利润短期会回落。模型里要把这层一次性影响和经营性 EBITDA 拆开讲。',
    '骨架立起来了，D&A 跳升那块也注意到了。下一轮把 D&A 一次性影响和经营性 EBITDA 拆开讲，结论会更稳。',
    85,
    '[{"dim":"假设合理性","score":17,"max":20},{"dim":"模型完整度","score":18,"max":20},{"dim":"D&A 处理","score":19,"max":20},{"dim":"敏感性意识","score":14,"max":20},{"dim":"输出可读性","score":17,"max":20}]'::jsonb,
    '见 immersive-content.ts ma-buyside.1.standardAnswer',
    '见 immersive-content.ts ma-buyside.1.analysis'
  ),
  -- Task 3: Trading Comps
  (
    (SELECT id FROM sim), 2,
    '京北数码 Trading Comps 估值与折价分析',
    '与 7 家可比零售企业对比，输出 EV/Revenue、EV/EBITDA 倍数表、均值/中位数，并给出"折价是合理还是机会"的判断。京东作为平台型电商需单独标注。提交 Excel + 折价分析说明。',
    '["7 家可比公司 EV 计算正确", "EV/Rev 与 EV/EBITDA 双倍数", "均值与中位数同时呈现", "京东等平台型公司单独标注口径", "折价分析给出'合理 vs 机会'拆分判断", "协同效应估值给出量化区间"]'::jsonb,
    36,
    '第三项：spread 一份京北的 comps。可比池我已经选好 7 家放群里了，京东必须放进去但要单独标注（平台型）。客户最关心的是这个折价是合理还是机会，结论先行。',
    'comps 跑通了，折价判断也敢下结论。下一轮把口径统一、加 LTM/NTM 双口径、协同效应分 base/bull/bear。',
    87,
    '[{"dim":"可比池选择","score":18,"max":20},{"dim":"倍数计算准确性","score":19,"max":20},{"dim":"折价判断","score":18,"max":20},{"dim":"协同估值","score":16,"max":20},{"dim":"格式与口径一致性","score":16,"max":20}]'::jsonb,
    '见 immersive-content.ts ma-buyside.2.standardAnswer',
    '见 immersive-content.ts ma-buyside.2.analysis'
  ),
  -- Task 4: Strategic Memo
  (
    (SELECT id FROM sim), 3,
    '京北数码收购后战略备忘录（≤200 字）',
    '基于行业资料，撰写 ≤200 字的收购后战略备忘录。覆盖 3 个候选投入方向（出行电气化 / 健康科技与智能家居 / 户外生活方式），给出明确排序、量化收入预期、资本投入比例。',
    '["排序明确，不允许并列", "三个方向都给量化收入预期（2-3 年内）", "资本投入比例显式给出", "至少 1 句证据支撑（数据/政策/趋势）", "全文 ≤200 字"]'::jsonb,
    24,
    '最后一项：写一份给客户的战略备忘，200 字以内。三个候选方向：出行电气化、健康科技/智能家居、户外。要排序、要量化、要资本配比。客户看 memo 是看判断不是看材料。',
    '排序清楚、有量化、有配比。下一轮把"明确不做的方向"也写一句，战略本质是放弃。',
    88,
    '[{"dim":"判断明确性","score":19,"max":20},{"dim":"量化与证据","score":17,"max":20},{"dim":"客户视角","score":18,"max":20},{"dim":"语言精炼","score":17,"max":20},{"dim":"战略选择意识","score":17,"max":20}]'::jsonb,
    '见 immersive-content.ts ma-buyside.3.standardAnswer',
    '见 immersive-content.ts ma-buyside.3.analysis'
  )
ON CONFLICT (simulation_id, order_index) DO UPDATE SET
  title             = EXCLUDED.title,
  brief             = EXCLUDED.brief,
  requirements      = EXCLUDED.requirements,
  deadline_hours    = EXCLUDED.deadline_hours,
  assignment_message = EXCLUDED.assignment_message,
  feedback_message  = EXCLUDED.feedback_message,
  score             = EXCLUDED.score,
  scoring_rubric    = EXCLUDED.scoring_rubric;

-- 3) 校验
SELECT s.code, s.title, COUNT(t.id) AS task_count
FROM public.simulations s
LEFT JOIN public.tasks t ON t.simulation_id = s.id
WHERE s.code = 'ma-buyside'
GROUP BY s.code, s.title;
-- 期望输出：ma-buyside | 华兴并购 · 京北数码买方组 | 4
