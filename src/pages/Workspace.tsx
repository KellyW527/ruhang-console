import { useState } from "react";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Send, Paperclip, Download, MessageSquare, Mail, CheckCircle, Circle,
  Phone, ChevronRight, Star, BookOpen, ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";

// TODO: 接入现有逻辑 — 以下为占位数据

const conversations = [
  { id: "leader", name: "张总 · Leader", role: "leader", unread: 2, avatar: "张", color: "bg-primary/20 text-primary" },
  { id: "team", name: "研究部 · 项目组", role: "team", unread: 0, avatar: "研", color: "bg-blue-500/20 text-blue-400" },
  { id: "hr", name: "王女士 · HR", role: "hr", unread: 1, avatar: "王", color: "bg-emerald-500/20 text-emerald-400" },
];

const messages = [
  { id: 1, sender: "leader", content: "早上好，请查看一下昨天发给你的财务模型，有几个数据点需要确认。", time: "09:15", isMe: false },
  { id: 2, sender: "me", content: "收到张总，我现在就去看。请问是关于 Q3 的营收预测部分吗？", time: "09:18", isMe: true },
  { id: 3, sender: "leader", content: "对的，特别是第 14 行的增长率假设。同时也帮我把 Starter Kit 里的行业对标数据整理一下。", time: "09:20", isMe: false },
];

const tasks = [
  { id: 1, title: "阅读 Starter Kit", status: "completed" as const },
  { id: 2, title: "回复 Leader 消息", status: "in_progress" as const },
  { id: 3, title: "提交行业研究邮件", status: "todo" as const },
  { id: 4, title: "电话沟通（骨架）", status: "locked" as const },
];

const taskStatusIcon = {
  completed: <CheckCircle className="h-4 w-4 text-emerald-400" />,
  in_progress: <Circle className="h-4 w-4 text-primary" />,
  todo: <Circle className="h-4 w-4 text-muted-foreground" />,
  locked: <Phone className="h-4 w-4 text-muted-foreground opacity-50" />,
};

const Workspace = () => {
  const [activeConv, setActiveConv] = useState("leader");
  const [messageInput, setMessageInput] = useState("");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const handleSend = () => {
    if (!messageInput.trim()) return;
    // TODO: 接入现有逻辑 — 发送消息 + AI 回复
    setMessageInput("");
  };

  const handleEmailSubmit = () => {
    // TODO: 接入现有逻辑 — 提交邮件
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="border-b border-border/30 bg-background/80 backdrop-blur-xl flex items-center justify-between h-14 px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="h-7 w-7 rounded-lg gradient-gold flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">R</span>
          </div>
          <span className="font-display font-semibold text-foreground text-sm">投行分析师模拟</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/20 text-primary border-primary/30 border text-xs">第 2 天</Badge>
          <Button variant="ghost" size="sm" onClick={() => setFeedbackOpen(true)} className="text-xs text-muted-foreground">
            反馈
          </Button>
        </div>
      </header>

      {/* Main 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Conversation List */}
        <div className="w-64 border-r border-border/30 flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-border/20">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">会话</p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConv(conv.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                    activeConv === conv.id ? "bg-secondary/80" : "hover:bg-secondary/40"
                  }`}
                >
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium ${conv.color}`}>
                    {conv.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{conv.name}</p>
                    <p className="text-xs text-muted-foreground">{conv.role === "leader" ? "直属上级" : conv.role === "hr" ? "人力资源" : "项目团队"}</p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                      {conv.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>

          {/* Starter Kit Download */}
          <div className="p-3 border-t border-border/20">
            <GlassCard className="p-3 space-y-2 cursor-pointer hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-foreground">Starter Kit</span>
              </div>
              <p className="text-xs text-muted-foreground">下载项目入门材料</p>
            </GlassCard>
          </div>
        </div>

        {/* Middle: Chat / Email */}
        <div className="flex-1 flex flex-col min-w-0">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <div className="border-b border-border/20 px-4">
              <TabsList className="bg-transparent h-12">
                <TabsTrigger value="chat" className="data-[state=active]:bg-secondary gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" /> 聊天
                </TabsTrigger>
                <TabsTrigger value="email" className="data-[state=active]:bg-secondary gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> 邮件
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="flex-1 flex flex-col m-0 data-[state=inactive]:hidden">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-2xl mx-auto">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] ${msg.isMe ? "order-2" : ""}`}>
                        <div className={`rounded-2xl px-4 py-3 ${
                          msg.isMe
                            ? "bg-primary/15 border border-primary/20"
                            : "bg-secondary/80 border border-border/30"
                        }`}>
                          <p className="text-sm text-foreground leading-relaxed">{msg.content}</p>
                        </div>
                        <p className={`text-xs text-muted-foreground mt-1 ${msg.isMe ? "text-right" : ""}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Fixed Input */}
              <div className="border-t border-border/20 p-4 flex-shrink-0">
                <div className="flex items-center gap-2 max-w-2xl mx-auto">
                  <Button variant="ghost" size="icon" className="text-muted-foreground flex-shrink-0">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="输入消息..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    className="bg-secondary/50 border-border/30 focus:border-primary"
                  />
                  <Button onClick={handleSend} size="icon" className="gradient-gold text-primary-foreground border-0 flex-shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="email" className="flex-1 flex flex-col m-0 p-6 data-[state=inactive]:hidden">
              <div className="max-w-2xl mx-auto w-full space-y-4 flex-1">
                <div className="space-y-3">
                  <Input placeholder="收件人" value={emailTo} onChange={(e) => setEmailTo(e.target.value)}
                    className="bg-secondary/50 border-border/30" />
                  <Input placeholder="主题" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)}
                    className="bg-secondary/50 border-border/30" />
                  <Textarea placeholder="邮件正文..." value={emailBody} onChange={(e) => setEmailBody(e.target.value)}
                    className="bg-secondary/50 border-border/30 min-h-[200px] flex-1" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" className="border-border/50">保存草稿</Button>
                  <Button onClick={handleEmailSubmit} className="gradient-gold text-primary-foreground border-0">
                    <Send className="h-4 w-4 mr-2" /> 发送邮件
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Task Panel */}
        <div className="w-72 border-l border-border/30 flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-border/20">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">任务</p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {tasks.map((task) => (
                <GlassCard
                  key={task.id}
                  variant={task.status === "in_progress" ? "gold" : "default"}
                  className={`p-3 flex items-center gap-3 cursor-pointer hover:scale-[1.02] transition-transform ${
                    task.status === "locked" ? "opacity-50" : ""
                  }`}
                >
                  {taskStatusIcon[task.status]}
                  <span className={`text-sm flex-1 ${
                    task.status === "completed" ? "text-muted-foreground line-through" : "text-foreground"
                  }`}>
                    {task.title}
                  </span>
                  {task.status !== "locked" && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                </GlassCard>
              ))}
            </div>

            {/* Feedback Entry */}
            <div className="p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">工具</p>
              <Button variant="outline" className="w-full justify-start gap-2 border-border/30 text-sm"
                onClick={() => setFeedbackOpen(true)}>
                <Star className="h-4 w-4 text-primary" /> 查看反馈
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 border-border/30 text-sm"
                onClick={() => setCompletionOpen(true)}>
                <BookOpen className="h-4 w-4 text-primary" /> Completion Letter
              </Button>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Feedback Modal */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="glass-card border-border/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">任务反馈</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="standard" className="mt-4">
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="standard">标准答案</TabsTrigger>
              <TabsTrigger value="analysis">详细解析</TabsTrigger>
              <TabsTrigger value="self-eval">自评</TabsTrigger>
            </TabsList>
            <TabsContent value="standard" className="mt-4 space-y-3">
              <GlassCard className="p-4">
                <p className="text-sm text-foreground leading-relaxed">
                  标准答案示例：在回复 Leader 时，应先确认具体数据点，再主动提出解决方案的时间表。
                  注意使用正式但不生硬的语气。
                </p>
              </GlassCard>
            </TabsContent>
            <TabsContent value="analysis" className="mt-4 space-y-3">
              <GlassCard className="p-4">
                <p className="text-sm text-foreground leading-relaxed">
                  你的回复展示了良好的响应速度，但缺少对具体任务的拆解。
                  建议在确认收到后，列出你计划的执行步骤和预计完成时间。
                </p>
              </GlassCard>
            </TabsContent>
            <TabsContent value="self-eval" className="mt-4 space-y-3">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">你对这次任务的表现如何评价？</p>
                <Textarea placeholder="写下你的自评..." className="bg-secondary/50 border-border/30 min-h-[120px]" />
                <Button className="gradient-gold text-primary-foreground border-0">提交自评</Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Completion Modal */}
      <Dialog open={completionOpen} onOpenChange={setCompletionOpen}>
        <DialogContent className="glass-card-gold border-primary/20 max-w-lg text-center">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground text-xl">🎉 恭喜完成！</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground">
              你已完成投行分析师模拟的所有任务。以下是你的 Completion Letter。
            </p>
            <GlassCard className="p-6 text-left space-y-3">
              <p className="text-sm text-foreground font-medium">Completion Letter</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We are pleased to confirm that you have successfully completed the Investment Banking Analyst Simulation.
                Your performance demonstrated strong analytical abilities and professional communication skills.
              </p>
            </GlassCard>
            <div className="flex gap-3 justify-center">
              <Button asChild variant="outline" className="border-border/50">
                <Link to="/report">查看报告</Link>
              </Button>
              <Button asChild className="gradient-gold text-primary-foreground border-0">
                <Link to="/dashboard">返回控制台</Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Workspace;
