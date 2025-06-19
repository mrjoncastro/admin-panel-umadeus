"use client";

export interface SpinnerProps {
  className?: string;
}

export default function Spinner({ className }: SpinnerProps) {
  return (
    <span
      className={`animate-spin rounded-full border-2 border-t-transparent border-current ${className ?? ""}`}
    />
  );
}
