import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Users, Zap, TrendingUp, Shield } from "lucide-react";

export default function AdminPanel() {
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
        <Card className="border-[#2a2f4a] bg-[#1a1f3a]/80 backdrop-blur p-8 text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#e0e0ff] mb-2">Access Denied</h1>
          <p className="text-[#a0a0c0]">You do not have admin privileges</p>
        </Card>
      </div>
    );
  }

  const handleAddCoins = async () => {
    if (!selectedUserId || !coinsAmount || !reason) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await addCoinsMutation.mutateAsync({
        userId: selectedUserId,
        amount: parseInt(coinsAmount),
        reason,
      });

      toast.success("Coins added successfully!");
      setCoinsAmount("");
      setReason("");
      setSelectedUserId(null);
      getAllUsersQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to add coins");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a0f2e] to-[#0a0e27] p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
            Admin Panel
          </h1>
          <p className="text-[#a0a0c0]">Manage users and system resources</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-[#2a2f4a] bg-[#1a1f3a]/80 backdrop-blur p-6">
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8 text-cyan-400" />
              <div>
                <p className="text-[#a0a0c0] text-sm">Total Users</p>
                <p className="text-2xl font-bold text-[#e0e0ff]">{users.length}</p>
              </div>
            </div>
          </Card>

          <Card className="border-[#2a2f4a] bg-[#1a1f3a]/80 backdrop-blur p-6">
            <div className="flex items-center gap-4">
              <Zap className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-[#a0a0c0] text-sm">Total Coins Distributed</p>
                <p className="text-2xl font-bold text-[#e0e0ff]">{getStatsQuery.data?.totalCoinsDistributed || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="border-[#2a2f4a] bg-[#1a1f3a]/80 backdrop-blur p-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-[#a0a0c0] text-sm">Tasks Completed</p>
                <p className="text-2xl font-bold text-[#e0e0ff]">{getStatsQuery.data?.totalTasksCompleted || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users List */}
          <div className="lg:col-span-2">
            <Card className="border-[#2a2f4a] bg-[#1a1f3a]/80 backdrop-blur">
              <div className="p-6 border-b border-[#2a2f4a]">
                <h2 className="text-lg font-semibold text-[#e0e0ff]">Users</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-[#2a2f4a]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#a0a0c0]">Username</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#a0a0c0]">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#a0a0c0]">Coins</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#a0a0c0]">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#a0a0c0]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-[#2a2f4a] hover:bg-[#0a0e27]/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-[#e0e0ff]">{u.username || u.name}</td>
                        <td className="px-6 py-4 text-sm text-[#a0a0c0]">{u.email}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-yellow-400">{u.coins}</td>
                        <td className="px-6 py-4 text-sm">
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
                        <td className="px-6 py-4 text-sm">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedUserId(u.id)}
                            className="text-xs"
                          >
                            Add Coins
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
            <Card className="border-[#2a2f4a] bg-[#1a1f3a]/80 backdrop-blur p-6">
              <h3 className="text-lg font-semibold text-[#e0e0ff] mb-4">Add Coins</h3>

              {selectedUserId ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-[#a0a0c0] mb-2 block">User</label>
                    <p className="text-[#e0e0ff] font-semibold">
                      {users.find((u) => u.id === selectedUserId)?.username}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-[#a0a0c0] mb-2 block">Amount</label>
                    <Input
                      type="number"
                      value={coinsAmount}
                      onChange={(e) => setCoinsAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="bg-[#0a0e27] border-[#2a2f4a] text-[#e0e0ff]"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-[#a0a0c0] mb-2 block">Reason</label>
                    <Input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g., Bonus, Compensation"
                      className="bg-[#0a0e27] border-[#2a2f4a] text-[#e0e0ff]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddCoins}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedUserId(null)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-[#a0a0c0] text-sm">Select a user to add coins</p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
