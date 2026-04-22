import { type LucideIcon } from "lucide-react";

interface TrackCardProps {
  icon: LucideIcon;
  tag: string;
  title: string;
  desc: string;
  tasks: string[];
  pro?: boolean;
}

export function TrackCard({ icon: Icon, tag, title, desc, tasks, pro }: TrackCardProps) {
  return (
    <div className="glass group relative flex flex-col overflow-hidden rounded-2xl p-6 transition hover:border-primary/30">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary transition group-hover:bg-gradient-gold group-hover:text-primary-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex gap-1.5">
          <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-primary">
            {tag}
          </span>
          {pro && <span className="badge-pro rounded-full px-2 py-0.5 text-[10px]">PRO</span>}
        </div>
      </div>

      <h3 className="font-display text-xl font-semibold leading-snug">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{desc}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {tasks.map((t) => (
          <span key={t} className="rounded-full border border-border bg-secondary/40 px-2.5 py-0.5 text-[11px] text-muted-foreground">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
