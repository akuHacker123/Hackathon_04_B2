import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "outline";
}

export function Badge({
  children,
  className = "",
  variant = "default",
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide";

  const variantStyles = {
    default:
      "bg-zinc-100 text-zinc-800 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700",
    success:
      "bg-zinc-900 text-white border border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100",
    warning:
      "bg-zinc-200 text-zinc-900 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700",
    danger:
      "bg-zinc-900 text-white border border-zinc-800 dark:bg-zinc-200 dark:text-zinc-900 dark:border-zinc-300",
    outline:
      "border border-zinc-400 text-zinc-800 dark:border-zinc-600 dark:text-zinc-200",
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  );
}
