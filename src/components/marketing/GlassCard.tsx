import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gold";
  children: React.ReactNode;
}

export function GlassCard({ variant = "default", className, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        variant === "gold" ? "glass-card-gold" : "glass-card",
        "p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
