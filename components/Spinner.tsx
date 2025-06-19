"use client";

interface SpinnerProps {
  className?: string;
}

export default function Spinner({ className }: SpinnerProps) {
  return (
    <span
      className={
        "inline-block animate-spin rounded-full border-t-transparent " +
        (className ?? "w-4 h-4 border-2")
      }
    />
  );
}
