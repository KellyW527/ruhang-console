export type FeedbackStyle = "strict" | "balanced" | "encouraging";
export type ReplyPacing = "realistic" | "efficient";

export type ProfilePreferences = {
  preferred_name: string;
  feedback_style: FeedbackStyle;
  reply_pacing: ReplyPacing;
  show_beginner_hints: boolean;
  show_starter_kit_guidance: boolean;
};

export type ProfileNotifications = {
  notify_new_task: boolean;
  notify_leader_reply: boolean;
  notify_email: boolean;
  notify_badges: boolean;
  notify_browser: boolean;
};

export const DEFAULT_PROFILE_PREFERENCES: ProfilePreferences = {
  preferred_name: "",
  feedback_style: "balanced",
  reply_pacing: "realistic",
  show_beginner_hints: true,
  show_starter_kit_guidance: true,
};

export const DEFAULT_PROFILE_NOTIFICATIONS: ProfileNotifications = {
  notify_new_task: true,
  notify_leader_reply: true,
  notify_email: true,
  notify_badges: true,
  notify_browser: false,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export function normalizePreferences(value: unknown): ProfilePreferences {
  if (!isRecord(value)) return DEFAULT_PROFILE_PREFERENCES;
  return {
    preferred_name:
      typeof value.preferred_name === "string"
        ? value.preferred_name
        : DEFAULT_PROFILE_PREFERENCES.preferred_name,
    feedback_style:
      value.feedback_style === "strict" ||
      value.feedback_style === "balanced" ||
      value.feedback_style === "encouraging"
        ? value.feedback_style
        : DEFAULT_PROFILE_PREFERENCES.feedback_style,
    reply_pacing:
      value.reply_pacing === "realistic" || value.reply_pacing === "efficient"
        ? value.reply_pacing
        : DEFAULT_PROFILE_PREFERENCES.reply_pacing,
    show_beginner_hints:
      typeof value.show_beginner_hints === "boolean"
        ? value.show_beginner_hints
        : DEFAULT_PROFILE_PREFERENCES.show_beginner_hints,
    show_starter_kit_guidance:
      typeof value.show_starter_kit_guidance === "boolean"
        ? value.show_starter_kit_guidance
        : DEFAULT_PROFILE_PREFERENCES.show_starter_kit_guidance,
  };
}

export function normalizeNotifications(value: unknown): ProfileNotifications {
  if (!isRecord(value)) return DEFAULT_PROFILE_NOTIFICATIONS;
  return {
    notify_new_task:
      typeof value.notify_new_task === "boolean"
        ? value.notify_new_task
        : DEFAULT_PROFILE_NOTIFICATIONS.notify_new_task,
    notify_leader_reply:
      typeof value.notify_leader_reply === "boolean"
        ? value.notify_leader_reply
        : DEFAULT_PROFILE_NOTIFICATIONS.notify_leader_reply,
    notify_email:
      typeof value.notify_email === "boolean"
        ? value.notify_email
        : DEFAULT_PROFILE_NOTIFICATIONS.notify_email,
    notify_badges:
      typeof value.notify_badges === "boolean"
        ? value.notify_badges
        : DEFAULT_PROFILE_NOTIFICATIONS.notify_badges,
    notify_browser:
      typeof value.notify_browser === "boolean"
        ? value.notify_browser
        : DEFAULT_PROFILE_NOTIFICATIONS.notify_browser,
  };
}

export function getPreferredDisplayName(
  profile: Partial<{
    display_name?: string | null;
    name?: string | null;
    chinese_name?: string | null;
    english_name?: string | null;
    preferences?: unknown;
  }> | null | undefined,
  fallbackEmail?: string | null,
) {
  const preferences = normalizePreferences(profile?.preferences);
  const preferred = preferences.preferred_name?.trim();
  if (preferred) return preferred;
  if (profile?.display_name?.trim()) return profile.display_name.trim();
  if (profile?.name?.trim()) return profile.name.trim();
  if (profile?.chinese_name?.trim()) return profile.chinese_name.trim();
  if (profile?.english_name?.trim()) return profile.english_name.trim();
  if (fallbackEmail?.trim()) return fallbackEmail.split("@")[0];
  return "同学";
}

export function applyFeedbackStyleTemplate(style: FeedbackStyle, content: string) {
  const clean = content.trim();
  if (style === "strict") {
    return `### 结论\n${clean}\n\n### 要求\n- 先补齐最低交付标准\n- 再继续推进下一轮`;
  }
  if (style === "encouraging") {
    return `### 这次先稳住\n${clean}\n\n### 下一步\n- 先把结构保住\n- 再逐项补强细节`;
  }
  return `### 反馈\n${clean}\n\n### 建议\n- 按优先级逐项推进\n- 注意结构与内容的平衡`;
}
