/**
 * Certificate page — Forage 风格的统一证书。
 *
 * 视觉规则：
 *  - 白底深字，A4 横版，可作为 PDF 打印 / 分享
 *  - 顶部统一品牌：RuHang + 项目方文字 logo（占位，后续替换 PNG/SVG）
 *  - 中间：证书标题 + 学员姓名 + 项目 + 完成日期
 *  - 下方：技能列表（"在本项目中你证明了你掌握了"）
 *  - 底部：项目方签名人、RuHang 签名人、证书唯一编号
 *
 * 业务规则：
 *  - 进入此页需要项目处于 completed 状态
 *  - 必须先填 post_simulation_surveys 才能查看（老用户补填）
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Download, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { getCatalogEntryByCode } from "@/data/simulation-catalog";
import { getPostSimulationSurvey } from "@/lib/feedback";
import { PostSimulationSurvey } from "@/components/feedback/PostSimulationSurvey";
import { AbilitySummaryCard } from "@/components/certificate/AbilitySummaryCard";
import { getPreferredDisplayName } from "@/lib/settings";
import { toast } from "sonner";

type CertData = {
  userSimulationId: string;
  simulationCode: string;
  simulationTitle: string;
  simulationCompany: string;
  completedAt: string;
};

export default function Certificate() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const nav = useNavigate();
  const certRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CertData | null>(null);
  const [needsPostSurvey, setNeedsPostSurvey] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const learnerName = useMemo(
    () => getPreferredDisplayName(profile ?? null, user?.email) ?? "RuHang 学员",
    [profile, user],
  );
  const catalog = data ? getCatalogEntryByCode(data.simulationCode) : null;

  useEffect(() => {
    document.title = "结业证书 · 入行 RuHang";
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!user || !id) return;
      setLoading(true);

      const { data: us } = await supabase
        .from("user_simulations")
        .select(
          "id, status, completed_at, simulation:simulations(code, title, company)",
        )
        .eq("user_id", user.id)
        .eq("simulation_id", id)
        .maybeSingle();

      if (!us || us.status !== "completed") {
        toast.error("还没有完成这个项目，无法查看证书");
        nav("/dashboard", { replace: true });
        return;
      }

      const cert: CertData = {
        userSimulationId: us.id,
        simulationCode: (us.simulation as any)?.code ?? "",
        simulationTitle: (us.simulation as any)?.title ?? "",
        simulationCompany: (us.simulation as any)?.company ?? "",
        completedAt: (us as any).completed_at ?? new Date().toISOString(),
      };
      setData(cert);

      // 检查是否已填出项问卷
      try {
        const survey = await getPostSimulationSurvey(us.id);
        setNeedsPostSurvey(!survey);
      } catch (error) {
        console.error("[Certificate] survey check failed:", error);
      }
      setLoading(false);
    };
    void load();
  }, [user, id, nav]);

  const certNumber = useMemo(() => {
    if (!data) return "";
    // 生成稳定的证书编号：取 user_simulation_id 的前 8 位 + 完成时间戳
    const idPart = data.userSimulationId.replace(/-/g, "").slice(0, 8).toUpperCase();
    const datePart = new Date(data.completedAt).toISOString().slice(0, 10).replace(/-/g, "");
    return `RH-${datePart}-${idPart}`;
  }, [data]);

  const completedDate = useMemo(() => {
    if (!data) return "";
    return new Date(data.completedAt).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [data]);

  const handleDownload = async () => {
    if (!certRef.current || !data) return;
    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const filename = `RuHang_${data.simulationCompany}_结业证书.pdf`;
      await html2pdf()
        .set({
          margin: 0,
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
        })
        .from(certRef.current)
        .save();
    } catch (error) {
      console.error("[Certificate] PDF generation failed:", error);
      toast.error("PDF 生成失败，可以试试浏览器打印");
    } finally {
      setDownloading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* 顶部操作栏 */}
      <div className="sticky top-0 z-20 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => nav("/dashboard")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回控制台
          </Button>
          <Button
            type="button"
            onClick={handleDownload}
            disabled={downloading || needsPostSurvey}
            className="bg-gradient-gold text-primary-foreground hover:opacity-95"
          >
            {downloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {downloading ? "生成中" : "下载 PDF"}
          </Button>
        </div>
      </div>

      {/* 证书容器（A4 横版 297×210mm） */}
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto" style={{ maxWidth: 1100 }}>
          <div
            ref={certRef}
            className="relative mx-auto bg-white text-slate-900 shadow-2xl"
            style={{
              aspectRatio: "297 / 210",
              fontFamily: '"Playfair Display", "Source Han Serif SC", "Noto Serif SC", serif',
            }}
          >
            {/* 边框装饰 */}
            <div
              className="absolute pointer-events-none"
              style={{
                inset: "12px",
                border: "1px solid #c9a84c",
              }}
            />
            <div
              className="absolute pointer-events-none"
              style={{
                inset: "20px",
                border: "3px solid #c9a84c",
              }}
            />

            {/* 角落装饰 */}
            {[
              { top: 20, left: 20 },
              { top: 20, right: 20 },
              { bottom: 20, left: 20 },
              { bottom: 20, right: 20 },
            ].map((pos, i) => (
              <div
                key={i}
                className="absolute pointer-events-none"
                style={{
                  ...pos,
                  width: 60,
                  height: 60,
                  border: "1px solid #c9a84c",
                  background:
                    "repeating-linear-gradient(45deg, #c9a84c20 0, #c9a84c20 2px, transparent 2px, transparent 6px)",
                }}
              />
            ))}

            {/* 内容 */}
            <div
              className="relative flex h-full flex-col"
              style={{ padding: "60px 80px" }}
            >
              {/* 顶部 brand：RuHang + 项目方 logo */}
              <div className="flex items-start justify-between">
                <div>
                  <div
                    style={{
                      fontFamily: '"Playfair Display", serif',
                      fontSize: 14,
                      letterSpacing: "0.4em",
                      color: "#c9a84c",
                      fontWeight: 600,
                    }}
                  >
                    RUHANG
                  </div>
                  <div style={{ fontSize: 10, color: "#94908a", marginTop: 2, letterSpacing: "0.15em" }}>
                    入行 · 沉浸式金融训练平台
                  </div>
                </div>
                <div className="text-right">
                  <div
                    style={{
                      fontFamily: '"Playfair Display", serif',
                      fontSize: 14,
                      letterSpacing: "0.3em",
                      color: "#1a1a2e",
                      fontWeight: 600,
                    }}
                  >
                    {/* TODO: 接入项目方 PNG/SVG logo，目前用文字占位 */}
                    {(catalog?.companyLogoText ?? data.simulationCompany).toUpperCase()}
                  </div>
                  <div style={{ fontSize: 10, color: "#94908a", marginTop: 2, letterSpacing: "0.15em" }}>
                    {catalog?.companyLogoText ?? data.simulationCompany}
                  </div>
                </div>
              </div>

              {/* 主标题 */}
              <div className="text-center" style={{ marginTop: 36 }}>
                <div
                  style={{
                    fontSize: 13,
                    letterSpacing: "0.5em",
                    color: "#c9a84c",
                    fontWeight: 600,
                  }}
                >
                  CERTIFICATE OF COMPLETION
                </div>
                <div
                  style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: 38,
                    fontWeight: 700,
                    color: "#1a1a2e",
                    marginTop: 6,
                    letterSpacing: "0.05em",
                  }}
                >
                  Job Simulation Certificate
                </div>
                <div style={{ fontSize: 13, color: "#666", marginTop: 6 }}>
                  本证书由 RuHang 颁发，证明以下学员已完成全部模拟任务
                </div>
              </div>

              {/* 学员姓名 */}
              <div className="text-center" style={{ marginTop: 28 }}>
                <div style={{ fontSize: 11, color: "#94908a", letterSpacing: "0.2em" }}>
                  THIS IS TO CERTIFY THAT
                </div>
                <div
                  style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: 44,
                    fontWeight: 700,
                    color: "#1a1a2e",
                    marginTop: 8,
                    borderBottom: "2px solid #c9a84c",
                    display: "inline-block",
                    padding: "0 40px 6px",
                  }}
                >
                  {learnerName}
                </div>
              </div>

              {/* 项目说明 */}
              <div className="text-center" style={{ marginTop: 18, padding: "0 60px" }}>
                <div style={{ fontSize: 13, color: "#444", lineHeight: 1.7 }}>
                  has successfully completed the practical job simulation
                </div>
                <div
                  style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: 20,
                    fontWeight: 600,
                    color: "#1a1a2e",
                    marginTop: 6,
                  }}
                >
                  {data.simulationTitle}
                </div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                  作为 {data.simulationCompany} 的{catalog?.role ?? "实习分析师"}，完成了真实工作流程的全部任务
                </div>
              </div>

              {/* 技能列表 */}
              {catalog?.skills?.length ? (
                <div style={{ marginTop: 22, padding: "0 60px" }}>
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.2em",
                      color: "#c9a84c",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    SKILLS DEMONSTRATED
                  </div>
                  <div
                    className="flex flex-wrap items-center justify-center gap-2"
                    style={{ marginTop: 10 }}
                  >
                    {catalog.skills.map((skill) => (
                      <span
                        key={skill}
                        style={{
                          fontSize: 11,
                          color: "#1a1a2e",
                          padding: "5px 14px",
                          border: "1px solid #c9a84c",
                          borderRadius: 999,
                          background: "#faf6ec",
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* 底部签名区 */}
              <div
                className="flex items-end justify-between"
                style={{ marginTop: "auto", paddingTop: 30 }}
              >
                {/* 左：项目方签名 */}
                <div style={{ minWidth: 200 }}>
                  <div
                    style={{
                      fontFamily: '"Playfair Display", serif',
                      fontSize: 22,
                      fontStyle: "italic",
                      color: "#1a1a2e",
                      borderBottom: "1px solid #c9a84c",
                      paddingBottom: 4,
                    }}
                  >
                    {catalog?.signoffName ?? "项目负责人"}
                  </div>
                  <div style={{ fontSize: 10, color: "#666", marginTop: 6 }}>
                    {catalog?.signoffTitle ?? data.simulationCompany}
                  </div>
                </div>

                {/* 中：日期 + 编号 */}
                <div className="text-center">
                  <div
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: "50%",
                      border: "2px solid #c9a84c",
                      margin: "0 auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#faf6ec",
                    }}
                  >
                    <div className="text-center">
                      <div
                        style={{
                          fontFamily: '"Playfair Display", serif',
                          fontSize: 11,
                          letterSpacing: "0.15em",
                          color: "#c9a84c",
                          fontWeight: 700,
                        }}
                      >
                        VERIFIED
                      </div>
                      <div style={{ fontSize: 9, color: "#666", marginTop: 2 }}>
                        RuHang
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: "#94908a", marginTop: 8, letterSpacing: "0.1em" }}>
                    {certNumber}
                  </div>
                </div>

                {/* 右：RuHang 签名 + 日期 */}
                <div className="text-right" style={{ minWidth: 200 }}>
                  <div
                    style={{
                      fontFamily: '"Playfair Display", serif',
                      fontSize: 22,
                      fontStyle: "italic",
                      color: "#1a1a2e",
                      borderBottom: "1px solid #c9a84c",
                      paddingBottom: 4,
                    }}
                  >
                    RuHang Team
                  </div>
                  <div style={{ fontSize: 10, color: "#666", marginTop: 6 }}>
                    完成日期 · {completedDate}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 证书下方说明 */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              证书编号 {certNumber} · 可在 RuHang 后台核验
            </div>
            <div>支持 LinkedIn / 简历 / 朋友圈分享</div>
          </div>

          {/* AI 能力画像（结业后由 MiMo 生成） */}
          {!needsPostSurvey && (
            <AbilitySummaryCard
              userSimulationId={data.userSimulationId}
              simulationTitle={data.simulationTitle}
            />
          )}
        </div>
      </div>

      {/* 出项问卷拦截：必须填完才能下载 */}
      {needsPostSurvey && (
        <PostSimulationSurvey
          open
          userSimulationId={data.userSimulationId}
          simulationCode={data.simulationCode}
          simulationTitle={data.simulationTitle}
          onSubmitted={() => setNeedsPostSurvey(false)}
        />
      )}
    </div>
  );
}
