"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

import { api } from "@/lib/api/client";
import type { CreateExpenseInput, Expense, FinanceSummary } from "@/types/finance";

type FinancePayload = {
  summary: FinanceSummary;
  expenses: Expense[];
};

type FinanceContextValue = {
  expenses: Expense[];
  summary: FinanceSummary | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addExpense: (input: CreateExpenseInput) => Promise<Expense>;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const data = await api.get<FinancePayload>("/api/finance");
      setExpenses(data.expenses);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las finanzas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addExpense = useCallback(async (input: CreateExpenseInput) => {
    const expense = await api.post<Expense>("/api/finance", input);
    setExpenses((current) => [expense, ...current]);
    await refresh();
    return expense;
  }, [refresh]);

  const value = useMemo(
    () => ({
      expenses,
      summary,
      loading,
      error,
      refresh,
      addExpense
    }),
    [expenses, summary, loading, error, refresh, addExpense]
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);

  if (!context) {
    throw new Error("useFinance debe usarse dentro de FinanceProvider");
  }

  return context;
}
