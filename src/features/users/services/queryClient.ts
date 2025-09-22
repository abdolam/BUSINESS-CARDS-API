import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // reduce refetch churn
      gcTime: 5 * 60_000, // v5 name for cacheTime
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0, // why: avoid double-submits on forms
    },
  },
});
