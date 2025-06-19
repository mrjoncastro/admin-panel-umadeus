"use client";

interface SpinnerProps {
  className?: string;
}

export default function Spinner({ className }: SpinnerProps) {
  return (
    <span
      className={`w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ${className ?? ""}`}
    />
  );
}
