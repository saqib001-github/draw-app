"use client";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { AuthForm } from "@repo/ui/auth-form";
import { Edit3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Login Page Component
const LoginPage = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const handleLogin = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    setLoading(true);
    setError("");

    try {
      const data = await api.login(email, password);
      console.log(data)
      setUser({
        id: data.data.user.id,
        email: data.data.user.email,
        token: data.data.token,
      });
      router.push("/rooms");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 dark:bg-gray-900/50 flex-col justify-center p-12">
        <div className="max-w-md">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-background" />
            </div>
            <span className="text-2xl font-bold">DrawFlow</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">
            Welcome back to your creative workspace
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Continue collaborating and bringing your ideas to life with your
            team.
          </p>
          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Real-time collaboration
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Unlimited canvases
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Export to multiple formats
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-background" />
            </div>
            <span className="text-xl font-bold">DrawFlow</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Sign in to your account</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Don't have an account?{" "}
              <button className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Sign up
              </button>
            </p>
          </div>

          <AuthForm
            type="login"
            onSubmit={handleLogin}
            loading={loading}
            error={error}
          />

          <div className="mt-6 text-center">
            <button className="text-sm text-gray-600 dark:text-gray-300 hover:text-foreground transition-colors">
              Forgot your password?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;