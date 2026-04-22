// src/components/ui/Input.tsx
// Reusable text input with label and error message support.

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {/* Show label if provided */}
      {label && (
        <label className="text-sm font-medium text-stone-700">{label}</label>
      )}
      <input
        className={`
          w-full px-4 py-2.5 rounded-xl border text-sm
          bg-white text-stone-900 placeholder:text-stone-400
          focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent
          disabled:bg-stone-50 disabled:cursor-not-allowed
          ${error ? "border-red-400" : "border-stone-200"}
          ${className}
        `}
        {...props}
      />
      {/* Show error message if provided */}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
