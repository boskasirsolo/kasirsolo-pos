"use client";

import { useState, useCallback } from "react";
import type { ClientFilter } from "../data/types";
import type { KspClientStatus } from "@kasirsolo/db/types";

const defaultFilter: ClientFilter = {
  search: "",
  status: "all",
  source: "all",
  sortBy: "created_at",
  sortOrder: "desc",
  page: 1,
  perPage: 15,
};

export function useClientFilter() {
  const [filter, setFilter] = useState<ClientFilter>(defaultFilter);

  const setSearch = useCallback((search: string) => {
    setFilter((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const setStatus = useCallback((status: KspClientStatus | "all") => {
    setFilter((prev) => ({ ...prev, status, page: 1 }));
  }, []);

  const setSource = useCallback((source: string | "all") => {
    setFilter((prev) => ({ ...prev, source, page: 1 }));
  }, []);

  const setSort = useCallback(
    (sortBy: ClientFilter["sortBy"], sortOrder?: ClientFilter["sortOrder"]) => {
      setFilter((prev) => ({
        ...prev,
        sortBy,
        sortOrder: sortOrder ?? (prev.sortBy === sortBy && prev.sortOrder === "asc" ? "desc" : "asc"),
      }));
    },
    []
  );

  const setPage = useCallback((page: number) => {
    setFilter((prev) => ({ ...prev, page }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilter(defaultFilter);
  }, []);

  return {
    filter,
    setSearch,
    setStatus,
    setSource,
    setSort,
    setPage,
    resetFilter,
  };
}
