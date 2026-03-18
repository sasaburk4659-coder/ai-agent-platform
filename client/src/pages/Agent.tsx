import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Send, Zap, Sparkles, Clock, Code2, Mail, Users, Cog } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Agent() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState<{ estimatedCoins: number; reasoning: string } | null>(null);
  const [coins, setCoins] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getBalanceQuery = trpc.coins.getBalance.useQuery();
  const estimateCostMutation = trpc.coins.estimateCost.useMutation();
  const executeTaskMutation = trpc.agent.executeTask.useMutation();
  const claimDailyMutation = trpc.coins.claimDaily.useMutation();

  useEffect(() => {
    if (getBalanceQuery.data?.coins !== undefined) {
      setCoins(getBalanceQuery.data.coins);
    }
  }, [getBalanceQuery.data?.coins]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleEstimate = async () => {
    if (!input.trim()) {
      toast.error(t("agent.describeYourTask"));
      return;
    }

    setEstimating(true);
    try {
      const result = await estimateCostMutation.mutateAsync({ prompt: input });
      setEstimatedCost({ estimatedCoins: result.estimatedCoins, reasoning: result.reasoning });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "user",
          content: input,
          timestamp: new Date(),
        },
      ]);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `💰 ${t("agent.estimatedCost")}: ${estimatedCost?.estimatedCoins} ${t("agent.coins_short")}\n\n📝 ${t("agent.reasoning")}: ${estimatedCost?.reasoning}`,
          timestamp: new Date(),
        },
      ]);
    } catch (error: any) {
      toast.error(t("agent.estimateCostFailed"));
    } finally {
      setEstimating(false);
    }
  };

  const handleExecute = async () => {
    if (!estimatedCost || !input.trim()) {
      toast.error(t("agent.pleaseEstimate"));
      return;
    }

    if (coins < estimatedCost.estimatedCoins) {
      toast.error(t("agent.insufficientCoins"));
      return;
    }

    setLoading(true);
    try {
      const result = await executeTaskMutation.mutateAsync({
        taskType: "general",
        prompt: input,
        coinsCost: estimatedCost.estimatedCoins,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content: `${t("agent.taskExecuted")}! ${t("agent.coinsDeducted")}: ${result.coinsDeducted}`,
          timestamp: new Date(),
        },
      ]);

      if (estimatedCost) {
        setCoins((prev) => prev - estimatedCost.estimatedCoins);
      }
      setInput("");
      setEstimatedCost(null);
      toast.success(t("agent.taskExecutionSuccess"));
    } catch (error: any) {
      toast.error(error.message || t("agent.taskExecutionFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleClaimDaily = async () => {
    try {
      const result = await claimDailyMutation.mutateAsync();
      if (result.success && result.coins !== undefined) {
        setCoins(result.coins);
        toast.success(t("agent.dailyRewardClaimed"));
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(t("agent.claimDailyFailed"));
    }
  };

  const capabilities = [
    { icon: Code2, label: t("agent.minecraftMods"), desc: t("agent.createAndBuildMods") },
    { icon: Mail, label: t("agent.email"), desc: t("agent.sendAndManageEmails") },
    { icon: Users, label: t("agent.accounts"), desc: t("agent.manageAccounts") },
    { icon: Cog, label: t("agent.automation"), desc: t("agent.automateTasks") },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a0f2e] to-[#0a0e27] p-3 md:p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-1 md:mb-2">
              OmniAgent
            </h1>
            <p className="text-xs md:text-base text-[#a0a0c0]">{t("agent.welcome")}, {user?.name || user?.email}</p>
          </div>

          {/* Coins Display */}
          <div className="flex flex-col sm:flex-row gap-2 md:gap-4 w-full md:w-auto">
            <Card className="border-[#2a2f4a] bg-[#1a1f3a]/80 backdrop-blur px-4 md:px-6 py-3 md:py-4 flex-1 md:flex-none">
              <div className="flex items-center gap-2 md:gap-3">
                <Zap className="w-5 md:w-6 h-5 md:h-6 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-[#a0a0c0] text-xs md:text-sm">{t("agent.coins")}</p>
                  <p className="text-xl md:text-2xl font-bold text-[#e0e0ff]">{coins}</p>
                </div>
              </div>
            </Card>

            <Button
              onClick={handleClaimDaily}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-xs md:text-sm py-2 md:py-2 px-3 md:px-4 flex-1 md:flex-none"
            >
              <Clock className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
              {t("agent.claimDaily")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="border-[#2a2f4a] bg-[#1a1f3a]/80 backdrop-blur h-[500px] md:h-[600px] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Sparkles className="w-10 md:w-12 h-10 md:h-12 text-cyan-400/50 mx-auto mb-3 md:mb-4" />
                      <p className="text-xs md:text-base text-[#a0a0c0]">{t("agent.startConversation")}</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-[#e0e0ff] border border-cyan-500/50"
                            : "bg-[#0a0e27] text-[#a0a0c0] border border-[#2a2f4a]"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-[#2a2f4a] p-3 md:p-6 space-y-3 md:space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t("agent.describeYourTask")}
                    className="flex-1 bg-[#0a0e27] border-[#2a2f4a] text-[#e0e0ff] placeholder-[#3d3d5c] text-xs md:text-sm"
                    onKeyPress={(e) => e.key === "Enter" && !estimatedCost && handleEstimate()}
                  />
                  {!estimatedCost ? (
                    <Button
                      onClick={handleEstimate}
                      disabled={estimating || !input.trim()}
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white text-xs md:text-sm py-2 px-3 md:px-4 w-full sm:w-auto"
                    >
                      <Sparkles className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
                      {estimating ? t("agent.estimating") : t("agent.estimate")}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleExecute}
                      disabled={loading}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-xs md:text-sm py-2 px-3 md:px-4 w-full sm:w-auto"
                    >
                      <Send className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
                      {loading ? t("agent.executing") : t("agent.execute")}
                    </Button>
                  )}
                </div>

                {estimatedCost && (
                  <div className="bg-[#0a0e27] border border-cyan-500/30 rounded-lg p-3 md:p-4">
                    <p className="text-xs md:text-sm text-[#a0a0c0] mb-2">{t("agent.estimatedCost")}: {estimatedCost?.estimatedCoins} {t("agent.coins_short")}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEstimatedCost(null)}
                      className="text-xs"
                    >
                      {t("agent.cancel")}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Capabilities Sidebar */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-base md:text-lg font-semibold text-[#e0e0ff] mb-3 md:mb-4">{t("agent.capabilities")}</h3>
            {capabilities.map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <Card key={idx} className="border-[#2a2f4a] bg-[#1a1f3a]/80 backdrop-blur p-3 md:p-4 hover:border-cyan-500/50 transition-colors cursor-pointer">
                  <div className="flex items-start gap-2 md:gap-3">
                    <Icon className="w-4 md:w-5 h-4 md:h-5 text-cyan-400 mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-[#e0e0ff] text-xs md:text-sm">{cap.label}</p>
                      <p className="text-xs text-[#a0a0c0]">{cap.desc}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
