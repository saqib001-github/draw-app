import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ display: "block", marginBottom: 4 }}>{label}</label>
      )}
      <input
        ref={ref}
        {...props}
        style={{
          padding: 8,
          border: error ? "1px solid red" : "1px solid #ccc",
          borderRadius: 4,
          width: "100%",
        }}
      />
      {error && <span style={{ color: "red", fontSize: 12 }}>{error}</span>}
    </div>
  )
);
Input.displayName = "Input";
