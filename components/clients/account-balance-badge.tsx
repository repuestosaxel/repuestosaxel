import { Badge } from "@/components/ui/badge";
import { getAccountBalanceLabel, getAccountBalanceState } from "@/lib/crm";
import { money } from "@/lib/utils";
import type { Customer } from "@/types/crm";

type AccountBalanceBadgeProps = {
  customer: Pick<Customer, "accountEnabled" | "balance">;
  showAmount?: boolean;
};

export function AccountBalanceBadge({ customer, showAmount = true }: AccountBalanceBadgeProps) {
  if (!customer.accountEnabled) {
    return <Badge variant="neutral">Sin cuenta corriente</Badge>;
  }

  const state = getAccountBalanceState(customer.balance);

  if (state === "clear") {
    return <Badge variant="success">{showAmount ? "Al día" : getAccountBalanceLabel(customer)}</Badge>;
  }

  if (state === "credit") {
    return (
      <Badge variant="success">
        {showAmount ? `Saldo ${money(customer.balance)}` : "Saldo a favor"}
      </Badge>
    );
  }

  return (
    <Badge variant="warning">
      {showAmount ? `Debe ${money(Math.abs(customer.balance))}` : "Con deuda"}
    </Badge>
  );
}
