"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@repo/ui/auth-form";
import { useAuthStore } from "@/store/auth";
import { api } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <AuthForm
          type="login"
          onSubmit={handleLogin}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
}
