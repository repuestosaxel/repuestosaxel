"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";

type GlobalSearchContextValue = {
  query: string;
  setQuery: (query: string) => void;
  clearQuery: () => void;
};

const GlobalSearchContext = createContext<GlobalSearchContextValue | null>(null);

export function GlobalSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");

  const clearQuery = useCallback(() => setQuery(""), []);

  const value = useMemo(
    () => ({
      query,
      setQuery,
      clearQuery
    }),
    [query, clearQuery]
  );

  return (
    <GlobalSearchContext.Provider value={value}>{children}</GlobalSearchContext.Provider>
  );
}

export function useGlobalSearch() {
  const context = useContext(GlobalSearchContext);

  if (!context) {
    throw new Error("useGlobalSearch debe usarse dentro de GlobalSearchProvider");
  }

  return context;
}
