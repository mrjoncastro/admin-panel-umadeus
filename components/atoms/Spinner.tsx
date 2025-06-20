"use client";

interface SpinnerProps {
  className?: string;
}

export default function Spinner({ className }: SpinnerProps) {
  return (
    <span
      className={`border-2 border-current border-t-transparent rounded-full animate-spin ${className ?? ""}`}
    />
  );
}
