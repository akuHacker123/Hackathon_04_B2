import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`h-11 w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-900 dark:text-zinc-100 ${
            error
              ? "border-rose-500 focus-visible:ring-rose-500"
              : "border-zinc-300 focus-visible:ring-emerald-500 dark:border-zinc-700 dark:focus-visible:ring-emerald-500"
          } ${className}`.trim()}
          {...props}
        />
        {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
