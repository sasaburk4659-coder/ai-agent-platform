import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { Mail, Lock, User } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const registerMutation = trpc.auth.register.useMutation();
  const loginMutation = trpc.auth.login.useMutation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const ipResponse = await fetch("https://api.ipify.org?format=json");
      const ipData = await ipResponse.json();
      const ipAddress = ipData.ip || "unknown";

      await registerMutation.mutateAsync({
        username,
        email,
        password,
        ipAddress,
      });

      toast.success("Account created! Please log in.");
      setIsLogin(true);
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await loginMutation.mutateAsync({
        username,
        password,
      });

      toast.success("Login successful!");
      window.location.href = "/";
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a0f2e] to-[#0a0e27] flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 border-[#2a2f4a] bg-[#1a1f3a]/80 backdrop-blur">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
              OmniAgent
            </h1>
            <p className="text-[#a0a0c0] text-sm">Your All-Capable AI Agent</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#0a0e27] border border-[#2a2f4a]">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4 mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-sm text-[#e0e0ff] mb-2 block">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-[#00d9ff]" />
                    <Input
                      type="text"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 bg-[#0a0e27] border-[#2a2f4a] text-[#e0e0ff] placeholder-[#3d3d5c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-[#e0e0ff] mb-2 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-[#00d9ff]" />
                    <Input
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-[#0a0e27] border-[#2a2f4a] text-[#e0e0ff] placeholder-[#3d3d5c]"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-2 rounded-lg transition-all duration-300"
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#2a2f4a]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#1a1f3a] text-[#a0a0c0]">or</span>
                </div>
              </div>

              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="w-full bg-[#0a0e27] border border-[#2a2f4a] text-[#e0e0ff] hover:bg-[#1a1f3a] py-2 rounded-lg transition-all duration-300"
              >
                <Mail className="w-4 h-4 mr-2" />
                Continue with Google
              </Button>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register" className="space-y-4 mt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-sm text-[#e0e0ff] mb-2 block">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-[#00d9ff]" />
                    <Input
                      type="text"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 bg-[#0a0e27] border-[#2a2f4a] text-[#e0e0ff] placeholder-[#3d3d5c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-[#e0e0ff] mb-2 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-[#00d9ff]" />
                    <Input
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-[#0a0e27] border-[#2a2f4a] text-[#e0e0ff] placeholder-[#3d3d5c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-[#e0e0ff] mb-2 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-[#00d9ff]" />
                    <Input
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-[#0a0e27] border-[#2a2f4a] text-[#e0e0ff] placeholder-[#3d3d5c]"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-2 rounded-lg transition-all duration-300"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#2a2f4a]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#1a1f3a] text-[#a0a0c0]">or</span>
                </div>
              </div>

              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="w-full bg-[#0a0e27] border border-[#2a2f4a] text-[#e0e0ff] hover:bg-[#1a1f3a] py-2 rounded-lg transition-all duration-300"
              >
                <Mail className="w-4 h-4 mr-2" />
                Sign up with Google
              </Button>
            </TabsContent>
          </Tabs>

          <p className="text-center text-xs text-[#3d3d5c] mt-6">
            Maximum 5 users per IP address
          </p>
        </div>
      </Card>
    </div>
  );
}
