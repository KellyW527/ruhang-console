import { GlassCard } from "./GlassCard";
import { Badge } from "@/components/ui/badge";
import { type LucideIcon } from "lucide-react";

interface TrackCardProps {
  title: string;
  description: string;
  difficulty: "初级" | "中级" | "高级";
  icon: LucideIcon;
  features: string[];
}

const difficultyColors = {
  "初级": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "中级": "bg-primary/20 text-primary border-primary/30",
  "高级": "bg-red-500/20 text-red-400 border-red-500/30",
};

export function TrackCard({ title, description, difficulty, icon: Icon, features }: TrackCardProps) {
  return (
    <GlassCard variant="gold" className="p-0 overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
      <div className="p-8 space-y-5">
        <div className="flex items-start justify-between">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <Badge className={`${difficultyColors[difficulty]} text-xs border`}>{difficulty}</Badge>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-display font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>

        <ul className="space-y-2">
          {features.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="h-1 w-full gradient-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </GlassCard>
  );
}
