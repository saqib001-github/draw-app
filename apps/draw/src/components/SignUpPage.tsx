"use client";
import { useState } from "react";
import { AuthForm } from "@repo/ui/auth-form";
import { Edit3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { api } from "@/services/api";

// Signup Page Component
const SignupPage = () => {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async ({
    email,
    password,
    name,
  }: {
    email: string;
    password: string;
    name?: string;
  }) => {
    setLoading(true);
    setError("");

    try {
      const data = await api.signup(email, password, name || "");
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
            Start your creative journey today
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of teams already using DrawFlow to collaborate and
            create amazing visual content.
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              What you get:
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Unlimited free canvases
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                Real-time collaboration
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                Export and sharing tools
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-background" />
            </div>
            <span className="text-xl font-bold">DrawFlow</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Create your account</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Already have an account?{" "}
              <button className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Sign in
              </button>
            </p>
          </div>

          <AuthForm
            type="signup"
            onSubmit={handleSignup}
            loading={loading}
            error={error}
          />

          <div className="mt-6 text-center text-xs text-gray-600 dark:text-gray-300">
            By creating an account, you agree to our{" "}
            <button className="hover:underline">Terms of Service</button> and{" "}
            <button className="hover:underline">Privacy Policy</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;