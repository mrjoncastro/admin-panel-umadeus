"use client";

interface SpinnerProps {
  className?: string;
}

export default function Spinner({ className }: SpinnerProps) {
  return (
    <span
<<<<<<< HEAD
      className={
        "inline-block animate-spin rounded-full border-t-transparent " +
        (className ?? "w-4 h-4 border-2")
      }
=======
      className={`w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ${className ?? ""}`}
>>>>>>> origin/codex/adicionar-spinner-no-botão-com-loading
    />
  );
}
