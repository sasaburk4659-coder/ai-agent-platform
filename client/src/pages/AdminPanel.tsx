import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Users, Zap, TrendingUp, Shield } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function AdminPanel() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [coinsAmount, setCoinsAmount] = useState("");
  const [reason, setReason] = useState("");

  const getAllUsersQuery = trpc.admin.getAllUsers.useQuery();
  const addCoinsMutation = trpc.admin.addCoinsToUser.useMutation();
  const getStatsQuery = trpc.admin.getSystemStats.useQuery();

  useEffect(() => {
    if (getAllUsersQuery.data) {
      setUsers(getAllUsersQuery.data);
    }
  }, [getAllUsersQuery.data]);

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a0f2e] to-[#0a0e27] flex items-center justify-center p-4">
        <Card className="border-[#2a2f4a] bg-[#1a1f3a]/80 backdrop-blur p-6 md:p-8 text-center">
          <Shield className="w-10 md:w-12 h-10 md:h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl md:text-2xl font-bold text-[#e0e0ff] mb-2">{t("admin.accessDenied")}</h1>
          <p className="text-xs md:text-base text-[#a0a0c0]">{t("admin.noAdminPrivileges")}</p>
        </Card>
      </div>
    );
  }

  const handleAddCoins = async () => {
    if (!selectedUserId || !coinsAmount || !reason) {
      toast.error(t("admin.fillAllFields"));
      return;
    }

    try {
      await addCoinsMutation.mutateAsync({
        userId: selectedUserId,
        amount: parseInt(coinsAmount),
        reason,
      });

      toast.success(t("admin.coinsAddedSuccess"));
      setCoinsAmount("");
      setReason("");
      setSelectedUserId(null);
      getAllUsersQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || t("admin.coinsAddedFailed"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a0f2e] to-[#0a0e27] p-3 md:p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-1 md:mb-2">
            {t("admin.title")}
          </h1>
          <p className="text-xs md:text-base text-[#a0a0c0]">{t("admin.subtitle")}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          <Card className="border-[#2a2f4a] bg-[#1a1f3a]/80 backdrop-blur p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <Users className="w-6 md:w-8 h-6 md:h-8 text-cyan-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[#a0a0c0] text-xs md:text-sm">{t("admin.totalUsers")}</p>
                <p className="text-xl md:text-2xl font-bold text-[#e0e0ff]">{users.length}</p>
              </div>
            </div>
          </Card>

          <Card className="border-[#2a2f4a] bg-[#1a1f3a]/80 backdrop-blur p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <Zap className="w-6 md:w-8 h-6 md:h-8 text-yellow-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[#a0a0c0] text-xs md:text-sm">{t("admin.totalCoinsDistributed")}</p>
                <p className="text-xl md:text-2xl font-bold text-[#e0e0ff]">{getStatsQuery.data?.totalCoinsDistributed || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="border-[#2a2f4a] bg-[#1a1f3a]/80 backdrop-blur p-4 md:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 md:gap-4">
              <TrendingUp className="w-6 md:w-8 h-6 md:h-8 text-green-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[#a0a0c0] text-xs md:text-sm">{t("admin.tasksCompleted")}</p>
                <p className="text-xl md:text-2xl font-bold text-[#e0e0ff]">{getStatsQuery.data?.totalTasksCompleted || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Users List */}
          <div className="lg:col-span-2">
            <Card className="border-[#2a2f4a] bg-[#1a1f3a]/80 backdrop-blur overflow-hidden">
              <div className="p-4 md:p-6 border-b border-[#2a2f4a]">
                <h2 className="text-base md:text-lg font-semibold text-[#e0e0ff]">{t("admin.users")}</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs md:text-sm">
                  <thead className="border-b border-[#2a2f4a]">
                    <tr>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left font-semibold text-[#a0a0c0]">{t("admin.username")}</th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left font-semibold text-[#a0a0c0]">{t("admin.email")}</th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left font-semibold text-[#a0a0c0]">{t("admin.coins")}</th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left font-semibold text-[#a0a0c0]">{t("admin.role")}</th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left font-semibold text-[#a0a0c0]">{t("admin.action")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-[#2a2f4a] hover:bg-[#0a0e27]/50 transition-colors">
                        <td className="px-3 md:px-6 py-2 md:py-4 text-[#e0e0ff]">{u.username || u.name}</td>
                        <td className="px-3 md:px-6 py-2 md:py-4 text-[#a0a0c0] truncate">{u.email}</td>
                        <td className="px-3 md:px-6 py-2 md:py-4 font-semibold text-yellow-400">{u.coins}</td>
                        <td className="px-3 md:px-6 py-2 md:py-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              u.role === "admin"
                                ? "bg-purple-500/30 text-purple-400"
                                : "bg-cyan-500/30 text-cyan-400"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-2 md:py-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedUserId(u.id)}
                            className="text-xs py-1 px-2"
                          >
                            {t("admin.addCoins")}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Add Coins Form */}
          <div>
            <Card className="border-[#2a2f4a] bg-[#1a1f3a]/80 backdrop-blur p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold text-[#e0e0ff] mb-4">{t("admin.addCoins")}</h3>

              {selectedUserId ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs md:text-sm text-[#a0a0c0] mb-2 block">{t("admin.user")}</label>
                    <p className="text-sm md:text-base text-[#e0e0ff] font-semibold">
                      {users.find((u) => u.id === selectedUserId)?.username}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs md:text-sm text-[#a0a0c0] mb-2 block">{t("admin.amount")}</label>
                    <Input
                      type="number"
                      value={coinsAmount}
                      onChange={(e) => setCoinsAmount(e.target.value)}
                      placeholder={t("admin.enterAmount")}
                      className="bg-[#0a0e27] border-[#2a2f4a] text-[#e0e0ff] text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs md:text-sm text-[#a0a0c0] mb-2 block">{t("admin.reason")}</label>
                    <Input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={`${t("admin.bonus")}, ${t("admin.compensation")}`}
                      className="bg-[#0a0e27] border-[#2a2f4a] text-[#e0e0ff] text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={handleAddCoins}
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white text-sm"
                    >
                      {t("admin.confirm")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedUserId(null)}
                      className="text-sm"
                    >
                      {t("admin.action")}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs md:text-sm text-[#a0a0c0]">{t("admin.selectUser")}</p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
