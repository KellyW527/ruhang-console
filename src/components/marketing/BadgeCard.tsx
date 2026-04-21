import { GlassCard } from "./GlassCard";
import { Award } from "lucide-react";

interface BadgeCardProps {
  name: string;
  description: string;
  earned?: boolean;
}

export function BadgeCard({ name, description, earned = false }: BadgeCardProps) {
  return (
    <GlassCard
      variant={earned ? "gold" : "default"}
      className={`p-4 text-center min-w-[140px] ${!earned ? "opacity-50" : ""}`}
    >
      <div className={`h-12 w-12 mx-auto rounded-full flex items-center justify-center ${
        earned ? "bg-primary/20" : "bg-muted"
      }`}>
        <Award className={`h-6 w-6 ${earned ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <p className="text-sm font-medium text-foreground mt-3">{name}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </GlassCard>
  );
}
