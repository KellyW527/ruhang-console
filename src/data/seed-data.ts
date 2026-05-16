import {
  getGroupWelcomeNotice,
  getSimulationRuntime,
  getStarterKitAssets,
  getTaskMaterials,
} from "@/data/workspace-runtime";

export type OfferSeedContext = {
  simulationCode: string;
  company: string;
  userEmail: string;
  userName?: string | null;
  firstTask?: {
    orderIndex: number;
    id: string;
    title: string;
    assignmentMessage: string;
  } | null;
};

export function buildOfferSeed({
  simulationCode,
  company,
  userEmail,
  userName,
  firstTask,
}: OfferSeedContext) {
  const displayName = userName?.trim() || "你好";
  const runtime = getSimulationRuntime(simulationCode);
  const groupName = runtime.groupName;
  const groupWelcomeNotice = getGroupWelcomeNotice(simulationCode);
  const starterKitAssets = getStarterKitAssets(simulationCode);
  const starterMaterials = firstTask ? getTaskMaterials(simulationCode, firstTask.orderIndex) : [];
  const timelineLines = firstTask
    ? [`- Day 1：接收《${firstTask.title}》并开始推进`, "- Day 2：提交初稿并等待反馈", "- Day 3：自评并解锁下一个任务"]
    : ["- Day 1：接收入职资料", "- Day 2：开始第一项任务", "- Day 3：进入正式项目节奏"];

  const conversations = [
    {
      name: runtime.leader.name,
      role_label: runtime.leader.roleLabel,
      avatar_emoji: runtime.leader.avatarEmoji,
      is_group: false,
      order_index: 0,
      unread_count: 1,
    },
    {
      name: groupName,
      role_label: runtime.groupRoleLabel,
      avatar_emoji: "👥",
      is_group: true,
      order_index: 1,
      unread_count: 0,
    },
  ];

  const introMessages = {
    boss: [
      {
        sender: "system",
        message_type: "system",
        content: `今天是你入职第一天 · ${new Date().getMonth() + 1}月${new Date().getDate()}日`,
      },
      {
        sender: "boss",
        message_type: "text",
        content: `欢迎加入${company}。我是${runtime.leader.name}，${runtime.leader.greeting}`,
      },
      ...(firstTask
        ? [
            {
              sender: "boss",
              message_type: "text",
              content: firstTask.assignmentMessage,
            },
            {
              sender: "boss",
              message_type: "task",
              content: firstTask.title,
              task_id: firstTask.id,
            },
          ]
        : []),
    ],
    group: [
      {
        sender: "system",
        message_type: "text",
        content: `[通知] ${groupWelcomeNotice}`,
      },
      {
        sender: "system",
        message_type: "text",
        content: `@all ${runtime.groupReply} 共享资料路径：/共享盘/${company}/task-kits。`,
      },
      {
        sender: "system",
        message_type: "text",
        content: `[通知] ${company} 项目时间线\n${timelineLines.join("\n")}`,
      },
      ...starterKitAssets.map((material) => ({
        sender: "system",
        message_type: "file",
        content: material.description,
        file_name: material.filename,
        file_size: material.sizeLabel,
        file_url: material.url,
      })),
      ...starterMaterials.map((material) => ({
        sender: "system",
        message_type: "file",
        content: material.description,
        file_name: material.filename,
        file_size: "task kit",
        file_url: material.url,
        task_id: firstTask?.id ?? null,
      })),
    ],
  };

  const initialEmails = [
    {
      folder: "inbox",
      from_name: runtime.leader.name,
      from_email: runtime.leader.email,
      to_addresses: [userEmail],
      subject: "【共享盘】模板和资料已同步",
      body: `${displayName}，\n\n我把项目常用模板放到共享盘 /共享盘/${company}/task-kits 里了。先把资料目录过一遍，别上来就只盯着做题。\n\n今晚先把第一项任务推进起来，有问题直接在聊天里找我。\n\n${runtime.leader.name}`,
      is_read: false,
    },
  ];

  return {
    conversationNames: {
      boss: conversations[0].name,
      group: conversations[1].name,
    },
    conversations,
    introMessages,
    initialEmails,
  };
}
