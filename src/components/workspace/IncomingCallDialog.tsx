import { useEffect, useMemo, useState } from "react";
import { Mic, Phone, PhoneOff, Volume2 } from "lucide-react";

import type { PhoneScript } from "@/data/immersive-content";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Phase = "ringing" | "active" | "ended";

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
};

export function IncomingCallDialog({
  open,
  callerName,
  callerRole,
  script,
  onOpenChange,
  onEnded,
}: {
  open: boolean;
  callerName: string;
  callerRole: string;
  script?: PhoneScript | null;
  onOpenChange: (open: boolean) => void;
  onEnded?: (durationSeconds: number, script?: PhoneScript | null) => void;
}) {
  const [phase, setPhase] = useState<Phase>("ringing");
  const [seconds, setSeconds] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      setPhase("ringing");
      setSeconds(0);
      setLineIndex(0);
      return;
    }
  }, [open]);

  useEffect(() => {
    if (!open || phase !== "active") return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [open, phase]);

  useEffect(() => {
    if (!open || phase !== "active" || !script?.lines?.length) return;
    const timer = window.setInterval(() => {
      setLineIndex((value) => Math.min(value + 1, script.lines.length - 1));
    }, 2600);
    return () => window.clearInterval(timer);
  }, [open, phase, script]);

  const waveform = useMemo(
    () => Array.from({ length: 30 }, (_, index) => 6 + ((index * 17) % 32)),
    [],
  );

  const visibleLines = script?.lines?.slice(0, Math.max(lineIndex + 1, 1)) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong h-[100dvh] max-h-none w-full max-w-none border-none bg-background/95 p-0 sm:rounded-none">
        <div className="flex h-full flex-col px-6 py-10 text-center">
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="relative">
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-gold text-4xl text-primary-foreground shadow-glow-gold">
                {callerName.slice(0, 1)}
              </div>
              {phase === "ringing" && <span className="absolute inset-0 animate-ping rounded-full border border-primary/50" />}
            </div>

            <div className="mt-8">
              <div className="font-display text-3xl font-semibold">{callerName}</div>
              <div className="mt-2 text-sm text-muted-foreground">{callerRole}</div>
              <div className="mt-4 text-sm text-primary">
                {phase === "ringing" ? "来电接入中…" : phase === "active" ? formatDuration(seconds) : "通话结束"}
              </div>
            </div>

            {script && (
              <div className="mt-8 w-full max-w-2xl rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] text-primary">{script.taskDirection}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">{script.style}</span>
                </div>
                <div className="mt-3 font-display text-lg">{script.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{script.intro}</div>

                {phase === "active" ? (
                  <div className="mt-5 space-y-2 rounded-2xl border border-primary/15 bg-background/40 p-4">
                    <div className="text-[11px] uppercase tracking-wider text-primary">实时字幕 Demo</div>
                    {visibleLines.map((line, index) => (
                      <div
                        key={`${line}-${index}`}
                        className={cn(
                          "rounded-xl px-3 py-2 text-sm leading-relaxed",
                          index === visibleLines.length - 1
                            ? "bg-primary/10 text-foreground"
                            : "bg-white/[0.03] text-foreground/80",
                        )}
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-white/5 bg-background/30 p-4 text-sm text-muted-foreground">
                    接通后会按脚本逐段展示字幕，方便你预演电话任务。
                  </div>
                )}
              </div>
            )}

            {phase === "active" && (
              <div className="mt-8 flex h-20 items-end gap-1">
                {waveform.map((height, index) => (
                  <span
                    key={index}
                    className={cn("w-1.5 rounded-full bg-primary/80", index % 2 === 0 ? "animate-pulse" : "")}
                    style={{ height }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mt-12 flex items-center justify-center gap-4">
            {phase === "ringing" ? (
              <>
                <Button
                  type="button"
                  size="icon"
                  className="h-16 w-16 rounded-full bg-emerald-500 text-white hover:bg-emerald-400"
                  onClick={() => setPhase("active")}
                >
                  <Phone className="h-6 w-6" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  className="h-16 w-16 rounded-full bg-destructive text-white hover:bg-destructive/90"
                  onClick={() => {
                    setPhase("ended");
                    onOpenChange(false);
                  }}
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              </>
            ) : (
              <>
                <Button type="button" size="icon" variant="secondary" className="h-14 w-14 rounded-full">
                  <Mic className="h-5 w-5" />
                </Button>
                <Button type="button" size="icon" variant="secondary" className="h-14 w-14 rounded-full">
                  <Volume2 className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  className="h-16 w-16 rounded-full bg-destructive text-white hover:bg-destructive/90"
                  onClick={() => {
                    setPhase("ended");
                    onEnded?.(seconds, script);
                    onOpenChange(false);
                  }}
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
