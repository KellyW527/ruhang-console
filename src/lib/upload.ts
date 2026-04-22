import { supabase } from "@/integrations/supabase/client";

export type UploadProgress = (pct: number) => void;
export const USER_SUBMISSIONS_BUCKET = "user-submissions";
export const TASK_ATTACHMENTS_BUCKET = "task-attachments";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif"]);
const ATTACHMENT_EXTENSIONS = new Set(["xlsx", "docx", "pdf", "pptx", "png", "jpg", "jpeg"]);

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const sanitize = (name: string) =>
  name.replace(/[^\w.\-]+/g, "_").replace(/_+/g, "_").slice(0, 80);

export const getExtension = (name: string) => name.split(".").pop()?.toLowerCase() ?? "";

export const validateFile = (file: File, kind: "attachment" | "image") => {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("单个文件最大支持 10MB");
  }
  const extension = getExtension(file.name);
  const allowList = kind === "image" ? IMAGE_EXTENSIONS : ATTACHMENT_EXTENSIONS;
  if (!allowList.has(extension)) {
    throw new Error(
      kind === "image"
        ? "仅支持 png / jpg / jpeg / gif 图片"
        : "仅支持 xlsx / docx / pdf / pptx / png / jpg / jpeg 文件",
    );
  }
};

export const getAcceptedExtensions = (kind: "attachment" | "image") =>
  Array.from(kind === "image" ? IMAGE_EXTENSIONS : ATTACHMENT_EXTENSIONS);

export const getMaxUploadBytes = () => MAX_UPLOAD_BYTES;

export async function uploadFile(opts: {
  kind: "attachment" | "image";
  userId: string;
  simulationId: string;
  taskOrder?: number | null;
  file: File;
  onProgress?: UploadProgress;
  signedExpiresIn?: number;
}): Promise<{ path: string; url: string; sizeLabel: string; name: string }> {
  const {
    kind,
    userId,
    simulationId,
    taskOrder,
    file,
    onProgress,
    signedExpiresIn = 60 * 60 * 24 * 365,
  } = opts;

  validateFile(file, kind);

  const taskSegment = typeof taskOrder === "number" ? `task-${String(taskOrder + 1).padStart(2, "0")}` : "general";
  const path = `${userId}/${simulationId}/${taskSegment}/${Date.now()}-${sanitize(file.name)}`;

  const { data: signed, error: signErr } = await supabase.storage
    .from(USER_SUBMISSIONS_BUCKET)
    .createSignedUploadUrl(path);
  if (signErr || !signed) throw signErr ?? new Error("无法创建上传链接");

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signed.signedUrl, true);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`上传失败 (${xhr.status})`)));
    xhr.onerror = () => reject(new Error("网络错误"));
    xhr.send(file);
  });

  const { data: s, error: sErr } = await supabase.storage
    .from(USER_SUBMISSIONS_BUCKET)
    .createSignedUrl(path, signedExpiresIn);
  if (sErr || !s) throw sErr ?? new Error("无法生成下载链接");

  return { path, url: s.signedUrl, sizeLabel: formatSize(file.size), name: file.name };
}
