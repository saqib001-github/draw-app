import React, { useState } from "react";
import { Input } from "./Input";
import { Button } from "./button";

export interface AuthFormProps {
  type: "login" | "signup";
  onSubmit: (data: {
    email: string;
    password: string;
    name?: string;
  }) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  type,
  onSubmit,
  loading,
  error,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      email,
      password,
      name: type === "signup" ? name : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: "0 auto" }}>
      {type === "signup" && (
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      )}
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
      <Button type="submit" disabled={loading}>
        {loading ? "Loading..." : type === "login" ? "Login" : "Sign Up"}
      </Button>
    </form>
  );
};
