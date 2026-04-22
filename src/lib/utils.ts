import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDeadline(value: string | Date | number | null | undefined): string {
  if (value === null || value === undefined) return "无截止日期";
  if (typeof value === "number") {
    return `${value} 小时内`;
  }
  const d = new Date(value);
  if (isNaN(d.getTime())) return "日期无效";
  return d.toLocaleDateString("zh-CN", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "夜深了";
  if (hour < 12) return "早上好";
  if (hour < 14) return "中午好";
  if (hour < 18) return "下午好";
  if (hour < 22) return "晚上好";
  return "夜深了";
}
