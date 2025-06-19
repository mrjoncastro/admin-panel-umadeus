"use client";

<<<<<<< HEAD
export interface SpinnerProps {
  className?: string;
}

export default function Spinner({ className }: SpinnerProps) {
  return (
    <span
      className={`animate-spin rounded-full border-2 border-t-transparent border-current ${className ?? ""}`}
=======
export default function Spinner({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <span
      className={
        `${className} border-2 border-current border-t-transparent rounded-full animate-spin`
      }
>>>>>>> origin/codex/alterar-botão-para-exibir-spinner
    />
  );
}
