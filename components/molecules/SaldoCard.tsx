"use client";

interface SaldoCardProps {
  saldo: number;
  className?: string;
}

function cn(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function SaldoCard({ saldo, className }: SaldoCardProps) {
  return (
    <div className={cn("card text-center", className)}>
      <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-300">
        Saldo Disponível
      </h3>
      <p className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">
        R$ {saldo.toFixed(2)}
      </p>
    </div>
  );
}
