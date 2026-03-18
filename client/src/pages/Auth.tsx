import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { Mail, Lock, User } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function Auth() {
  const { t } = useTranslation();
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
      toast.error(t("auth.fillAllFields"));
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

      toast.success(t("auth.accountCreated"));
      setIsLogin(true);
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (error: any) {
      toast.error(error.message || t("auth.registrationFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error(t("auth.fillAllFields"));
      return;
    }

    setLoading(true);
    try {
      await loginMutation.mutateAsync({
        username,
        password,
      });

      toast.success(t("auth.loginSuccess"));
      window.location.href = "/";
    } catch (error: any) {
      toast.error(error.message || t("auth.loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a0f2e] to-[#0a0e27] flex items-center justify-center p-4 md:p-6">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 border-[#2a2f4a] bg-[#1a1f3a]/80 backdrop-blur">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
              OmniAgent
            </h1>
            <p className="text-[#a0a0c0] text-xs md:text-sm">{t("auth.subtitle")}</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#0a0e27] border border-[#2a2f4a]">
              <TabsTrigger value="login" className="text-xs md:text-sm">{t("auth.login")}</TabsTrigger>
              <TabsTrigger value="register" className="text-xs md:text-sm">{t("auth.register")}</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4 mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs md:text-sm text-[#e0e0ff] mb-2 block">{t("auth.username")}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-[#00d9ff]" />
                    <Input
                      type="text"
                      placeholder={t("auth.enterUsername")}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 bg-[#0a0e27] border-[#2a2f4a] text-[#e0e0ff] placeholder-[#3d3d5c] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs md:text-sm text-[#e0e0ff] mb-2 block">{t("auth.password")}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-[#00d9ff]" />
                    <Input
                      type="password"
                      placeholder={t("auth.enterPassword")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-[#0a0e27] border-[#2a2f4a] text-[#e0e0ff] placeholder-[#3d3d5c] text-sm"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-2 rounded-lg transition-all duration-300 text-sm"
                >
                  {loading ? t("auth.loggingIn") : t("auth.loginButton")}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#2a2f4a]"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-[#1a1f3a] text-[#a0a0c0]">{t("auth.or")}</span>
                </div>
              </div>

              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="w-full bg-[#0a0e27] border border-[#2a2f4a] text-[#e0e0ff] hover:bg-[#1a1f3a] py-2 rounded-lg transition-all duration-300 text-sm"
              >
                <Mail className="w-4 h-4 mr-2" />
                {t("auth.continueWithGoogle")}
              </Button>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register" className="space-y-4 mt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-xs md:text-sm text-[#e0e0ff] mb-2 block">{t("auth.username")}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-[#00d9ff]" />
                    <Input
                      type="text"
                      placeholder={t("auth.chooseUsername")}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 bg-[#0a0e27] border-[#2a2f4a] text-[#e0e0ff] placeholder-[#3d3d5c] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs md:text-sm text-[#e0e0ff] mb-2 block">{t("auth.email")}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-[#00d9ff]" />
                    <Input
                      type="email"
                      placeholder={t("auth.enterEmail")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-[#0a0e27] border-[#2a2f4a] text-[#e0e0ff] placeholder-[#3d3d5c] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs md:text-sm text-[#e0e0ff] mb-2 block">{t("auth.password")}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-[#00d9ff]" />
                    <Input
                      type="password"
                      placeholder={t("auth.createPassword")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-[#0a0e27] border-[#2a2f4a] text-[#e0e0ff] placeholder-[#3d3d5c] text-sm"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-2 rounded-lg transition-all duration-300 text-sm"
                >
                  {loading ? t("auth.creatingAccount") : t("auth.registerButton")}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#2a2f4a]"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-[#1a1f3a] text-[#a0a0c0]">{t("auth.or")}</span>
                </div>
              </div>

              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="w-full bg-[#0a0e27] border border-[#2a2f4a] text-[#e0e0ff] hover:bg-[#1a1f3a] py-2 rounded-lg transition-all duration-300 text-sm"
              >
                <Mail className="w-4 h-4 mr-2" />
                {t("auth.signUpWithGoogle")}
              </Button>
            </TabsContent>
          </Tabs>

          <p className="text-center text-xs text-[#3d3d5c] mt-6">
            {t("auth.maxUsersPerIp")}
          </p>
        </div>
      </Card>
    </div>
  );
}
