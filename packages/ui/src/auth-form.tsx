import * as React from "react";
import { useState } from "react";
import {
  Mail as MailIcon,
  Lock as LockIcon,
  User as UserIcon,
  ArrowRight as ArrowRightIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
} from "lucide-react";

interface AuthFormProps {
  type: "login" | "signup";
  onSubmit: (data: { email: string; password: string; name?: string }) => void;
  loading: boolean;
  error?: string;
}

// Mock AuthForm component to demonstrate the design
export const AuthForm = ({ type, onSubmit, loading, error }: AuthFormProps) => {
  const [formData, setFormData] = useState<{
    email: string;
    password: string;
    name?: string;
  }>({
    email: "",
    password: "",
    name: type === "signup" ? "" : undefined,
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    field: "email" | "password" | "name",
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {type === "signup" && (
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="name"
              name="name"
              type="text"
              required={type === "signup"}
              value={formData.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-background text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your full name"
            />
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MailIcon className="h-4 w-4 text-gray-400" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-background text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Enter your email"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LockIcon className="h-4 w-4 text-gray-400" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            className="block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-background text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOffIcon className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            ) : (
              <EyeIcon className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg text-sm font-medium text-background bg-foreground hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></div>
        ) : (
          <>
            {type === "login" ? "Sign In" : "Create Account"}
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
};
