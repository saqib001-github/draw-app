interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  isLoading,
  className = "",
  ...props
}) => {
  const baseClasses =
    "px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50";
  const variantClasses = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
};
