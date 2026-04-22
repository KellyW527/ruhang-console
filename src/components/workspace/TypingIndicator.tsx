import { Mail, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

export function TypingIndicator({
  role,
  label,
}: {
  role: "leader" | "group" | "hr";
  label: string;
}) {
  if (role === "group") {
    return (
      <div className="flex items-center gap-2 text-xs text-sky-300">
        <Settings className="h-3.5 w-3.5 animate-spin" />
        <span>{label}</span>
      </div>
    );
  }

  if (role === "hr") {
    return (
      <div className="flex items-center gap-2 text-xs text-fuchsia-300">
        <Mail className="h-3.5 w-3.5 animate-bounce" />
        <span>{label}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-primary">
      <div className="flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse-dot" />
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse-dot [animation-delay:120ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse-dot [animation-delay:240ms]" />
      </div>
      <span className={cn("text-xs text-muted-foreground", "text-primary")}>{label}</span>
    </div>
  );
}
