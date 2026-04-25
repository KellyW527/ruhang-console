/**
 * CertificateWall — Dashboard 上展示用户已获得的全部结业证书。
 * 数据源：user_simulations 里 status='completed' 的项目。
 * 点击卡片跳到 /simulation/:id/certificate。
 */

import { Link } from "react-router-dom";
import { Award, Download, ArrowRight } from "lucide-react";
import { getCatalogEntryByCode } from "@/data/simulation-catalog";

type CompletedSim = {
  id: string;
  completed_at?: string | null;
  simulation: {
    id: string;
    code: string;
    title: string;
    company: string;
    cover_emoji: string;
  };
};

export function CertificateWall({ completed }: { completed: CompletedSim[] }) {
  return (
    <section className="glass rounded-[32px] border-white/10 p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="eyebrow flex items-center gap-2">
            <Award className="h-3.5 w-3.5" />
            证书墙
          </div>
          <h2 className="mt-2 font-display text-2xl font-semibold">
            你已获得的结业证书
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            完成项目即可领取统一格式的 PDF 证书，可用于简历、LinkedIn 或社交分享。
          </p>
        </div>
        {completed.length > 0 && (
          <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
            {completed.length} 张
          </div>
        )}
      </div>

      {completed.length === 0 ? (
        <div className="mt-5 flex flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-14 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Award className="h-5 w-5" />
          </div>
          <div className="font-display text-base font-medium text-white">
            完成第一个项目即可获得证书
          </div>
          <div className="mt-1.5 max-w-sm text-sm leading-7 text-muted-foreground">
            走完任意一条模拟线的全部任务，这里会出现一张可下载的统一格式证书。
          </div>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {completed.map((row) => {
            const catalog = getCatalogEntryByCode(row.simulation.code);
            const completedDate = row.completed_at
              ? new Date(row.completed_at).toLocaleDateString("zh-CN")
              : "";
            return (
              <Link
                key={row.id}
                to={`/simulation/${row.simulation.id}/certificate`}
                className="group relative flex flex-col overflow-hidden rounded-[24px] border border-primary/15 bg-white/[0.03] backdrop-blur-xl transition hover:border-primary/40"
              >
                {/* 缩略图：模拟一张证书的简化预览 */}
                <div className="relative aspect-[3/2] overflow-hidden bg-white p-4">
                  <div
                    className="absolute pointer-events-none"
                    style={{ inset: 8, border: "1px solid #c9a84c" }}
                  />
                  <div
                    className="absolute pointer-events-none"
                    style={{ inset: 12, border: "2px solid #c9a84c" }}
                  />
                  <div className="relative flex h-full flex-col items-center justify-center text-center text-slate-900">
                    <div
                      className="text-[8px] font-semibold tracking-[0.3em] text-[#c9a84c]"
                      style={{ fontFamily: '"Playfair Display", serif' }}
                    >
                      RUHANG
                    </div>
                    <div
                      className="mt-1 text-xs font-bold"
                      style={{ fontFamily: '"Playfair Display", serif' }}
                    >
                      Certificate of Completion
                    </div>
                    <div className="mt-2 text-[10px] text-slate-600">
                      {(catalog?.companyLogoText ?? row.simulation.company)}
                    </div>
                    <div className="mt-1 line-clamp-2 px-4 text-[10px] text-slate-500">
                      {row.simulation.title}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-white/5 bg-black/10 px-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">
                      {row.simulation.company}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {completedDate || "已完成"}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] text-primary transition group-hover:bg-primary/20">
                    <Download className="h-3 w-3" />
                    查看
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
