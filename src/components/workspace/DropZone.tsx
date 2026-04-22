import { useRef, useState } from "react";
import { CheckCircle2, Loader2, Upload, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { getAcceptedExtensions, getMaxUploadBytes, validateFile } from "@/lib/upload";

type DropState = "idle" | "valid" | "invalid" | "oversize" | "uploading" | "success" | "error";

export function DropZone({
  kind,
  disabled,
  uploading,
  onFile,
  children,
}: {
  kind: "attachment" | "image";
  disabled?: boolean;
  uploading?: boolean;
  onFile: (file: File) => Promise<void> | void;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<DropState>("idle");
  const [message, setMessage] = useState("");
  const dragDepth = useRef(0);

  const reset = () => {
    dragDepth.current = 0;
    setState("idle");
    setMessage("");
  };

  const inspectFile = (file?: File | null) => {
    if (!file) return { nextState: "invalid" as DropState, nextMessage: "未检测到文件" };
    if (file.size > getMaxUploadBytes()) {
      return { nextState: "oversize" as DropState, nextMessage: "文件超过 10MB" };
    }
    try {
      validateFile(file, kind);
      return { nextState: "valid" as DropState, nextMessage: "松开上传" };
    } catch (error: any) {
      return {
        nextState: "invalid" as DropState,
        nextMessage: error?.message ?? `仅支持 ${getAcceptedExtensions(kind).join(" / ")}`,
      };
    }
  };

  return (
    <div
      onDragEnter={(event) => {
        if (disabled) return;
        event.preventDefault();
        dragDepth.current += 1;
        const file = event.dataTransfer?.items?.[0]?.getAsFile();
        const { nextState, nextMessage } = inspectFile(file);
        setState(nextState);
        setMessage(nextMessage);
      }}
      onDragOver={(event) => {
        if (disabled) return;
        event.preventDefault();
      }}
      onDragLeave={(event) => {
        if (disabled) return;
        event.preventDefault();
        dragDepth.current -= 1;
        if (dragDepth.current <= 0) reset();
      }}
      onDrop={async (event) => {
        if (disabled) return;
        event.preventDefault();
        const file = event.dataTransfer?.files?.[0];
        const { nextState, nextMessage } = inspectFile(file);
        if (nextState !== "valid" || !file) {
          setState(nextState);
          setMessage(nextMessage);
          window.setTimeout(reset, 1200);
          return;
        }

        try {
          setState("uploading");
          setMessage(`上传中：${file.name}`);
          await onFile(file);
          setState("success");
          setMessage("上传成功");
        } catch (error: any) {
          setState("error");
          setMessage(error?.message ?? "上传失败");
        } finally {
          window.setTimeout(reset, 1000);
        }
      }}
      className="relative"
    >
      {(state !== "idle" || uploading) && (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl border-2 border-dashed backdrop-blur-sm transition",
            uploading || state === "valid"
              ? "border-primary bg-primary/10"
              : state === "oversize"
                ? "border-amber-400 bg-amber-500/10"
                : state === "success"
                  ? "border-emerald-400 bg-emerald-500/10"
                  : "border-destructive bg-destructive/10",
          )}
        >
          <div className="flex items-center gap-3 rounded-2xl bg-background/90 px-4 py-3 text-sm shadow-lg">
            {uploading || state === "uploading" ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : state === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            ) : state === "valid" ? (
              <Upload className="h-5 w-5 text-primary" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            <div>
              <div className="font-medium">
                {uploading || state === "uploading" ? "正在上传…" : message || "松开上传"}
              </div>
              <div className="text-xs text-muted-foreground">
                允许格式：{getAcceptedExtensions(kind).join(" / ")}
              </div>
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
