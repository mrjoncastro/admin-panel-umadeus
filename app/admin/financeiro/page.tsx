import { redirect } from "next/navigation";

export default function FinanceiroRedirect() {
  redirect("/admin/financeiro/saldo");
  return null;
}
