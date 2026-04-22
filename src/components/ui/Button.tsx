// src/components/ui/Button.tsx
// Reusable button component with variants.
// Using this instead of raw <button> tags keeps styling consistent.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  isLoading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  // Base styles applied to all variants
  const base =
    "inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  // Variant-specific styles
  const variants = {
    primary: "bg-green-800 text-white hover:bg-green-900 active:scale-95",
    secondary: "bg-stone-100 text-stone-800 hover:bg-stone-200 active:scale-95",
    danger: "bg-red-600 text-white hover:bg-red-700 active:scale-95",
    ghost: "text-green-800 hover:bg-green-50 active:scale-95",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Show spinner while loading, otherwise show children */}
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
}
