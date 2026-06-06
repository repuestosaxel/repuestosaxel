"use client";

import { useCallback, useMemo } from "react";

import { useGlobalSearch } from "@/contexts/global-search-context";

export function useEffectiveSearch(localSearch: string, setLocalSearch: (value: string) => void) {
  const { query: globalQuery, setQuery: setGlobalQuery, clearQuery } = useGlobalSearch();

  const effectiveQuery = useMemo(
    () => (localSearch.trim() || globalQuery.trim()).toLowerCase(),
    [localSearch, globalQuery]
  );

  const searchFieldValue = localSearch || globalQuery;

  const onSearchFieldChange = useCallback(
    (value: string) => {
      setLocalSearch(value);
      if (globalQuery) {
        setGlobalQuery("");
      }
    },
    [globalQuery, setGlobalQuery, setLocalSearch]
  );

  const clearSearch = useCallback(() => {
    setLocalSearch("");
    clearQuery();
  }, [clearQuery, setLocalSearch]);

  const isGlobalActive = !localSearch.trim() && Boolean(globalQuery.trim());

  return {
    effectiveQuery,
    searchFieldValue,
    onSearchFieldChange,
    clearSearch,
    isGlobalActive
  };
}
