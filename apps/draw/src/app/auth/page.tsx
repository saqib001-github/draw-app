"use client";
import LoginPage from "@/components/LoginPage";
import SignupPage from "@/components/SignUpPage";
import { useState } from "react";

export default function AuthPages() {
  const [currentPage, setCurrentPage] = useState("login");

  return (
    <div className="bg-background text-foreground">
      <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1 shadow-sm">
        <button
          onClick={() => setCurrentPage("login")}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            currentPage === "login"
              ? "bg-foreground text-background"
              : "hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          Login
        </button>
        <button
          onClick={() => setCurrentPage("signup")}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            currentPage === "signup"
              ? "bg-foreground text-background"
              : "hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          Signup
        </button>
      </div>

      {currentPage === "login" ? <LoginPage /> : <SignupPage />}
    </div>
  );
}